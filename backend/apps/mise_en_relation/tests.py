from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.administration.models import Administrateur
from apps.annonces.models import Annonce
from apps.historique.models import Historique
from apps.utilisateurs.models import Utilisateur

from .models import MiseEnRelation


def creer_image(nom):
    """Petit GIF valide accepté par ImageField (même convention que test_ocr_api)."""
    return SimpleUploadedFile(
        nom,
        b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;',
        content_type="image/gif",
    )


class TestCloturerRestitutionAPI(APITestCase):

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
        self.beneficiaire = Utilisateur.objects.create(
            telephone='691000000',
            nom='Benef',
            prenom='B',
            ville='Douala',
            quartier='Akwa',
        )

    def creer_mise_en_relation(self, confirmation_beneficiaire=False):
        annonce = Annonce.objects.create(
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
            statut=Annonce.StatutAnnonce.EN_COURS_RESTITUTION,
        )
        return MiseEnRelation.objects.create(
            annonce=annonce,
            beneficiaire=self.beneficiaire,
            confirmation_beneficiaire=confirmation_beneficiaire,
        )

    def test_cloturer_ok(self):
        mise_en_relation = self.creer_mise_en_relation(confirmation_beneficiaire=True)
        self.client.force_authenticate(user=self.admin)
        url = reverse('mise_en_relation:cloturer', kwargs={'mise_en_relation_id': mise_en_relation.id})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['cloture_administrateur'])
        mise_en_relation.refresh_from_db()
        self.assertTrue(mise_en_relation.cloture_administrateur)
        self.assertIsNotNone(mise_en_relation.date_cloture)
        mise_en_relation.annonce.refresh_from_db()
        self.assertEqual(mise_en_relation.annonce.statut, Annonce.StatutAnnonce.RESTITUEE)
        self.assertTrue(
            Historique.objects.filter(type_action=Historique.TypeAction.RESTITUTION).exists()
        )

    def test_cloturer_sans_confirmation_beneficiaire_refuse(self):
        mise_en_relation = self.creer_mise_en_relation(confirmation_beneficiaire=False)
        self.client.force_authenticate(user=self.admin)
        url = reverse('mise_en_relation:cloturer', kwargs={'mise_en_relation_id': mise_en_relation.id})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mise_en_relation.refresh_from_db()
        self.assertFalse(mise_en_relation.cloture_administrateur)
        mise_en_relation.annonce.refresh_from_db()
        self.assertEqual(mise_en_relation.annonce.statut, Annonce.StatutAnnonce.EN_COURS_RESTITUTION)

    def test_cloturer_deja_cloturee_refuse(self):
        mise_en_relation = self.creer_mise_en_relation(confirmation_beneficiaire=True)
        mise_en_relation.cloture_administrateur = True
        mise_en_relation.save()
        self.client.force_authenticate(user=self.admin)
        url = reverse('mise_en_relation:cloturer', kwargs={'mise_en_relation_id': mise_en_relation.id})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cloturer_necessite_authentification(self):
        mise_en_relation = self.creer_mise_en_relation(confirmation_beneficiaire=True)
        url = reverse('mise_en_relation:cloturer', kwargs={'mise_en_relation_id': mise_en_relation.id})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        mise_en_relation.refresh_from_db()
        self.assertFalse(mise_en_relation.cloture_administrateur)

    def test_cloturer_inexistante_404(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('mise_en_relation:cloturer', kwargs={'mise_en_relation_id': 99999})

        response = self.client.post(url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
