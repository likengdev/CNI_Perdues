from django.urls import path

from . import views

app_name = 'annonces'

urlpatterns = [
    path('extraire/', views.extraire_informations_cni, name='extraire-informations'),
    path('publier/', views.publier_annonce, name='publier-annonce'),
    path('rechercher/', views.rechercher_annonces, name='rechercher-annonces'),
]