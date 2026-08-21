from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from apps.annonces.models import Annonce
from apps.historique.models import Historique

from apps.administration.permissions import EstAdministrateurAuthentifie

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

    return Response(MiseEnRelationDetailSerializer(mise_en_relation).data)


@api_view(['POST'])
@permission_classes([EstAdministrateurAuthentifie])
def cloturer_mise_en_relation(request, mise_en_relation_id):
    """
    Clôture de la restitution par l'administrateur (section 8.4).
    Possible uniquement après la confirmation du bénéficiaire : la
    mise en relation est archivée (cloture_administrateur, date_cloture)
    et l'annonce passe au statut "restituee".
    """
    ServiceExpirationMiseEnRelation().nettoyer()

    mise_en_relation = get_object_or_404(MiseEnRelation, id=mise_en_relation_id)

    if mise_en_relation.cloture_administrateur:
        return Response(
            {"detail": "Cette restitution est déjà clôturée."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not mise_en_relation.confirmation_beneficiaire:
        return Response(
            {"detail": "La restitution doit d'abord être confirmée par le bénéficiaire."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    mise_en_relation.cloture_administrateur = True
    mise_en_relation.date_cloture = timezone.now()
    mise_en_relation.save(update_fields=['cloture_administrateur', 'date_cloture', 'date_modification'])

    annonce = mise_en_relation.annonce
    annonce.statut = Annonce.StatutAnnonce.RESTITUEE
    annonce.save(update_fields=['statut', 'date_modification'])

    Historique.enregistrer(
        utilisateur=mise_en_relation.beneficiaire,
        type_action=Historique.TypeAction.RESTITUTION,
        description=f"Restitution clôturée par l'administrateur pour l'annonce #{annonce.id}",
    )

    return Response(MiseEnRelationDetailSerializer(mise_en_relation).data)