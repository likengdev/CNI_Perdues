from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from apps.mise_en_relation.services import ServiceExpirationMiseEnRelation
from .serializers import RejetAnnonceSerializer


from django.db.models import Q
from .serializers import RechercheAnnonceSerializer

from .serializers import (
    AnnonceDetailSerializer,
    ExtractionCNIResultSerializer,
    ExtractionCNISerializer,
    PublicationAnnonceSerializer,
)
from .services.pipeline import PipelineExtractionCNI


@api_view(['POST'])
@parser_classes([MultiPartParser])
def extraire_informations_cni(request):
    """Étape 1 du parcours déclarant : extraction docTR, prévisualisation avant publication."""
    serializer = ExtractionCNISerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    pipeline = PipelineExtractionCNI()
    donnees_extraites = pipeline.executer(
        fichier_recto=serializer.validated_data['photo_recto'],
        fichier_verso=serializer.validated_data['photo_verso'],
    )

    resultat = ExtractionCNIResultSerializer(donnees_extraites)
    return Response(resultat.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@parser_classes([MultiPartParser])
def publier_annonce(request):
    """Étape finale : position de la CNI renseignée par le déclarant + enregistrement, statut 'en_attente'."""
    serializer = PublicationAnnonceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    annonce = serializer.save()

    return Response(AnnonceDetailSerializer(annonce).data, status=status.HTTP_201_CREATED)



@api_view(['GET'])
def rechercher_annonces(request):
    """
    Recherche d'annonces publiées par nom/prénom (section 7.C).
    Seules les annonces au statut "publiee" sont visibles -- une
    annonce en attente ou rejetée ne doit jamais apparaître.
    """
    ServiceExpirationMiseEnRelation().nettoyer()
    nom = request.query_params.get('nom', '').strip()
    prenom = request.query_params.get('prenom', '').strip()

    resultats = Annonce.objects.filter(statut=Annonce.StatutAnnonce.PUBLIEE)

    if nom:
        resultats = resultats.filter(nom_titulaire__icontains=nom)
    if prenom:
        resultats = resultats.filter(prenom_titulaire__icontains=prenom)

    serializer = RechercheAnnonceSerializer(resultats, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def valider_annonce(request, annonce_id):
    """Validation par l'administrateur (section 7.G) : l'annonce devient visible dans les recherches."""
    annonce = get_object_or_404(Annonce, id=annonce_id)
    annonce.statut = Annonce.StatutAnnonce.PUBLIEE
    annonce.save()

    return Response(AnnonceDetailSerializer(annonce).data)


@api_view(['POST'])
def rejeter_annonce(request, annonce_id):
    """Rejet par l'administrateur (section 7.G), avec motif obligatoire."""
    annonce = get_object_or_404(Annonce, id=annonce_id)

    serializer = RejetAnnonceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    annonce.statut = Annonce.StatutAnnonce.REJETEE
    annonce.motif_rejet = serializer.validated_data['motif_rejet']
    annonce.save()

    return Response(AnnonceDetailSerializer(annonce).data)