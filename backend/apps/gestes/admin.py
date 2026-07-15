from django.contrib import admin

from .models import Geste


@admin.register(Geste)
class GesteAdmin(admin.ModelAdmin):
    list_display = ('beneficiaire', 'montant', 'moyen_paiement', 'statut_transaction', 'date_creation')
    list_filter = ('moyen_paiement', 'statut_transaction')