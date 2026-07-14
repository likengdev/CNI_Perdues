from django.db import models


class ModeleHorodate(models.Model):
    """
    Classe abstraite de base : encapsule le comportement commun
    (horodatage) que plusieurs modèles du projet partageront
    (Utilisateur, Annonce, MiseEnRelation, etc.).

    Étant abstraite, elle ne crée aucune table en base — elle sert
    uniquement de brique réutilisable par héritage.
    """

    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True