from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
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


@api_view(['POST'])
@parser_classes([MultiPartParser])
def extraire_informations_cni(request):
    """
    Étape 1 du parcours déclarant (section 6.1, étapes 4-6) : extraction
    docTR, prévisualisation avant publication définitive. Rien n'est
    encore enregistré en base ici.
    """
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
    """
    Recherche d'annonces publiées par nom/prénom (section 7.C). Le
    paramètre optionnel date_naissance permet d'affiner en cas
    d'homonymie (plusieurs personnes portant le même nom/prénom).
    Seules les annonces au statut "publiee" sont visibles.
    """
    ServiceExpirationMiseEnRelation().nettoyer()

    nom = request.query_params.get('nom', '').strip()
    prenom = request.query_params.get('prenom', '').strip()
    date_naissance = request.query_params.get('date_naissance', '').strip()

    resultats = Annonce.objects.filter(statut=Annonce.StatutAnnonce.PUBLIEE)

    if nom:
        resultats = resultats.filter(nom_titulaire__icontains=nom)
    if prenom:
        resultats = resultats.filter(prenom_titulaire__icontains=prenom)
    if date_naissance:
        resultats = resultats.filter(date_naissance=date_naissance)

    serializer = RechercheAnnonceSerializer(resultats, many=True)
    return Response(serializer.data)