
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/utilisateurs/', include('apps.utilisateurs.urls')),
    path('api/annonces/',include('apps.annonces.urls')),
    path('api/mise_en_relation/',include('apps.mise_en_relation.urls')),
    path('api/alertes/', include('apps.alertes.urls')),
    path('api/admin/', include('apps.administration.urls')),
]
