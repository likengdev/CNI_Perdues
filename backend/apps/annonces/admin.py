from django.contrib import admin

from .models import Annonce


@admin.action(description="Valider les annonces sélectionnées (statut -> Publiée)")
def valider_annonces(modeladmin, request, queryset):
    queryset.update(statut=Annonce.StatutAnnonce.PUBLIEE)


@admin.action(description="Rejeter les annonces sélectionnées")
def rejeter_annonces(modeladmin, request, queryset):
    queryset.update(statut=Annonce.StatutAnnonce.REJETEE)


@admin.register(Annonce)
class AnnonceAdmin(admin.ModelAdmin):
    list_display = ('nom_titulaire', 'prenom_titulaire', 'declarant', 'statut', 'position_cni', 'date_creation')
    list_filter = ('statut', 'position_cni')
    search_fields = ('nom_titulaire', 'prenom_titulaire', 'numero_carte')
    actions = [valider_annonces, rejeter_annonces]