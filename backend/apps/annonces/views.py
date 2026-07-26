from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

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