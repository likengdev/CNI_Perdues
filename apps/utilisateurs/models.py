from django.db import models

from apps.core.models import ModeleHorodate


class Utilisateur(ModeleHorodate):
    """
    Utilisateur de la plateforme : peut être déclarant (a retrouvé une CNI)
    ou bénéficiaire (recherche sa CNI), selon l'action en cours plutôt
    qu'un rôle figé (cahier des charges, section 4).

    Hérite de ModeleHorodate : date_creation fait office de date
    d'inscription, date_modification suit les mises à jour du profil
    (ex: complétion ville/quartier par un bénéficiaire qui publie).

    Pas d'email ni de mot de passe : l'utilisateur est identifié
    uniquement par son numéro de téléphone (section 8.1).
    """

    telephone = models.CharField(
        max_length=20,
        unique=True,
        help_text="Identifiant du compte, doit être unique."
    )
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    ville = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Obligatoire uniquement pour publier une annonce."
    )
    quartier = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Obligatoire uniquement pour publier une annonce."
    )
    est_actif = models.BooleanField(
        default=True,
        help_text="Permet à l'administrateur de suspendre un compte."
    )

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.telephone})"

    def peut_publier_annonce(self):
        """
        Encapsulation d'une règle métier (section 7.A du cahier des
        charges) : un utilisateur ne peut publier que si son profil
        est complet (ville et quartier renseignés).
        """
        return bool(self.ville and self.quartier)