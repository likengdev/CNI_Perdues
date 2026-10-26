from unittest.mock import patch
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


def creer_image(nom="test.jpg"):
    buf = BytesIO()
    im = Image.new('RGB', (100, 100), color='white')
    im.save(buf, format='JPEG')
    buf.seek(0)
    return SimpleUploadedFile(nom, buf.read(), content_type="image/jpeg")


class TestOCRAPIPipeline(APITestCase):

    @patch('apps.annonces.services.pipeline.PipelineExtractionCNI.executer')
    def test_extraction_cni_api_success(self, mock_executer):
        mock_executer.return_value = {
            "nom_titulaire": "MOCKNAME",
            "prenom_titulaire": "MOCKPRENOM",
            "date_naissance": "01.01.2000",
            "lieu_naissance": "MOCKCITY",
            "numero_carte": "AB12345678",
            "photo_titulaire_base64": "base64encodedstring",
            "confiances": {},
            "qualite_images": {},
            "type_document": "cni",
        }

        image_recto = creer_image("recto.jpg")
        image_verso = creer_image("verso.jpg")

        url = reverse('annonces:extraire-informations')
        response = self.client.post(url, {
            'photo_recto': image_recto,
            'photo_verso': image_verso,
            'type_document': 'cni',
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nom_titulaire"], "MOCKNAME")
        self.assertEqual(response.data["numero_carte"], "AB12345678")
        
    @patch('apps.annonces.services.pipeline.PipelineExtractionCNI.executer')
    def test_extraction_passeport_api_success(self, mock_executer):
        mock_executer.return_value = {
            "nom_titulaire": "FOMEDJIEU",
            "prenom_titulaire": "YVES",
            "date_naissance": "1968-11-19",
            "lieu_naissance": "FOTO",
            "numero_carte": "AA367126",
            "photo_titulaire_base64": "base64encodedstring",
            "confiances": {
                "nom": 0.95,
                "prenoms": 0.99,
                "date_naissance": 1.0,
                "lieu_naissance": 0.98,
                "numero_carte": 1.0,
            },
            "qualite_images": {},
            "type_document": "passeport",
            "mrz": {"type": "PO", "numero": "AA367126"},
        }

        image_recto = creer_image("passeport.jpg")

        url = reverse('annonces:extraire-informations')
        response = self.client.post(url, {
            'photo_recto': image_recto,
            'type_document': 'passeport',
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nom_titulaire"], "FOMEDJIEU")
        self.assertEqual(response.data["prenom_titulaire"], "YVES")
        self.assertEqual(response.data["numero_carte"], "AA367126")
        self.assertEqual(response.data["type_document"], "passeport")

    @patch('apps.annonces.services.pipeline.PipelineExtractionCNI.executer')
    def test_extraction_cni_api_error_handling(self, mock_executer):
        mock_executer.return_value = {
            "nom_titulaire": "",
            "prenom_titulaire": "",
            "date_naissance": "",
            "lieu_naissance": "",
            "numero_carte": "",
            "photo_titulaire_base64": "",
            "confiances": {},
            "qualite_images": {},
            "type_document": "cni",
        }

        image_recto = creer_image("bad_recto.jpg")
        image_verso = creer_image("bad_verso.jpg")

        url = reverse('annonces:extraire-informations')
        response = self.client.post(url, {
            'photo_recto': image_recto,
            'photo_verso': image_verso,
            'type_document': 'cni',
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nom_titulaire"], "")
        self.assertEqual(response.data["numero_carte"], "")
