import base64
import uuid
from datetime import datetime

from django.core.files.base import ContentFile
from rest_framework import serializers

from apps.historique.models import Historique
from apps.utilisateurs.models import Utilisateur

from .models import Annonce


def normaliser_date_naissance(valeur):
    """Convertit JJ.MM.AAAA ou AAAA-MM-JJ en date Python."""
    if not valeur:
        raise serializers.ValidationError("La date de naissance est obligatoire.")
    if hasattr(valeur, 'year'):
        return valeur
    texte = str(valeur).strip()
    for fmt in ('%Y-%m-%d', '%d.%m.%Y', '%d/%m/%Y'):
        try:
            return datetime.strptime(texte, fmt).date()
        except ValueError:
            continue
    raise serializers.ValidationError(
        "Format de date invalide. Utilisez AAAA-MM-JJ (ex : 1990-08-15)."
    )


class ExtractionCNISerializer(serializers.Serializer):
    """
    Reçoit uniquement les deux photos (pas encore une Annonce complète) :
    sert à l'étape d'extraction/prévisualisation avant publication
    définitive (section 6.1, étapes 4-6).
    """

    photo_recto = serializers.ImageField()
    photo_verso = serializers.ImageField()


class ExtractionCNIResultSerializer(serializers.Serializer):
    """
    Résultat de l'extraction, envoyé au déclarant pour vérification/
    correction avant publication définitive (section 6.1, étape 6).
    Champs non obligatoires : un champ vide signifie que l'extraction
    automatique a échoué sur ce champ précis, à corriger manuellement.
    """

    nom_titulaire = serializers.CharField(allow_blank=True)
    prenom_titulaire = serializers.CharField(allow_blank=True)
    date_naissance = serializers.CharField(allow_blank=True)
    lieu_naissance = serializers.CharField(allow_blank=True)
    numero_carte = serializers.CharField(allow_blank=True)
    photo_titulaire_base64 = serializers.CharField(allow_blank=True)


class PublicationAnnonceSerializer(serializers.ModelSerializer):
    """
    Étape finale du parcours déclarant (section 6.1, étapes 7-8) :
    enregistre l'annonce en base une fois que le déclarant a vérifié/
    corrigé les champs extraits et choisi la position de la CNI.
    """

    telephone_declarant = serializers.CharField(write_only=True)
    photo_titulaire_base64 = serializers.CharField(write_only=True, allow_blank=False)
    date_naissance = serializers.CharField()

    class Meta:
        model = Annonce
        fields = [
            'telephone_declarant', 'photo_recto', 'photo_verso',
            'nom_titulaire', 'prenom_titulaire', 'date_naissance',
            'lieu_naissance', 'numero_carte', 'photo_titulaire_base64',
            'position_cni', 'position_precision',
        ]

    def validate_telephone_declarant(self, value):
        utilisateur = Utilisateur.objects.filter(telephone=value).first()
        if not utilisateur:
            raise serializers.ValidationError(
                "Ce numéro n'est pas inscrit. Veuillez d'abord vous inscrire."
            )
        if not utilisateur.peut_publier_annonce():
            raise serializers.ValidationError(
                "Complétez votre profil (ville et quartier) avant de publier."
            )
        return value

    def validate_date_naissance(self, value):
        return normaliser_date_naissance(value)

    def validate_photo_titulaire_base64(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError(
                "La photo du titulaire est obligatoire. Reprenez l'extraction ou ajoutez-la manuellement."
            )
        return value

    def validate(self, donnees):
        if donnees.get('position_cni') == Annonce.PositionCNI.AUTRE and not donnees.get('position_precision'):
            raise serializers.ValidationError({
                "position_precision": "Obligatoire lorsque 'Autre lieu' est sélectionné."
            })
        return donnees

    def _decoder_photo_titulaire(self, donnee_base64):
        texte = (donnee_base64 or "").strip()
        if ',' in texte and texte.startswith('data:'):
            texte = texte.split(',', 1)[1]
        try:
            contenu_binaire = base64.b64decode(texte, validate=False)
        except Exception as exc:
            raise serializers.ValidationError({
                "photo_titulaire_base64": "Photo du titulaire invalide (base64)."
            }) from exc
        if not contenu_binaire:
            raise serializers.ValidationError({
                "photo_titulaire_base64": "Photo du titulaire vide."
            })
        nom_fichier = f"{uuid.uuid4()}.jpg"
        return ContentFile(contenu_binaire, name=nom_fichier)

    def create(self, donnees_validees):
        telephone = donnees_validees.pop('telephone_declarant')
        photo_base64 = donnees_validees.pop('photo_titulaire_base64')

        declarant = Utilisateur.objects.get(telephone=telephone)
        photo_titulaire = self._decoder_photo_titulaire(photo_base64)

        annonce = Annonce.objects.create(
            declarant=declarant,
            photo_titulaire=photo_titulaire,
            **donnees_validees,
        )

        Historique.enregistrer(
            utilisateur=declarant,
            type_action=Historique.TypeAction.PUBLICATION,
            description=f"Annonce #{annonce.id} publiée par {declarant}",
        )

        return annonce


class AnnonceDetailSerializer(serializers.ModelSerializer):
    """Représentation en lecture d'une Annonce, utilisée pour confirmer une action (publication, validation, rejet)."""

    class Meta:
        model = Annonce
        fields = [
            'id', 'nom_titulaire', 'prenom_titulaire', 'date_naissance',
            'lieu_naissance', 'numero_carte', 'position_cni',
            'position_precision', 'statut', 'motif_rejet', 'date_creation',
        ]
        read_only_fields = fields


class RechercheAnnonceSerializer(serializers.ModelSerializer):
    """
    Représentation publique d'une annonce dans les résultats de
    recherche (section 7.C) : uniquement les champs utiles au
    bénéficiaire, jamais les photos brutes recto/verso (contrainte
    10.3 -- ces photos ne sont jamais montrées publiquement).
    """

    class Meta:
        model = Annonce
        fields = [
            'id', 'nom_titulaire', 'prenom_titulaire',
            'photo_titulaire', 'date_creation',
        ]
        read_only_fields = fields


class RejetAnnonceSerializer(serializers.Serializer):
    """Rejet d'une annonce par l'administrateur (section 7.G) : le motif est obligatoire."""

    motif_rejet = serializers.CharField(max_length=255)