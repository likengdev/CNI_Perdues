from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RestitutionsMensuellesView
from .views import (
    AdminMeView,
    DashboardStatsView,
    UtilisateurViewSet,
    DeclarantViewSet,
    BeneficiaireViewSet,
    AnnonceViewSet,
    MiseEnRelationViewSet,
    HistoriqueViewSet
)
app_name = 'administration'
router = DefaultRouter()
router.register(r'utilisateurs', UtilisateurViewSet, basename='utilisateur')
router.register(r'declarants', DeclarantViewSet, basename='declarant')
router.register(r'beneficiaires', BeneficiaireViewSet, basename='beneficiaire')
router.register(r'annonces', AnnonceViewSet, basename='annonce')
router.register(r'restitutions', MiseEnRelationViewSet, basename='restitution')
router.register(r'historique', HistoriqueViewSet, basename='historique')

urlpatterns = [
    # Auth JWT
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', AdminMeView.as_view(), name='admin_me'),
    
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('dashboard/restitutions-mensuelles/', RestitutionsMensuellesView.as_view(), name='restitutions_mensuelles'),
    # Autres endpoints via le router (CRUD & Actions)
    path('', include(router.urls)),
]
