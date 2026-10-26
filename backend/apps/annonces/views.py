from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, throttle_classes
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView
from apps.administration.permissions import EstAdministrateurAuthentifie
from apps.alertes.models import AlerteRecherche
from apps.historique.models import Historique
from apps.mise_en_relation.services import ServiceExpirationMiseEnRelation

from .models import Annonce
from .serializers import (
    AnnonceDetailSerializer,
    ExtractionCNIResultSerializer,
    ExtractionCNISerializer,
    PublicationAnnonceSerializer,
    RechercheAnnonceSerializer,
    RejetAnnonceSerializer,
)
from .services.pipeline import PipelineExtractionCNI


class ExtractionThrottle(SimpleRateThrottle):
    """
    Limite le nombre d'extractions par adresse IP pour éviter un
    abus de la ressource OCR (coûteuse en calcul).
    """
    scope = 'extraction'

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}


@api_view(['POST'])
@parser_classes([MultiPartParser])
@throttle_classes([ExtractionThrottle])
def extraire_informations_cni(request):
    """
    Étape 1 du parcours déclarant : extraction docTR, prévisualisation.
    """
    serializer = ExtractionCNISerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    donnees = serializer.validated_data
    type_document = donnees.get('type_document') or 'cni'
    photo_recto = donnees['photo_recto']
    photo_verso = donnees.get('photo_verso')

    pipeline = PipelineExtractionCNI()
    donnees_extraites = pipeline.executer(
        fichier_recto=photo_recto,
        fichier_verso=photo_verso,
        type_document=type_document,
    )

    resultat = ExtractionCNIResultSerializer(donnees_extraites)
    return Response(resultat.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@parser_classes([MultiPartParser])
def publier_annonce(request):
    """
    Étape finale du parcours déclarant (section 6.1, étapes 7-8) :
    position de la CNI renseignée par le déclarant, enregistrement
    avec le statut "en_attente", en attente de validation admin.
    """
    serializer = PublicationAnnonceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    annonce = serializer.save()

    return Response(
        AnnonceDetailSerializer(annonce).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
def rechercher_annonces(request):
    """Recherche d'annonces publiées."""
    from rest_framework.exceptions import ValidationError

    ServiceExpirationMiseEnRelation().nettoyer()

    import re
    normaliser = lambda v: re.sub(r'\s+', ' ', v).strip() if v else ''
    nom = normaliser(request.query_params.get('nom', ''))
    prenom = normaliser(request.query_params.get('prenom', ''))
    date_naissance = request.query_params.get('date_naissance', '').strip()
    numero_carte = request.query_params.get('numero_carte', '') or request.query_params.get('numero', '')
    numero_carte = normaliser(numero_carte).upper().replace('<', '').replace(' ', '')
    type_document = normaliser(request.query_params.get('type_document', '')).lower()

    if not any([nom, prenom, date_naissance, numero_carte]):
        return Response({'detail': 'Au moins un critère de recherche est requis.'}, status=status.HTTP_400_BAD_REQUEST)

    resultats = Annonce.objects.filter(statut=Annonce.StatutAnnonce.PUBLIEE)

    if type_document in ['cni', 'passeport']:
        resultats = resultats.filter(type_document=type_document)
    if nom:
        resultats = resultats.filter(nom_titulaire__icontains=nom)
    if prenom:
        resultats = resultats.filter(prenom_titulaire__icontains=prenom)
    if date_naissance:
        resultats = resultats.filter(date_naissance=date_naissance)
    if numero_carte:
        resultats = resultats.filter(numero_carte__iexact=numero_carte)

    serializer = RechercheAnnonceSerializer(resultats, many=True)

    telephone = request.query_params.get('telephone', '').strip()
    if telephone:
        from apps.utilisateurs.models import Utilisateur
        utilisateur = Utilisateur.objects.filter(telephone=telephone).first()
        if utilisateur and resultats.exists():
            critere = []
            if nom:
                critere.append(f"nom={nom}")
            if prenom:
                critere.append(f"prénom={prenom}")
            if date_naissance:
                critere.append(f"date={date_naissance}")
            if numero_carte:
                critere.append(f"numero={numero_carte}")
            if type_document:
                critere.append(f"type={type_document}")
            libelle = 'document' if type_document == 'passeport' else 'CNI'
            Historique.enregistrer(
                utilisateur=utilisateur,
                type_action=Historique.TypeAction.CONSULTATION,
                description=f"Recherche de {libelle} effectuée ({', '.join(critere) if critere else 'aucun critère'})",
            )

    return Response(serializer.data)


class ValiderAnnonceView(APIView):
    """
    Validation d'une annonce en attente par l'administrateur (section 7.G).
    L'annonce passe au statut 'publiee' et devient visible dans la
    recherche publique. L'action est journalisée dans l'historique.
    """

    permission_classes = [EstAdministrateurAuthentifie]

    def post(self, request, pk):
        annonce = get_object_or_404(Annonce, pk=pk)

        if annonce.statut != Annonce.StatutAnnonce.EN_ATTENTE:
            return Response(
                {"detail": "Cette annonce n'est pas en attente de validation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        annonce.statut = Annonce.StatutAnnonce.PUBLIEE
        annonce.save(update_fields=['statut', 'date_modification'])

        libelle_doc = 'passeport' if annonce.type_document == 'passeport' else 'CNI'
        declarant = annonce.declarant
        Historique.enregistrer(
            utilisateur=declarant,
            type_action=Historique.TypeAction.VALIDATION,
            description=f"{libelle_doc} #{annonce.id} validé(e) par l'administrateur",
        )

        return Response(
            AnnonceDetailSerializer(annonce).data,
            status=status.HTTP_200_OK,
        )


class RejeterAnnonceView(APIView):
    """
    Rejet d'une annonce en attente par l'administrateur (section 7.G).
    Le motif de rejet est obligatoire (RejetAnnonceSerializer) et
    conservé sur l'annonce. L'action est journalisée dans l'historique.
    """

    permission_classes = [EstAdministrateurAuthentifie]

    def post(self, request, pk):
        annonce = get_object_or_404(Annonce, pk=pk)

        if annonce.statut != Annonce.StatutAnnonce.EN_ATTENTE:
            return Response(
                {"detail": "Cette annonce n'est pas en attente de validation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RejetAnnonceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        motif = serializer.validated_data['motif_rejet'].strip()

        annonce.statut = Annonce.StatutAnnonce.REJETEE
        annonce.motif_rejet = motif
        annonce.save(update_fields=['statut', 'motif_rejet', 'date_modification'])

        libelle_doc = 'passeport' if annonce.type_document == 'passeport' else 'CNI'
        libelle_doc = 'passeport' if annonce.type_document == 'passeport' else 'CNI'
        Historique.enregistrer(
            utilisateur=annonce.declarant,
            type_action=Historique.TypeAction.REJET,
            description=f"{libelle_doc} #{annonce.id} rejeté(e) par l'administrateur (motif : {motif})",
        )

        return Response(
            AnnonceDetailSerializer(annonce).data,
            status=status.HTTP_200_OK,
        )