from rest_framework import serializers

from apps.annonces.models import Annonce
from apps.utilisateurs.models import Utilisateur

from .models import MiseEnRelation


class DeclencherMiseEnRelationSerializer(serializers.Serializer):
    """
    "Oui, c'est moi" (section 6.2, section 8.4) : le bénéficiaire
    consulte les coordonnées du déclarant pour une annonce donnée.
    Déclenche l'expiration automatique à 72h (gérée par le modèle
    MiseEnRelation.save()).
    """

    annonce_id = serializers.IntegerField()
    telephone_beneficiaire = serializers.CharField()

    def validate_annonce_id(self, value):
        if not Annonce.objects.filter(id=value, statut=Annonce.StatutAnnonce.PUBLIEE).exists():
            raise serializers.ValidationError("Annonce introuvable ou non publiée.")
        return value

    def validate_telephone_beneficiaire(self, value):
        if not Utilisateur.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Ce numéro n'est pas inscrit.")
        return value

    def validate(self, donnees):
        """Une seule mise en relation active à la fois par annonce (contrainte OneToOne du modèle)."""
        annonce_id = donnees['annonce_id']
        if MiseEnRelation.objects.filter(annonce_id=annonce_id).exists():
            raise serializers.ValidationError(
                "Cette annonce est déjà en cours de restitution avec un autre bénéficiaire."
            )
        return donnees

    def create(self, donnees_validees):
        annonce = Annonce.objects.get(id=donnees_validees['annonce_id'])
        beneficiaire = Utilisateur.objects.get(telephone=donnees_validees['telephone_beneficiaire'])

        mise_en_relation = MiseEnRelation.objects.create(annonce=annonce, beneficiaire=beneficiaire)

        annonce.statut = Annonce.StatutAnnonce.EN_COURS_RESTITUTION
        annonce.save()

        return mise_en_relation


class MiseEnRelationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = MiseEnRelation
        fields = [
            'id', 'annonce', 'beneficiaire', 'confirmation_declarant',
            'confirmation_beneficiaire', 'date_expiration', 'date_creation',
        ]
        read_only_fields = fields


class ConfirmationSerializer(serializers.Serializer):
    """Confirmation de restitution par le bénéficiaire uniquement (section 7.D, choix simplifié)."""
    pass