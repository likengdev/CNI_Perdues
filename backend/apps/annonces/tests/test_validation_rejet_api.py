from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.administration.models import Administrateur
from apps.annonces.models import Annonce
from apps.historique.models import Historique
from apps.utilisateurs.models import Utilisateur


def creer_image(nom):
    """Petit GIF valide accepté par ImageField (même convention que test_ocr_api)."""
    return SimpleUploadedFile(
        nom,
        b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
        content_type="image/gif",
    )


class TestValidationRejetAnnonceAPI(APITestCase):

    def setUp(self):
        self.admin = Administrateur.objects.create_user(
            email='admin@test.fr', nom='Admin', password='motdepasse'
        )
        self.declarant = Utilisateur.objects.create(
            telephone='690000000',
            nom='Nom',
            prenom='Prenom',
            ville='Douala',
            quartier='Bonanjo',
        )

    def creer_annonce(self, statut=Annonce.StatutAnnonce.EN_ATTENTE):
        return Annonce.objects.create(
            declarant=self.declarant,
            photo_recto=creer_image('recto.gif'),
            photo_verso=creer_image('verso.gif'),
            nom_titulaire='TITULAIRE',
            prenom_titulaire='Prenom',
            date_naissance='1990-08-15',
            lieu_naissance='Yaounde',
            numero_carte='AB12345678',
            photo_titulaire=creer_image('titulaire.gif'),
            position_cni=Annonce.PositionCNI.EN_MA_POSSESSION,
            statut=statut,
        )

    def test_valider_annonce_ok(self):
        annonce = self.creer_annonce()
        self.client.force_authenticate(user=self.admin)
        url = reverse('annonces:valider-annonce', kwargs={'pk': annonce.id})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['statut'], Annonce.StatutAnnonce.PUBLIEE)
        annonce.refresh_from_db()
        self.assertEqual(annonce.statut, Annonce.StatutAnnonce.PUBLIEE)
        self.assertTrue(
            Historique.objects.filter(type_action=Historique.TypeAction.VALIDATION).exists()
        )

    def test_valider_annonce_necessite_authentification(self):
        annonce = self.creer_annonce()
        url = reverse('annonces:valider-annonce', kwargs={'pk': annonce.id})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        annonce.refresh_from_db()
        self.assertEqual(annonce.statut, Annonce.StatutAnnonce.EN_ATTENTE)

    def test_valider_annonce_deja_traitee_refusee(self):
        annonce = self.creer_annonce(statut=Annonce.StatutAnnonce.PUBLIEE)
        self.client.force_authenticate(user=self.admin)
        url = reverse('annonces:valider-annonce', kwargs={'pk': annonce.id})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valider_annonce_inexistante_404(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('annonces:valider-annonce', kwargs={'pk': 99999})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_rejeter_annonce_ok(self):
        annonce = self.creer_annonce()
        self.client.force_authenticate(user=self.admin)
        url = reverse('annonces:rejeter-annonce', kwargs={'pk': annonce.id})

        response = self.client.post(
            url, {'motif_rejet': 'Photo illisible'}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['statut'], Annonce.StatutAnnonce.REJETEE)
        annonce.refresh_from_db()
        self.assertEqual(annonce.statut, Annonce.StatutAnnonce.REJETEE)
        self.assertEqual(annonce.motif_rejet, 'Photo illisible')
        self.assertTrue(
            Historique.objects.filter(type_action=Historique.TypeAction.REJET).exists()
        )

    def test_rejeter_annonce_sans_motif_refuse(self):
        annonce = self.creer_annonce()
        self.client.force_authenticate(user=self.admin)
        url = reverse('annonces:rejeter-annonce', kwargs={'pk': annonce.id})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        annonce.refresh_from_db()
        self.assertEqual(annonce.statut, Annonce.StatutAnnonce.EN_ATTENTE)
        self.assertFalse(
            Historique.objects.filter(type_action=Historique.TypeAction.REJET).exists()
        )

    def test_rejeter_annonce_deja_traitee_refusee(self):
        annonce = self.creer_annonce(statut=Annonce.StatutAnnonce.REJETEE)
        self.client.force_authenticate(user=self.admin)
        url = reverse('annonces:rejeter-annonce', kwargs={'pk': annonce.id})

        response = self.client.post(
            url, {'motif_rejet': 'Deja traitee'}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
