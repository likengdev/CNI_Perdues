from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.alertes.models import AlerteRecherche
from apps.annonces.models import Annonce
from apps.historique.models import Historique
from apps.mise_en_relation.models import MiseEnRelation
from apps.utilisateurs.models import Utilisateur

from .permissions import EstAdministrateurAuthentifie
from .serializers import (
    AdministrateurSerializer,
    AnnonceSerializer,
    DashboardStatsSerializer,
    HistoriqueSerializer,
    MiseEnRelationSerializer,
    UtilisateurSerializer,
)


class AdminMeView(APIView):
    """Retourne les informations de l'administrateur actuellement connecté."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(AdministrateurSerializer(request.user).data)


class DashboardStatsView(APIView):
    """
    Statistiques globales pour le tableau de bord administrateur
    (section 5 du cahier des charges).
    """

    permission_classes = [EstAdministrateurAuthentifie]

    def get(self, request):
        annonces_total = Annonce.objects.count()
        annonces_publiees = Annonce.objects.filter(statut=Annonce.StatutAnnonce.PUBLIEE).count()
        cni_restituees = Annonce.objects.filter(statut=Annonce.StatutAnnonce.RESTITUEE).count()

        donnees = {
            "nombre_total_utilisateurs": Utilisateur.objects.count(),
            "nombre_declarants": Annonce.objects.values('declarant').distinct().count(),
            "nombre_beneficiaires": MiseEnRelation.objects.values('beneficiaire').distinct().count(),
            "annonces_total": annonces_total,
            "annonces_en_attente": Annonce.objects.filter(statut=Annonce.StatutAnnonce.EN_ATTENTE).count(),
            "annonces_publiees": annonces_publiees,
            "annonces_rejetees": Annonce.objects.filter(statut=Annonce.StatutAnnonce.REJETEE).count(),
            "restitutions_en_cours": Annonce.objects.filter(statut=Annonce.StatutAnnonce.EN_COURS_RESTITUTION).count(),
            "cni_restituees": cni_restituees,
            "recherches_effectuees": AlerteRecherche.objects.count(),
            "taux_restitution": round((cni_restituees / annonces_total * 100), 2) if annonces_total else 0.0,
            "dernieres_inscriptions": list(Utilisateur.objects.order_by('-date_creation')[:5].values('id', 'nom', 'prenom', 'telephone')),
            "dernieres_annonces": list(Annonce.objects.order_by('-date_creation')[:5].values('id', 'nom_titulaire', 'prenom_titulaire', 'statut')),
            "dernieres_restitutions": list(MiseEnRelation.objects.filter(cloture_administrateur=True).order_by('-date_cloture')[:5].values('id', 'annonce', 'date_cloture')),
            "dernieres_activites": list(Historique.objects.order_by('-date_creation')[:10].values('id', 'type_action', 'description', 'date_creation')),
        }

        return Response(DashboardStatsSerializer(donnees).data)


class UtilisateurViewSet(ReadOnlyModelViewSet):
    """Liste et détail des utilisateurs, en lecture seule (l'administrateur consulte, ne modifie pas via cette API)."""

    permission_classes = [EstAdministrateurAuthentifie]
    queryset = Utilisateur.objects.all().order_by('-date_creation')
    serializer_class = UtilisateurSerializer


class DeclarantViewSet(ReadOnlyModelViewSet):
    """Utilisateurs ayant publié au moins une annonce."""

    permission_classes = [EstAdministrateurAuthentifie]
    serializer_class = UtilisateurSerializer

    def get_queryset(self):
        return Utilisateur.objects.filter(annonces_publiees__isnull=False).distinct().order_by('-date_creation')


class BeneficiaireViewSet(ReadOnlyModelViewSet):
    """Utilisateurs ayant déclenché au moins une mise en relation."""

    permission_classes = [EstAdministrateurAuthentifie]
    serializer_class = UtilisateurSerializer

    def get_queryset(self):
        return Utilisateur.objects.filter(mises_en_relation__isnull=False).distinct().order_by('-date_creation')


class AnnonceViewSet(ReadOnlyModelViewSet):
    """Consultation des annonces côté administrateur (validation/rejet restent sur les endpoints dédiés de l'app annonces)."""

    permission_classes = [EstAdministrateurAuthentifie]
    queryset = Annonce.objects.all().order_by('-date_creation')
    serializer_class = AnnonceSerializer


class MiseEnRelationViewSet(ReadOnlyModelViewSet):
    """Consultation des mises en relation/restitutions côté administrateur."""

    permission_classes = [EstAdministrateurAuthentifie]
    queryset = MiseEnRelation.objects.all().order_by('-date_creation')
    serializer_class = MiseEnRelationSerializer


class HistoriqueViewSet(ReadOnlyModelViewSet):
    """Consultation du journal d'historique."""

    permission_classes = [EstAdministrateurAuthentifie]
    queryset = Historique.objects.all().order_by('-date_creation')
    serializer_class = HistoriqueSerializer