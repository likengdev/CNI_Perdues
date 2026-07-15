from django.urls import path

from . import views

app_name = 'utilisateurs'

urlpatterns = [
    path('verifier/', views.verifier_inscription, name='verifier-inscription'),
    path('inscrire/declarant/', views.inscrire_declarant, name='inscrire-declarant'),
    path('inscrire/beneficiaire/', views.inscrire_beneficiaire, name='inscrire-beneficiaire'),
    path('<str:telephone>/completer-profil/', views.completer_profil, name='completer-profil'),
]