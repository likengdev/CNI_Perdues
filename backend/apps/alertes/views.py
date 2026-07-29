from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import AlerteDetailSerializer, CreerAlerteSerializer


@api_view(['POST'])
def creer_alerte(request):
    """
    Section 8.5 : le bénéficiaire enregistre une alerte quand sa
    recherche ne donne rien. Il sera notifié plus tard si une annonce
    correspondante est validée par l'administrateur.
    """
    serializer = CreerAlerteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    alerte = serializer.save()

    return Response(
        AlerteDetailSerializer(alerte).data,
        status=status.HTTP_201_CREATED,
    )