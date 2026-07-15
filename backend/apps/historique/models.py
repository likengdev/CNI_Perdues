from django.db import models

from apps.core.models import ModeleHorodate
from apps.utilisateurs.models import Utilisateur


class Historique(ModeleHorodate):
    """
    Journal des actions importantes de la plateforme (publication,
    validation, consultation, restitution, geste, etc.), cahier des
    charges section 8.7 et règle de gestion : "Toutes les actions
    importantes sont enregistrées dans l'historique du système."

    Hérite de ModeleHorodate : date_creation correspond à date_action.
    """

    class TypeAction(models.TextChoices):
        PUBLICATION = 'publication', 'Publication'
        VALIDATION = 'validation', 'Validation'
        REJET = 'rejet', 'Rejet'
        CONSULTATION = 'consultation', 'Consultation'
        RESTITUTION = 'restitution', 'Restitution'
        GESTE = 'geste', 'Geste financier'
        INSCRIPTION = 'inscription', 'Inscription'
        AUTRE = 'autre', 'Autre'

    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='historique_actions',
    )
    type_action = models.CharField(max_length=20, choices=TypeAction.choices)
    description = models.TextField()

    class Meta:
        verbose_name = "Historique"
        verbose_name_plural = "Historique"
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.get_type_action_display()} — {self.utilisateur} ({self.date_creation:%d/%m/%Y %H:%M})"

    @classmethod
    def enregistrer(cls, utilisateur, type_action, description):
        """
        Encapsulation : point d'entrée unique pour créer une entrée
        d'historique. Plus tard, chaque vue/service qui doit journaliser
        une action (publication, validation, etc.) appellera
        Historique.enregistrer(...) au lieu de faire
        Historique.objects.create(...) partout dans le code — garantit
        une création cohérente et centralise un futur changement de
        comportement (ex: log externe en plus).
        """
        return cls.objects.create(
            utilisateur=utilisateur,
            type_action=type_action,
            description=description,
        )