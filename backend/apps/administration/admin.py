from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Administrateur


@admin.register(Administrateur)
class AdministrateurAdmin(UserAdmin):
    model = Administrateur
    list_display = ('email', 'nom', 'is_staff', 'is_active', 'date_creation')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations', {'fields': ('nom',)}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nom', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )
    search_fields = ('email', 'nom')