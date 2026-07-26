import base64
import uuid

from django.core.files.base import ContentFile
from rest_framework import serializers

from apps.utilisateurs.models import Utilisateur

from .models import Annonce


class ExtractionCNISerializer(serializers.Serializer):
    photo_recto = serializers.ImageField()
    photo_verso = serializers.ImageField()


class ExtractionCNIResultSerializer(serializers.Serializer):
    nom_titulaire = serializers.CharField(allow_blank=True)
    prenom_titulaire = serializers.CharField(allow_blank=True)
    date_naissance = serializers.CharField(allow_blank=True)
    lieu_naissance = serializers.CharField(allow_blank=True)
    numero_carte = serializers.CharField(allow_blank=True)
    photo_titulaire_base64 = serializers.CharField(allow_blank=True)


class PublicationAnnonceSerializer(serializers.ModelSerializer):
    """Étape finale du parcours déclarant : position de la CNI + enregistrement (section 6.1, étapes 7-8)."""

    telephone_declarant = serializers.CharField(write_only=True)
    photo_titulaire_base64 = serializers.CharField(write_only=True)

    class Meta:
        model = Annonce
        fields = [
            'telephone_declarant', 'photo_recto', 'photo_verso',
            'nom_titulaire', 'prenom_titulaire', 'date_naissance',
            'lieu_naissance', 'numero_carte', 'photo_titulaire_base64',
            'position_cni', 'position_precision',
        ]

    def validate_telephone_declarant(self, value):
        if not Utilisateur.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Ce numéro n'est pas inscrit. Veuillez d'abord vous inscrire.")
        return value

    def validate(self, donnees):
        if donnees.get('position_cni') == Annonce.PositionCNI.AUTRE and not donnees.get('position_precision'):
            raise serializers.ValidationError({
                "position_precision": "Obligatoire lorsque 'Autre lieu' est sélectionné."
            })
        return donnees

    def create(self, donnees_validees):
        telephone = donnees_validees.pop('telephone_declarant')
        photo_base64 = donnees_validees.pop('photo_titulaire_base64')

        declarant = Utilisateur.objects.get(telephone=telephone)
        photo_titulaire = ContentFile(base64.b64decode(photo_base64), name=f"{uuid.uuid4()}.jpg")

        return Annonce.objects.create(declarant=declarant, photo_titulaire=photo_titulaire, **donnees_validees)


class AnnonceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annonce
        fields = [
            'id', 'nom_titulaire', 'prenom_titulaire', 'date_naissance',
            'lieu_naissance', 'numero_carte', 'position_cni',
            'position_precision', 'statut', 'date_creation',
        ]
        read_only_fields = fields