from django.contrib import admin

from .models import MiseEnRelation


@admin.register(MiseEnRelation)
class MiseEnRelationAdmin(admin.ModelAdmin):
    list_display = (
        'annonce', 'beneficiaire', 'confirmation_declarant',
        'confirmation_beneficiaire', 'cloture_administrateur', 'date_expiration',
    )
    list_filter = ('cloture_administrateur', 'confirmation_declarant', 'confirmation_beneficiaire')