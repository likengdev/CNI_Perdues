from django.contrib import admin

from .models import Historique


@admin.register(Historique)
class HistoriqueAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'type_action', 'date_creation')
    list_filter = ('type_action',)
    search_fields = ('description',)
    readonly_fields = ('utilisateur', 'type_action', 'description', 'date_creation')