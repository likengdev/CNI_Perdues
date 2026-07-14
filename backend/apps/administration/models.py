from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class AdministrateurManager(BaseUserManager):
    """
    Manager custom : Django a besoin de savoir comment créer un
    Administrateur normal et un superutilisateur, puisqu'on n'utilise
    pas le modèle User par défaut (pas de champ 'username' ici).
    """

    def create_user(self, email, nom, password=None):
        if not email:
            raise ValueError("L'email est obligatoire.")
        administrateur = self.model(
            email=self.normalize_email(email),
            nom=nom,
        )
        administrateur.set_password(password)
        administrateur.save(using=self._db)
        return administrateur

    def create_superuser(self, email, nom, password=None):
        administrateur = self.create_user(email, nom, password)
        administrateur.is_staff = True
        administrateur.is_superuser = True
        administrateur.save(using=self._db)
        return administrateur


class Administrateur(AbstractBaseUser, PermissionsMixin):
    """
    Seul acteur du système à disposer d'une authentification classique
    (email + mot de passe), car lui seul accède à une interface complète
    (cahier des charges, section 8.2 et section 5).

    Hérite de AbstractBaseUser (gère le hachage du mot de passe et la
    connexion) et de PermissionsMixin (gère is_superuser, groups,
    permissions) plutôt que de ModeleHorodate : ses besoins sont ceux
    d'un compte d'authentification, pas d'une simple entité métier.
    """

    email = models.EmailField(unique=True)
    nom = models.CharField(max_length=100)
    date_creation = models.DateTimeField(auto_now_add=True)
    is_staff = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    objects = AdministrateurManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom']

    class Meta:
        verbose_name = "Administrateur"
        verbose_name_plural = "Administrateurs"

    def __str__(self):
        return f"{self.nom} ({self.email})"