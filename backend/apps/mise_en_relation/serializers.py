from rest_framework import serializers

from apps.annonces.models import Annonce
from apps.core.notifications.whatsapp import ServiceNotificationWhatsApp
from apps.historique.models import Historique
from apps.utilisateurs.models import Utilisateur

from .models import MiseEnRelation


class DeclencherMiseEnRelationSerializer(serializers.Serializer):
    """
    "Oui, c'est moi" (section 6.2, section 8.4) : le bénéficiaire
    consulte les coordonnées du déclarant pour une annonce donnée.
    Déclenche l'expiration automatique à 72h et notifie le déclarant
    par WhatsApp (lien wa.me).
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

        lien = ServiceNotificationWhatsApp().generer_lien(
            telephone=annonce.declarant.telephone,
            message=(
                f"Bonjour {annonce.declarant.prenom}, quelqu'un affirme être le "
                f"titulaire de la CNI que vous avez déclarée. Connectez-vous à la "
                f"plateforme pour voir ses coordonnées."
            ),
        )
        mise_en_relation.notification_whatsapp_envoyee = True
        mise_en_relation.save()

        Historique.enregistrer(
            utilisateur=beneficiaire,
            type_action=Historique.TypeAction.AUTRE,
            description=f"Mise en relation déclenchée pour l'annonce #{annonce.id} (lien WhatsApp : {lien})",
        )

        return mise_en_relation


class MiseEnRelationDetailSerializer(serializers.ModelSerializer):
    """
    Page privée du bénéficiaire une fois "Oui, c'est moi" confirmé :
    toutes les informations de l'annonce (pour qu'il vérifie que c'est
    bien sa carte) + les coordonnées du déclarant pour le contacter.
    """

    annonce_id = serializers.IntegerField(source='annonce.id', read_only=True)
    annonce_nom_titulaire = serializers.CharField(source='annonce.nom_titulaire', read_only=True)
    annonce_prenom_titulaire = serializers.CharField(source='annonce.prenom_titulaire', read_only=True)
    annonce_date_naissance = serializers.DateField(source='annonce.date_naissance', read_only=True)
    annonce_lieu_naissance = serializers.CharField(source='annonce.lieu_naissance', read_only=True)
    annonce_numero_carte = serializers.CharField(source='annonce.numero_carte', read_only=True)
    annonce_photo_titulaire = serializers.ImageField(source='annonce.photo_titulaire', read_only=True)

    declarant_nom = serializers.CharField(source='annonce.declarant.nom', read_only=True)
    declarant_prenom = serializers.CharField(source='annonce.declarant.prenom', read_only=True)
    declarant_telephone = serializers.CharField(source='annonce.declarant.telephone', read_only=True)

    beneficiaire_nom = serializers.CharField(source='beneficiaire.nom', read_only=True)
    beneficiaire_prenom = serializers.CharField(source='beneficiaire.prenom', read_only=True)
    beneficiaire_telephone = serializers.CharField(source='beneficiaire.telephone', read_only=True)

    class Meta:
        model = MiseEnRelation
        fields = [
            'id', 'confirmation_beneficiaire', 'cloture_administrateur',
            'date_expiration', 'date_creation',
            'annonce_id', 'annonce_nom_titulaire', 'annonce_prenom_titulaire',
            'annonce_date_naissance', 'annonce_lieu_naissance',
            'annonce_numero_carte', 'annonce_photo_titulaire',
            'declarant_nom', 'declarant_prenom', 'declarant_telephone',
            'beneficiaire_nom', 'beneficiaire_prenom', 'beneficiaire_telephone',
        ]
        read_only_fields = fields