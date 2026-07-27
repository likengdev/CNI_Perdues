from django.urls import path

from . import views

app_name = 'mise_en_relation'

urlpatterns = [
    path('declencher/', views.declencher_mise_en_relation, name='declencher'),
    path('<int:mise_en_relation_id>/confirmer/', views.confirmer_restitution, name='confirmer'),
]