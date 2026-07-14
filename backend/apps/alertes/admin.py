from django.contrib import admin

from .models import AlerteRecherche


@admin.register(AlerteRecherche)
class AlerteRechercheAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'nom_recherche', 'prenom_recherche', 'notifie', 'date_creation')
    list_filter = ('notifie',)
    search_fields = ('nom_recherche', 'prenom_recherche')