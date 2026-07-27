from apps.annonces.models import Annonce

from .models import MiseEnRelation


class ServiceExpirationMiseEnRelation:
    """
    Vérification "à la volée" de l'expiration des mises en relation
    (choix retenu plutôt qu'une tâche planifiée type Celery, pour
    rester sans dépendance supplémentaire). Appelée depuis les points
    d'entrée où une donnée périmée fausserait la réponse (recherche
    d'annonces, confirmation de restitution) -- pas de surveillance
    en arrière-plan, seulement un nettoyage déclenché par l'usage
    normal du système.
    """

    def nettoyer(self):
        """
        Remet chaque annonce concernée au statut 'publiee' et supprime
        la mise en relation expirée sans confirmation du bénéficiaire.
        """
        for mise_en_relation in MiseEnRelation.objects.select_related('annonce').all():
            if mise_en_relation.est_expiree():
                annonce = mise_en_relation.annonce
                annonce.statut = Annonce.StatutAnnonce.PUBLIEE
                annonce.save()
                mise_en_relation.delete()