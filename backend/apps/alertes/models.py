from django.db import models

from apps.core.models import ModeleHorodate
from apps.utilisateurs.models import Utilisateur


class AlerteRecherche(ModeleHorodate):
    """
    Enregistre une recherche restée infructueuse, pour prévenir
    automatiquement le bénéficiaire dès qu'une annonce correspondante
    est publiée et validée (cahier des charges, section 8.5).

    Hérite de ModeleHorodate : date_creation correspond à la date de
    la recherche initiale.
    """

    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='alertes_recherche',
    )
    nom_recherche = models.CharField(max_length=100)
    prenom_recherche = models.CharField(max_length=100)
    notifie = models.BooleanField(
        default=False,
        help_text="Indique si une notification WhatsApp a déjà été envoyée.",
    )

    class Meta:
        verbose_name = "Alerte de recherche"
        verbose_name_plural = "Alertes de recherche"

    def __str__(self):
        return f"Alerte de {self.utilisateur} pour {self.prenom_recherche} {self.nom_recherche}"

    def correspond_a(self, annonce):
        """
        Encapsulation de la règle de correspondance (section 7.E) :
        une annonce publiée correspond à cette alerte si le nom et le
        prénom recherchés correspondent au titulaire de la CNI trouvée.
        Centraliser cette comparaison ici évite de la réécrire (et de
        la désynchroniser) dans chaque tâche/vue qui en a besoin.
        """
        return (
            self.nom_recherche.strip().lower() == annonce.nom_titulaire.strip().lower()
            and self.prenom_recherche.strip().lower() == annonce.prenom_titulaire.strip().lower()
        )