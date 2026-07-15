from rest_framework import serializers

from .models import Utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):
    """
    Représentation en lecture d'un Utilisateur — utilisée pour renvoyer
    les infos après vérification ou inscription, jamais pour créer
    (voir les serializers d'inscription dédiés ci-dessous).
    """

    class Meta:
        model = Utilisateur
        fields = ['id', 'telephone', 'nom', 'prenom', 'ville', 'quartier', 'est_actif']
        read_only_fields = fields


class InscriptionDeclarantSerializer(serializers.ModelSerializer):
    """
    Inscription via "J'ai trouvé une CNI" (section 6.1, étape 2) :
    nom, prénom, téléphone, ville, quartier — ville/quartier obligatoires
    ici, contrairement à l'inscription bénéficiaire.
    """

    ville = serializers.CharField(required=True)
    quartier = serializers.CharField(required=True)

    class Meta:
        model = Utilisateur
        fields = ['telephone', 'nom', 'prenom', 'ville', 'quartier']

    def validate_telephone(self, value):
        """
        Encapsulation de la règle d'unicité (section 7.A) directement
        dans le serializer : le message d'erreur est clair et la
        vérification a lieu avant toute tentative de création.
        """
        if Utilisateur.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Ce numéro de téléphone est déjà inscrit.")
        return value


class InscriptionBeneficiaireSerializer(serializers.ModelSerializer):
    """
    Inscription via "Chercher une CNI" (section 6.2, étape 2) :
    nom, prénom, téléphone uniquement — ville/quartier ne sont pas
    demandés à ce stade (ils seront complétés plus tard si ce
    bénéficiaire souhaite publier une annonce, section 7.A).
    """

    class Meta:
        model = Utilisateur
        fields = ['telephone', 'nom', 'prenom']

    def validate_telephone(self, value):
        if Utilisateur.objects.filter(telephone=value).exists():
            raise serializers.ValidationError("Ce numéro de téléphone est déjà inscrit.")
        return value


class CompleterProfilSerializer(serializers.ModelSerializer):
    """
    Section 7.A : "Si un bénéficiaire déjà inscrit souhaite ensuite
    publier une annonce, le système lui demande de compléter son profil
    avec sa ville et son quartier avant la publication."
    """

    ville = serializers.CharField(required=True)
    quartier = serializers.CharField(required=True)

    class Meta:
        model = Utilisateur
        fields = ['ville', 'quartier']