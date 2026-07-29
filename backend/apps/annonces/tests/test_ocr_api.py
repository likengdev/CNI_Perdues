from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

class TestOCRAPIPipeline(APITestCase):

    @patch('apps.annonces.services.pipeline.PipelineExtractionCNI.executer')
    def test_extraction_cni_api_success(self, mock_executer):
        mock_executer.return_value = {
            "nom_titulaire": "MOCKNAME",
            "prenom_titulaire": "MOCKPRENOM",
            "date_naissance": "01.01.2000",
            "lieu_naissance": "MOCKCITY",
            "numero_carte": "AB12345678",
            "photo_titulaire_base64": "base64encodedstring"
        }

        valid_gif = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        image_recto = SimpleUploadedFile("recto.gif", valid_gif, content_type="image/gif")
        image_verso = SimpleUploadedFile("verso.gif", valid_gif, content_type="image/gif")

        url = reverse('annonces:extraire-informations')
        response = self.client.post(url, {
            'photo_recto': image_recto,
            'photo_verso': image_verso
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nom_titulaire"], "MOCKNAME")
        self.assertEqual(response.data["numero_carte"], "AB12345678")
        
    @patch('apps.annonces.services.pipeline.PipelineExtractionCNI.executer')
    def test_extraction_cni_api_error_handling(self, mock_executer):
        mock_executer.return_value = {
            "nom_titulaire": "",
            "prenom_titulaire": "",
            "date_naissance": "",
            "lieu_naissance": "",
            "numero_carte": "",
            "photo_titulaire_base64": ""
        }

        valid_gif = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        image_recto = SimpleUploadedFile("bad_recto.gif", valid_gif, content_type="image/gif")
        image_verso = SimpleUploadedFile("bad_verso.gif", valid_gif, content_type="image/gif")

        url = reverse('annonces:extraire-informations')
        response = self.client.post(url, {
            'photo_recto': image_recto,
            'photo_verso': image_verso
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nom_titulaire"], "")
        self.assertEqual(response.data["numero_carte"], "")
