from datetime import timedelta

from django.db import models
from django.utils import timezone

from apps.annonces.models import Annonce
from apps.core.models import ModeleHorodate
from apps.utilisateurs.models import Utilisateur

DUREE_EXPIRATION = timedelta(hours=72)


class MiseEnRelation(ModeleHorodate):
    """
    Représente le processus déclenché quand un bénéficiaire clique sur
    "Oui, c'est moi" (cahier des charges, section 8.4).

    Hérite de ModeleHorodate : date_creation correspond à la date de
    consultation des coordonnées du déclarant.

    Une seule mise en relation active à la fois par annonce (OneToOne),
    conformément à la règle de gestion : "Une annonce ne peut être en
    cours de restitution qu'avec un seul bénéficiaire à la fois."
    """

    annonce = models.OneToOneField(
        Annonce,
        on_delete=models.CASCADE,
        related_name='mise_en_relation',
    )
    beneficiaire = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='mises_en_relation',
    )

    notification_whatsapp_envoyee = models.BooleanField(default=False)
    confirmation_declarant = models.BooleanField(default=False)
    confirmation_beneficiaire = models.BooleanField(default=False)
    cloture_administrateur = models.BooleanField(default=False)

    date_cloture = models.DateTimeField(null=True, blank=True)
    date_expiration = models.DateTimeField()

    class Meta:
        verbose_name = "Mise en relation"
        verbose_name_plural = "Mises en relation"

    def __str__(self):
        return f"{self.annonce} <-> {self.beneficiaire}"

    def save(self, *args, **kwargs):
        """
        Encapsulation : la date d'expiration (72h) est calculée
        automatiquement à la création, sans que la vue qui crée l'objet
        ait besoin de connaître cette règle métier (section 7.D).
        """
        if not self.date_expiration:
            self.date_expiration = timezone.now() + DUREE_EXPIRATION
        super().save(*args, **kwargs)

    def est_expiree(self):
        """Vrai si le délai de 72h est dépassé sans confirmation des deux parties."""
        return (
            timezone.now() > self.date_expiration
            and not (self.confirmation_declarant and self.confirmation_beneficiaire)
        )

    def est_restitution_confirmee(self):
        """Les deux parties ont confirmé : la restitution peut être close par l'admin."""
        return self.confirmation_declarant and self.confirmation_beneficiaire