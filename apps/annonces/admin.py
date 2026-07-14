from django.contrib import admin

from .models import Annonce


@admin.register(Annonce)
class AnnonceAdmin(admin.ModelAdmin):
    list_display = ('nom_titulaire', 'prenom_titulaire', 'declarant', 'statut', 'position_cni', 'date_creation')
    list_filter = ('statut', 'position_cni')
    search_fields = ('nom_titulaire', 'prenom_titulaire', 'numero_carte')