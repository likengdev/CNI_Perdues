from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.annonces.models import Annonce
from apps.administration.models import Administrateur
from apps.historique.models import Historique
from apps.utilisateurs.models import Utilisateur


def creer_image(nom):
    """Petit GIF valide accepté par ImageField (même convention que test_ocr_api)."""
    return SimpleUploadedFile(
        nom,
        b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
        content_type="image/gif",
    )


class AnnonceViewSetFiltresTests(APITestCase):
    """Vérifie le filtrage par statut (simple et multiple) du point d'entrée admin."""

    def setUp(self):
        self.admin = Administrateur.objects.create_user(
            email='admin@cni.dev',
            password='mot-de-passe-admin',
            nom='Admin Test',
        )
        self.client.force_authenticate(user=self.admin)

        self.utilisateur = Utilisateur.objects.create(
            nom='Titulaire',
            prenom='Marcel',
            telephone='699000001',
            ville='Douala',
            quartier='Bonanjo',
        )

        def creer(statut, numero):
            return Annonce.objects.create(
                declarant=self.utilisateur,
                photo_recto=creer_image('recto.gif'),
                photo_verso=creer_image('verso.gif'),
                photo_titulaire=creer_image('titulaire.gif'),
                nom_titulaire='Titulaire',
                prenom_titulaire='Marcel',
                date_naissance='1990-01-01',
                lieu_naissance='Yaoundé',
                numero_carte=numero,
                position_cni=Annonce.PositionCNI.EN_MA_POSSESSION,
                statut=statut,
            )

        self.annonce_publiee = creer(Annonce.StatutAnnonce.PUBLIEE, '100000001')
        self.annonce_en_cours = creer(Annonce.StatutAnnonce.EN_COURS_RESTITUTION, '100000002')
        self.annonce_restituee = creer(Annonce.StatutAnnonce.RESTITUEE, '100000003')
        self.annonce_en_attente = creer(Annonce.StatutAnnonce.EN_ATTENTE, '100000004')
        self.annonce_rejetee = creer(Annonce.StatutAnnonce.REJETEE, '100000005')

    def test_statut_simple(self):
        reponse = self.client.get(reverse('administration:annonce-list'), {'statut': 'publiee'})
        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual({a['id'] for a in reponse.data}, {self.annonce_publiee.id})

    def test_statut_multiple(self):
        reponse = self.client.get(
            reverse('administration:annonce-list'),
            {'statut': 'publiee,en_cours,restituee'},
        )
        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual(
            {a['id'] for a in reponse.data},
            {self.annonce_publiee.id, self.annonce_en_cours.id, self.annonce_restituee.id},
        )

    def test_historique_publiees_exclut_attente_et_rejet(self):
        reponse = self.client.get(
            reverse('administration:annonce-list'),
            {'statut': 'publiee,en_cours,restituee'},
        )
        ids = {a['id'] for a in reponse.data}
        self.assertNotIn(self.annonce_en_attente.id, ids)
        self.assertNotIn(self.annonce_rejetee.id, ids)

    def test_sans_filtre_retourne_tout(self):
        reponse = self.client.get(reverse('administration:annonce-list'))
        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual(len(reponse.data), 5)


