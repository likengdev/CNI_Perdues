from datetime import timedelta

from django.db import models
from django.utils import timezone

from apps.annonces.models import Annonce
from apps.core.models import ModeleHorodate
from apps.utilisateurs.models import Utilisateur

DUREE_EXPIRATION = timedelta(hours=72)


class MiseEnRelation(ModeleHorodate):
    """
    Processus déclenché quand un bénéficiaire clique sur "Oui, c'est moi"
    (cahier des charges, section 8.4).

    Seul le bénéficiaire confirme la restitution effective (choix de
    conception assumé : parcours simple et rapide, pas de double
    confirmation avec le déclarant).

    Une seule mise en relation active à la fois par annonce (OneToOne).
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
        if not self.date_expiration:
            self.date_expiration = timezone.now() + DUREE_EXPIRATION
        super().save(*args, **kwargs)

    def est_expiree(self):
        """Vrai si le délai de 72h est dépassé sans confirmation du bénéficiaire."""
        return timezone.now() > self.date_expiration and not self.confirmation_beneficiaire

    def est_restitution_confirmee(self):
        """Le bénéficiaire a confirmé : prêt pour clôture par l'admin."""
        return self.confirmation_beneficiaire