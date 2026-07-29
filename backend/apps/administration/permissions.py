from rest_framework.permissions import BasePermission


class EstAdministrateurAuthentifie(BasePermission):
    """
    Seul un Administrateur authentifié (email + mot de passe, JWT)
    peut accéder à l'interface d'administration (section 8.2, section 5).
    Différent du reste du projet, resté volontairement ouvert pour les
    déclarants/bénéficiaires (pas d'authentification pour eux).
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)