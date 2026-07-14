from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import ModeleHorodate
from apps.utilisateurs.models import Utilisateur


class Annonce(ModeleHorodate):
    """
    CNI retrouvée publiée par un déclarant (cahier des charges, section 8.3).

    Hérite de ModeleHorodate : date_creation fait office de date de
    publication, date_modification suit les changements de statut
    (validation, rejet, restitution...).
    """

    class PositionCNI(models.TextChoices):
        """
        Regroupe les valeurs possibles et leurs libellés au même endroit
        (section 6.1, étape 7) : évite les chaînes de caractères éparpillées
        dans le code et les fautes de frappe entre vues.
        """
        EN_MA_POSSESSION = 'possession', 'En ma possession'
        COMMISSARIAT = 'commissariat', 'Commissariat'
        MAIRIE = 'mairie', 'Mairie'
        AUTRE = 'autre', 'Autre lieu'

    class StatutAnnonce(models.TextChoices):
        """Cycle de vie de l'annonce (section 6.K)."""
        EN_ATTENTE = 'en_attente', 'En attente'
        PUBLIEE = 'publiee', 'Publiée'
        EN_COURS_RESTITUTION = 'en_cours', 'En cours de restitution'
        RESTITUEE = 'restituee', 'Restituée'
        REJETEE = 'rejetee', 'Rejetée'

    declarant = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='annonces_publiees',
    )

    # Photos sources, jamais montrées publiquement (section 10.3)
    photo_recto = models.ImageField(upload_to='cni/recto/')
    photo_verso = models.ImageField(upload_to='cni/verso/')

    # Informations extraites par OCR, vérifiées/corrigées par le déclarant
    nom_titulaire = models.CharField(max_length=100)
    prenom_titulaire = models.CharField(max_length=100)
    date_naissance = models.DateField()
    lieu_naissance = models.CharField(max_length=150)
    numero_carte = models.CharField(max_length=50)
    photo_titulaire = models.ImageField(upload_to='cni/titulaire/')

    position_cni = models.CharField(
        max_length=20,
        choices=PositionCNI.choices,
    )
    position_precision = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Obligatoire uniquement si position_cni = 'Autre lieu'.",
    )

    statut = models.CharField(
        max_length=20,
        choices=StatutAnnonce.choices,
        default=StatutAnnonce.EN_ATTENTE,
    )
    motif_rejet = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name = "Annonce"
        verbose_name_plural = "Annonces"

    def __str__(self):
        return f"CNI de {self.prenom_titulaire} {self.nom_titulaire} — {self.get_statut_display()}"

    def clean(self):
        """
        Encapsulation de la règle métier de la section 7.B : si 'Autre lieu'
        est choisi, la précision textuelle devient obligatoire. Placée ici,
        cette règle est garantie partout où le modèle est validé (admin,
        futurs formulaires, futures API), sans duplication.
        """
        if self.position_cni == self.PositionCNI.AUTRE and not self.position_precision:
            raise ValidationError(
                "La précision du lieu est obligatoire lorsque 'Autre lieu' est sélectionné."
            )

    def est_visible_publiquement(self):
        """Encapsulation : seules les annonces publiées sont recherchables (section 7.C)."""
        return self.statut == self.StatutAnnonce.PUBLIEE