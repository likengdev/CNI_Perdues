from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from .serializers import ExtractionCNISerializer
from .services import ServiceExtractionCNI


@api_view(['POST'])
@parser_classes([MultiPartParser])
def extraire_informations_cni(request):
    """
    Étape 1 du parcours déclarant (section 6.1, étapes 4-6) : le système
    photographie recto/verso et extrait automatiquement les informations.
    Rien n'est encore enregistré en base ici — le déclarant vérifie et
    corrige avant la publication définitive (endpoint séparé, à venir).
    """
    serializer = ExtractionCNISerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    service = ServiceExtractionCNI(
        image_recto=serializer.validated_data['photo_recto'],
        image_verso=serializer.validated_data['photo_verso'],
    )
    donnees_extraites = service.extraire()

    return Response(donnees_extraites, status=status.HTTP_200_OK)