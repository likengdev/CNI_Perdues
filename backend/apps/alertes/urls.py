from django.urls import path

from . import views

app_name = 'alertes'

urlpatterns = [
    path('creer/', views.creer_alerte, name='creer-alerte'),
]