class DashboardStatsTests(APITestCase):
    """Vérifie que le compteur d'annonces publiées trace toutes les annonces publiées."""

    def setUp(self):
        self.admin = Administrateur.objects.create_user(
            email='admin@stats.dev',
            password='mot-de-passe-admin',
            nom='Admin Stats',
        )
        self.client.force_authenticate(user=self.admin)
        self.utilisateur = Utilisateur.objects.create(
            nom='Titulaire',
            prenom='Marcel',
            telephone='699000002',
            ville='Douala',
            quartier='Bonanjo',
        )

    def creer_annonce(self, statut, numero):
        return Annonce.objects.create(
            declarant=self.utilisateur,
            photo_recto=creer_image('recto.gif'),
            photo_verso=creer_image('verso.gif'),
            photo_titulaire=creer_image('titulaire.gif'),
            nom_titulaire='Titulaire',
            prenom_titulaire='Marcel',
            date_naissance='1990-01-01',
            lieu_naissance='Yaoundé',
            numero_carte=numero,
            position_cni=Annonce.PositionCNI.EN_MA_POSSESSION,
            statut=statut,
        )

    def test_annonces_publiees_compte_l_historique_complet(self):
        self.creer_annonce(Annonce.StatutAnnonce.PUBLIEE, '200000001')
        self.creer_annonce(Annonce.StatutAnnonce.EN_COURS_RESTITUTION, '200000002')
        self.creer_annonce(Annonce.StatutAnnonce.RESTITUEE, '200000003')
        self.creer_annonce(Annonce.StatutAnnonce.EN_ATTENTE, '200000004')

        reponse = self.client.get(reverse('administration:dashboard_stats'))

        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual(reponse.data['annonces_total'], 4)
        # 1 publiée + 1 en cours + 1 restituée = 3 annonces déjà publiées (trace)
        self.assertEqual(reponse.data['annonces_publiees'], 3)
        self.assertEqual(reponse.data['annonces_en_attente'], 1)
        self.assertEqual(reponse.data['cni_restituees'], 1)


class HistoriqueViewSetTests(APITestCase):
    """Vérifie le filtrage et les statistiques du journal d'historique admin."""

    def setUp(self):
        self.admin = Administrateur.objects.create_user(
            email='admin@historique.dev',
            password='mot-de-passe-admin',
            nom='Admin Historique',
        )
        self.client.force_authenticate(user=self.admin)
        self.utilisateur = Utilisateur.objects.create(
            nom='Titulaire',
            prenom='Marcel',
            telephone='699000003',
            ville='Douala',
            quartier='Bonanjo',
        )
        Historique.enregistrer(
            self.utilisateur,
            Historique.TypeAction.PUBLICATION,
            "Publication de l'annonce CNI 300000001",
        )
        Historique.enregistrer(
            self.utilisateur,
            Historique.TypeAction.VALIDATION,
            "Validation de l'annonce CNI 300000002",
        )
        Historique.enregistrer(
            self.utilisateur,
            Historique.TypeAction.RESTITUTION,
            'Restitution de la CNI 300000003',
        )

    def test_liste_complete(self):
        reponse = self.client.get(reverse('administration:historique-list'))
        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual(len(reponse.data), 3)

    def test_filtre_type_action(self):
        reponse = self.client.get(
            reverse('administration:historique-list'),
            {'type_action': 'publication'},
        )
        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual(len(reponse.data), 1)
        self.assertEqual(reponse.data[0]['type_action'], 'publication')

    def test_filtre_type_action_multiple(self):
        reponse = self.client.get(
            reverse('administration:historique-list'),
            {'type_action': 'publication,validation'},
        )
        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual(len(reponse.data), 2)

    def test_filtre_recherche_utilisateur(self):
        reponse = self.client.get(
            reverse('administration:historique-list'),
            {'recherche': 'Marcel'},
        )
        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual(len(reponse.data), 3)

    def test_filtre_recherche_description(self):
        reponse = self.client.get(
            reverse('administration:historique-list'),
            {'recherche': '300000002'},
        )
        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual(len(reponse.data), 1)
        self.assertEqual(reponse.data[0]['type_action'], 'validation')

    def test_stats(self):
        reponse = self.client.get(reverse('administration:historique-stats'))
        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        self.assertEqual(reponse.data['total'], 3)
        self.assertEqual(reponse.data['par_type']['publication'], 1)
        self.assertEqual(reponse.data['par_type']['validation'], 1)
        self.assertEqual(reponse.data['par_type']['restitution'], 1)
        self.assertEqual(reponse.data['par_type']['rejet'], 0)
