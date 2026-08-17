from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
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
        annonces_publiees = Annonce.objects.filter(
            statut__in=[
                Annonce.StatutAnnonce.PUBLIEE,
                Annonce.StatutAnnonce.EN_COURS_RESTITUTION,
                Annonce.StatutAnnonce.RESTITUEE,
            ]
        ).count()
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
    serializer_class = AnnonceSerializer

    def get_queryset(self):
        queryset = Annonce.objects.all().order_by('-date_creation')
        statut = self.request.query_params.get('statut')
        if statut:
            statuts = [s.strip() for s in statut.split(',') if s.strip()]
            queryset = queryset.filter(statut__in=statuts)
        return queryset


class MiseEnRelationViewSet(ReadOnlyModelViewSet):
    """Consultation des mises en relation/restitutions côté administrateur."""

    permission_classes = [EstAdministrateurAuthentifie]
    serializer_class = MiseEnRelationSerializer

    def get_queryset(self):
        queryset = MiseEnRelation.objects.all().order_by('-date_creation')
        etat = self.request.query_params.get('etat')
        if etat == 'en_cours':
            queryset = queryset.filter(cloture_administrateur=False)
        elif etat == 'terminees':
            queryset = queryset.filter(cloture_administrateur=True)
        return queryset
class HistoriqueViewSet(ReadOnlyModelViewSet):
    """Consultation du journal d'historique."""

    permission_classes = [EstAdministrateurAuthentifie]
    queryset = Historique.objects.all().order_by('-date_creation')
    serializer_class = HistoriqueSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        type_action = self.request.query_params.get('type_action')
        recherche = self.request.query_params.get('recherche', '').strip()
        depuis = self.request.query_params.get('depuis')
        jusqua = self.request.query_params.get('jusqua')

        if type_action:
            actions = [a.strip() for a in type_action.split(',') if a.strip()]
            if actions:
                queryset = queryset.filter(type_action__in=actions)

        if recherche:
            queryset = queryset.filter(
                Q(description__icontains=recherche)
                | Q(utilisateur__nom__icontains=recherche)
                | Q(utilisateur__prenom__icontains=recherche)
            )

        if depuis:
            queryset = queryset.filter(date_creation__date__gte=depuis)
        if jusqua:
            queryset = queryset.filter(date_creation__date__lte=jusqua)

        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des actions enregistrées dans le journal d'activité."""
        total = Historique.objects.count()
        par_type = dict(
            Historique.objects.values_list('type_action')
            .annotate(nombre=Count('id'))
        )
        repartition = {
            choix.value: par_type.get(choix.value, 0)
            for choix in Historique.TypeAction
        }
        return Response({
            'total': total,
            'par_type': repartition,
        })
    
class RestitutionsMensuellesView(APIView):
    permission_classes = [EstAdministrateurAuthentifie]

    def get(self, request):
        donnees = (
            MiseEnRelation.objects
            .filter(cloture_administrateur=True, date_cloture__isnull=False)
            .annotate(mois=TruncMonth('date_cloture'))
            .values('mois')
            .annotate(nombre=Count('id'))
            .order_by('mois')
        )
        resultat = [
            {"mois": entree['mois'].strftime('%Y-%m'), "nombre": entree['nombre']}
            for entree in donnees
        ]
        return Response(resultat)