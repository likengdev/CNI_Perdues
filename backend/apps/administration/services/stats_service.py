from django.db.models import Count
from apps.utilisateurs.models import Utilisateur
from apps.annonces.models import Annonce
from apps.mise_en_relation.models import MiseEnRelation
from apps.historique.models import Historique

class StatsService:
    @staticmethod
    def get_dashboard_stats():
        stats = {}
        
        # Utilisateurs
        stats['nombre_total_utilisateurs'] = Utilisateur.objects.count()
        
        # Les déclarants sont les utilisateurs ayant au moins une annonce publiée
        stats['nombre_declarants'] = Utilisateur.objects.filter(annonces_publiees__isnull=False).distinct().count()
        
        # Les bénéficiaires sont les utilisateurs ayant au moins une mise en relation
        stats['nombre_beneficiaires'] = Utilisateur.objects.filter(mises_en_relation__isnull=False).distinct().count()
        
        # Annonces
        annonces = Annonce.objects.all()
        stats['annonces_total'] = annonces.count()
        stats['annonces_en_attente'] = annonces.filter(statut=Annonce.StatutAnnonce.EN_ATTENTE).count()
        stats['annonces_publiees'] = annonces.filter(statut=Annonce.StatutAnnonce.PUBLIEE).count()
        stats['annonces_rejetees'] = annonces.filter(statut=Annonce.StatutAnnonce.REJETEE).count()
        
        # Restitutions
        mises_en_relation = MiseEnRelation.objects.all()
        stats['restitutions_en_cours'] = mises_en_relation.filter(cloture_administrateur=False).count()
        stats['cni_restituees'] = mises_en_relation.filter(cloture_administrateur=True).count()
        
        # Recherches (On peut estimer ça si on trace les recherches, mais ici on prend le nombre de recherches dans l'historique)
        stats['recherches_effectuees'] = Historique.objects.filter(type_action=Historique.TypeAction.CONSULTATION).count()
        
        # Taux de restitution (Restitutions finalisées / Annonces publiées + Restituées)
        total_publiees_ou_restituees = stats['annonces_publiees'] + stats['cni_restituees']
        if total_publiees_ou_restituees > 0:
            stats['taux_restitution'] = round((stats['cni_restituees'] / total_publiees_ou_restituees) * 100, 2)
        else:
            stats['taux_restitution'] = 0.0
            
        # Dernières données (Listes limitées)
        stats['dernieres_inscriptions'] = list(Utilisateur.objects.order_by('-date_creation')[:5].values('id', 'nom', 'prenom', 'telephone', 'date_creation'))
        stats['dernieres_annonces'] = list(Annonce.objects.order_by('-date_creation')[:5].values('id', 'nom_titulaire', 'prenom_titulaire', 'statut', 'date_creation'))
        stats['dernieres_restitutions'] = list(MiseEnRelation.objects.filter(cloture_administrateur=True).order_by('-date_cloture')[:5].values('id', 'annonce__nom_titulaire', 'beneficiaire__nom', 'date_cloture'))
        stats['dernieres_activites'] = list(Historique.objects.order_by('-date_creation')[:5].values('id', 'utilisateur__nom', 'type_action', 'description', 'date_creation'))
        
        return stats
