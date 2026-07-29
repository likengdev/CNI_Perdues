from rest_framework import serializers
from apps.administration.models import Administrateur
from apps.utilisateurs.models import Utilisateur
from apps.annonces.models import Annonce
from apps.mise_en_relation.models import MiseEnRelation
from apps.historique.models import Historique

class AdministrateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrateur
        fields = ['id', 'email', 'nom', 'date_creation', 'is_active', 'is_staff']
        read_only_fields = ['id', 'date_creation']

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = '__all__'
        read_only_fields = ['id', 'telephone', 'date_creation']

class AnnonceSerializer(serializers.ModelSerializer):
    declarant_nom = serializers.CharField(source='declarant.nom', read_only=True)
    declarant_prenom = serializers.CharField(source='declarant.prenom', read_only=True)
    declarant_telephone = serializers.CharField(source='declarant.telephone', read_only=True)

    class Meta:
        model = Annonce
        fields = '__all__'
        read_only_fields = ['id', 'declarant', 'date_creation']

class MiseEnRelationSerializer(serializers.ModelSerializer):
    annonce = AnnonceSerializer(read_only=True)
    beneficiaire = UtilisateurSerializer(read_only=True)

    class Meta:
        model = MiseEnRelation
        fields = '__all__'

class HistoriqueSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source='utilisateur.nom', read_only=True)
    utilisateur_prenom = serializers.CharField(source='utilisateur.prenom', read_only=True)

    class Meta:
        model = Historique
        fields = '__all__'
        read_only_fields = ['id', 'date_creation']

class DashboardStatsSerializer(serializers.Serializer):
    nombre_total_utilisateurs = serializers.IntegerField()
    nombre_declarants = serializers.IntegerField()
    nombre_beneficiaires = serializers.IntegerField()
    annonces_total = serializers.IntegerField()
    annonces_en_attente = serializers.IntegerField()
    annonces_publiees = serializers.IntegerField()
    annonces_rejetees = serializers.IntegerField()
    restitutions_en_cours = serializers.IntegerField()
    cni_restituees = serializers.IntegerField()
    recherches_effectuees = serializers.IntegerField()
    taux_restitution = serializers.FloatField()
    dernieres_inscriptions = serializers.ListField()
    dernieres_annonces = serializers.ListField()
    dernieres_restitutions = serializers.ListField()
    dernieres_activites = serializers.ListField()
