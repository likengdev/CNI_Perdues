from django.contrib import admin

from .models import Utilisateur


@admin.register(Utilisateur)
class UtilisateurAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'telephone', 'ville', 'quartier', 'est_actif', 'date_creation')
    list_filter = ('est_actif', 'ville')
    search_fields = ('nom', 'prenom', 'telephone')