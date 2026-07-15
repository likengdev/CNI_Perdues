from rest_framework import serializers


class ExtractionCNISerializer(serializers.Serializer):
    """
    Reçoit uniquement les deux photos (pas encore une Annonce complète) :
    sert à l'étape d'extraction/prévisualisation avant publication
    définitive (section 6.1, étapes 4-6).
    """

    photo_recto = serializers.ImageField()
    photo_verso = serializers.ImageField()