from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from apps.annonces.models import Annonce
from apps.historique.models import Historique

from .models import MiseEnRelation
from .serializers import DeclencherMiseEnRelationSerializer, MiseEnRelationDetailSerializer
from .services import ServiceExpirationMiseEnRelation


@api_view(['POST'])
def declencher_mise_en_relation(request):
    """"Oui, c'est moi" -- section 8.4. Démarre le délai de 72h."""
    ServiceExpirationMiseEnRelation().nettoyer()

    serializer = DeclencherMiseEnRelationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    mise_en_relation = serializer.save()

    return Response(
        MiseEnRelationDetailSerializer(mise_en_relation).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
def confirmer_restitution(request, mise_en_relation_id):
    """
    Confirmation par le bénéficiaire uniquement (section 7.D, choix
    simplifié) : dès cette confirmation, la mise en relation est prête
    pour la clôture administrateur.
    """
    ServiceExpirationMiseEnRelation().nettoyer()

    mise_en_relation = get_object_or_404(MiseEnRelation, id=mise_en_relation_id)

    if mise_en_relation.est_expiree():
        return Response(
            {"erreur": "Le délai de 72h est expiré, cette mise en relation n'est plus active."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    mise_en_relation.confirmation_beneficiaire = True
    mise_en_relation.save()

    Historique.enregistrer(
        utilisateur=mise_en_relation.beneficiaire,
        type_action=Historique.TypeAction.RESTITUTION,
        description=f"Restitution confirmée par le bénéficiaire pour l'annonce #{mise_en_relation.annonce.id}",
    )

    return Response(MiseEnRelationDetailSerializer(mise_en_relation).data)