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
    list_display = ('id', 'type_document', 'nom_titulaire', 'prenom_titulaire', 'numero_carte', 'declarant', 'statut', 'position_cni', 'date_creation')
    list_filter = ('type_document', 'statut', 'position_cni', 'date_creation')
    search_fields = ('nom_titulaire', 'prenom_titulaire', 'numero_carte', 'declarant__telephone')
    readonly_fields = ('date_creation', 'date_modification')
    actions = [valider_annonces, rejeter_annonces]

    fieldsets = (
        (None, {'fields': ('declarant', 'type_document', 'statut', 'motif_rejet')}),
        ('Photos', {'fields': ('photo_recto', 'photo_verso', 'photo_titulaire')}),
        ("Informations du titulaire", {'fields': ('nom_titulaire', 'prenom_titulaire', 'date_naissance', 'lieu_naissance', 'numero_carte')}),
        ('Localisation du document', {'fields': ('position_cni', 'position_precision')}),
        ('Horodatage', {'fields': ('date_creation', 'date_modification')}),
    )