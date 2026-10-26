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


TAILLE_MAX_IMAGE = 10 * 1024 * 1024  # 10 Mo
EXTENSIONS_AUTORISEES = {'jpg', 'jpeg', 'png', 'webp'}
DIMENSION_MAX = 4096  # largeur ou hauteur maximale (anti bombe de décompression)


class ExtractionCNISerializer(serializers.Serializer):
    """
    Reçoit les photos pour extraction/prévisualisation avant publication
    définitive.
    """

    photo_recto = serializers.ImageField()
    photo_verso = serializers.ImageField(required=False, allow_null=True)
    type_document = serializers.ChoiceField(
        choices=[('cni', 'CNI'), ('passeport', 'Passeport')],
        required=False,
        default='cni',
    )

    def _valider_photo(self, valeur):
        if valeur is None:
            return valeur

        if valeur.size > TAILLE_MAX_IMAGE:
            raise serializers.ValidationError(
                "Image trop volumineuse (10 Mo max)."
            )

        nom = (getattr(valeur, 'name', '') or '').lower()
        extension = nom.rsplit('.', 1)[-1] if '.' in nom else ''
        if extension and extension not in EXTENSIONS_AUTORISEES:
            raise serializers.ValidationError(
                "Format d'image non autorisé (JPG, PNG ou WEBP uniquement)."
            )

        try:
            from PIL import Image
            image = Image.open(valeur)
            largeur, hauteur = image.size
            image.verify()
        except Exception:
            raise serializers.ValidationError(
                "Image invalide ou corrompue."
            )
        finally:
            valeur.seek(0)

        if largeur > DIMENSION_MAX or hauteur > DIMENSION_MAX:
            raise serializers.ValidationError(
                f"Image trop grande ({DIMENSION_MAX}px max par dimension)."
            )
        return valeur

    def validate_photo_recto(self, valeur):
        return self._valider_photo(valeur)

    def validate_photo_verso(self, valeur):
        return self._valider_photo(valeur)


class ExtractionCNIResultSerializer(serializers.Serializer):
    nom_titulaire = serializers.CharField(allow_blank=True)
    prenom_titulaire = serializers.CharField(allow_blank=True)
    date_naissance = serializers.CharField(allow_blank=True)
    lieu_naissance = serializers.CharField(allow_blank=True)
    numero_carte = serializers.CharField(allow_blank=True)
    photo_titulaire_base64 = serializers.CharField(allow_blank=True)
    confiances = serializers.DictField(child=serializers.FloatField(), default=dict)
    qualite_images = serializers.DictField(child=serializers.DictField(), default=dict)
    type_document = serializers.CharField(allow_blank=True, required=False)
    mrz = serializers.DictField(required=False, allow_null=True)


class PublicationAnnonceSerializer(serializers.ModelSerializer):
    """
    Étape finale du parcours déclarant.
    """

    telephone_declarant = serializers.CharField(write_only=True)
    photo_titulaire_base64 = serializers.CharField(write_only=True, allow_blank=False)
    date_naissance = serializers.CharField()
    type_document = serializers.ChoiceField(
        choices=[('cni', 'CNI'), ('passeport', 'Passeport')],
        required=False,
        default='cni',
    )

    class Meta:
        model = Annonce
        fields = [
            'telephone_declarant', 'type_document', 'photo_recto', 'photo_verso',
            'nom_titulaire', 'prenom_titulaire', 'date_naissance',
            'lieu_naissance', 'numero_carte', 'photo_titulaire_base64',
            'position_cni', 'position_precision',
        ]

    def _valider_photo(self, valeur, nom_champ):
        if valeur is None:
            return valeur

        if valeur.size > TAILLE_MAX_IMAGE:
            raise serializers.ValidationError(
                f"{nom_champ} : image trop volumineuse (10 Mo max)."
            )

        nom = (getattr(valeur, 'name', '') or '').lower()
        extension = nom.rsplit('.', 1)[-1] if '.' in nom else ''
        if extension and extension not in EXTENSIONS_AUTORISEES:
            raise serializers.ValidationError(
                f"{nom_champ} : format non autorisé (JPG, PNG ou WEBP)."
            )

        try:
            from PIL import Image
            image = Image.open(valeur)
            largeur, hauteur = image.size
            image.verify()
        except Exception:
            raise serializers.ValidationError(
                f"{nom_champ} : image invalide ou corrompue."
            )
        finally:
            valeur.seek(0)

        if largeur > DIMENSION_MAX or hauteur > DIMENSION_MAX:
            raise serializers.ValidationError(
                f"{nom_champ} : image trop grande ({DIMENSION_MAX}px max)."
            )
        return valeur

    def validate_photo_recto(self, valeur):
        return self._valider_photo(valeur, "photo_recto")

    def validate_photo_verso(self, valeur):
        return self._valider_photo(valeur, "photo_verso")

    def validate(self, donnees):
        type_document = donnees.get('type_document') or 'cni'
        if type_document == 'cni' and not donnees.get('photo_verso'):
            raise serializers.ValidationError({
                "photo_verso": "Le verso est obligatoire pour une CNI."
            })
        if type_document == 'passeport' and donnees.get('photo_verso'):
            donnees.pop('photo_verso')
        if donnees.get('position_cni') == Annonce.PositionCNI.AUTRE and not donnees.get('position_precision'):
            raise serializers.ValidationError({
                "position_precision": "Obligatoire lorsque 'Autre lieu' est sélectionné."
            })
        return donnees

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
    """Représentation en lecture d'une Annonce."""

    class Meta:
        model = Annonce
        fields = [
            'id', 'type_document', 'nom_titulaire', 'prenom_titulaire', 'date_naissance',
            'lieu_naissance', 'numero_carte', 'position_cni',
            'position_precision', 'statut', 'motif_rejet', 'date_creation',
        ]
        read_only_fields = fields


class RechercheAnnonceSerializer(serializers.ModelSerializer):
    """Représentation publique d'une annonce dans les résultats de recherche."""

    class Meta:
        model = Annonce
        fields = [
            'id', 'type_document', 'nom_titulaire', 'prenom_titulaire',
            'photo_titulaire', 'date_creation',
        ]
        read_only_fields = fields


class RejetAnnonceSerializer(serializers.Serializer):
    """Rejet d'une annonce par l'administrateur (section 7.G) : le motif est obligatoire."""

    motif_rejet = serializers.CharField(max_length=255)