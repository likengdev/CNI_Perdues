from decimal import Decimal

from django.db import models

from apps.core.models import ModeleHorodate
from apps.mise_en_relation.models import MiseEnRelation
from apps.utilisateurs.models import Utilisateur


class Geste(ModeleHorodate):
    """
    Remerciement financier volontaire adressé à l'équipe de développement
    (et non au déclarant), proposé au bénéficiaire après une restitution
    (cahier des charges, section 8.6).

    Hérite de ModeleHorodate : date_creation correspond à la date du geste.

    Important (contrainte fonctionnelle 10.1) : ce modèle est totalement
    dissocié du statut de la restitution elle-même — un échec ou une
    absence de paiement ne doit jamais bloquer une MiseEnRelation. C'est
    pour ça que Geste ne modifie jamais MiseEnRelation ; il ne fait que
    la référencer en lecture (ForeignKey).
    """

    class MoyenPaiement(models.TextChoices):
        ORANGE_MONEY = 'orange_money', 'Orange Money'
        MTN_MOBILE_MONEY = 'mtn_momo', 'MTN Mobile Money'
        AUTRE = 'autre', 'Autre'

    class StatutTransaction(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        REUSSIE = 'reussie', 'Réussie'
        ECHOUEE = 'echouee', 'Échouée'

    mise_en_relation = models.ForeignKey(
        MiseEnRelation,
        on_delete=models.CASCADE,
        related_name='gestes',
    )
    beneficiaire = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='gestes_effectues',
    )
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    moyen_paiement = models.CharField(max_length=20, choices=MoyenPaiement.choices)
    statut_transaction = models.CharField(
        max_length=20,
        choices=StatutTransaction.choices,
        default=StatutTransaction.EN_ATTENTE,
    )
    reference_transaction = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        verbose_name = "Geste"
        verbose_name_plural = "Gestes"

    def __str__(self):
        return f"{self.montant} F CFA — {self.get_statut_transaction_display()}"

    def est_reussi(self):
        """Encapsulation : évite de comparer la chaîne 'reussie' un peu partout dans le code."""
        return self.statut_transaction == self.StatutTransaction.REUSSIE