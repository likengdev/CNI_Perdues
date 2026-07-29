from django.test import TestCase
from apps.annonces.services.cni_parser import ServiceParserCNI

class TestServiceParserCNI(TestCase):
    def setUp(self):
        self.parser = ServiceParserCNI()

    def test_parser_recto_succes(self):
        mots_simules = [
            {"text": "REPUBLIQUE", "confidence": 0.99, "x": 0.1, "y": 0.1},
            {"text": "NOM", "confidence": 0.98, "x": 0.2, "y": 0.2},
            {"text": "DOE", "confidence": 0.95, "x": 0.3, "y": 0.21},
            {"text": "PRENOM", "confidence": 0.97, "x": 0.2, "y": 0.3},
            {"text": "JOHN", "confidence": 0.96, "x": 0.3, "y": 0.31},
            {"text": "15.08.1990", "confidence": 0.99, "x": 0.4, "y": 0.4},
        ]
        
        resultat = self.parser.parser_recto(mots_simules)
        
        self.assertEqual(resultat["nom"], "DOE")
        self.assertEqual(resultat["prenoms"], "JOHN")
        self.assertEqual(resultat["date_naissance"], "15.08.1990")

    def test_parser_recto_champs_manquants(self):
        mots_simules = [
            {"text": "NOM", "confidence": 0.98, "x": 0.2, "y": 0.2},
            # Le nom est flou, confidence faible
            {"text": "INCONNU", "confidence": 0.50, "x": 0.3, "y": 0.21}, 
        ]
        
        resultat = self.parser.parser_recto(mots_simules)
        
        # Le seuil de confiance minimum est 0.80, donc le nom doit être vide
        self.assertEqual(resultat.get("nom", ""), "")

    def test_parser_verso_succes(self):
        mots_simules = [
            {"text": "LIEU", "confidence": 0.99, "x": 0.1, "y": 0.1},
            {"text": "DOUALA", "confidence": 0.95, "x": 0.2, "y": 0.11},
            {"text": "CE34983281", "confidence": 0.98, "x": 0.5, "y": 0.5},
        ]
        
        resultat = self.parser.parser_verso(mots_simules)
        
        self.assertEqual(resultat["lieu_naissance"], "DOUALA")
        self.assertEqual(resultat["numero_cni"], "CE34983281")

    def test_parser_verso_numero_invalide(self):
        mots_simules = [
            {"text": "LIEU", "confidence": 0.99, "x": 0.1, "y": 0.1},
            {"text": "YAOUNDE", "confidence": 0.95, "x": 0.2, "y": 0.11},
            # Format invalide pour le numero CNI (lettres au milieu)
            {"text": "123AB4567", "confidence": 0.98, "x": 0.5, "y": 0.5}, 
        ]
        
        resultat = self.parser.parser_verso(mots_simules)
        
        self.assertEqual(resultat["lieu_naissance"], "YAOUNDE")
        self.assertEqual(resultat.get("numero_cni", ""), "")
