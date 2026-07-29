from rest_framework import serializers

from apps.utilisateurs.models import Utilisateur

from .models import AlerteRecherche


class CreerAlerteSerializer(serializers.Serializer):
    """
    Enregistre une recherche restée infructueuse (section 8.5) : le
    bénéficiaire sera notifié dès qu'une annonce correspondante est
    validée par l'administrateur.
    """

    telephone_utilisateur = serializers.CharField()
    nom_recherche = serializers.CharField(max_length=100)
    prenom_recherche = serializers.CharField(max_length=100)

    def validate_telephone_utilisateur(self, value):
        if not Utilisateur.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Ce numéro n'est pas inscrit.")
        return value

    def create(self, donnees_validees):
        utilisateur = Utilisateur.objects.get(telephone=donnees_validees['telephone_utilisateur'])
        return AlerteRecherche.objects.create(
            utilisateur=utilisateur,
            nom_recherche=donnees_validees['nom_recherche'],
            prenom_recherche=donnees_validees['prenom_recherche'],
        )


class AlerteDetailSerializer(serializers.ModelSerializer):
    """
    Représentation en lecture. Inclut le téléphone de l'utilisateur
    concerné -- c'est cette information qui sera utilisée pour la
    notification (WhatsApp géré séparément).
    """

    telephone_utilisateur = serializers.CharField(source='utilisateur.telephone', read_only=True)

    class Meta:
        model = AlerteRecherche
        fields = [
            'id', 'telephone_utilisateur', 'nom_recherche',
            'prenom_recherche', 'notifie', 'date_creation',
        ]
        read_only_fields = fields