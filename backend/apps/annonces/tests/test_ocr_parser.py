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

    def test_parser_verso_ne_prend_pas_les_mots_du_bloc_mere(self):
        """
        Régression : le mot "LA" (du bloc "NOM DE LA MÈRE"), situé au-dessus
        du libellé mais diagonalement proche, ne doit plus être pris comme
        lieu de naissance. La valeur correcte "DSCHANG" est sous le libellé.
        """
        mots = [
            # Bloc "NOM DE LA MÈRE" -- au-dessus du libellé LIEU
            {"text": "NOM", "confidence": 0.99, "x": 0.1979, "y": 0.5576},
            {"text": "DE", "confidence": 0.99, "x": 0.2331, "y": 0.5566},
            {"text": "LA", "confidence": 0.985, "x": 0.2578, "y": 0.5557},
            {"text": "MERE", "confidence": 0.56, "x": 0.2786, "y": 0.5527},
            {"text": "DJOUELA", "confidence": 0.978, "x": 0.1953, "y": 0.5703},
            # Libellé bilingue réel du verso (concaténé par l'OCR)
            {"text": "NAISSANCE/PLACE", "confidence": 0.875, "x": 0.2552, "y": 0.5957},
            {"text": "OF", "confidence": 1.0, "x": 0.4154, "y": 0.5967},
            {"text": "BIRTH", "confidence": 0.999, "x": 0.4427, "y": 0.5957},
            {"text": "DE", "confidence": 0.999, "x": 0.2318, "y": 0.6045},
            {"text": "LIEU", "confidence": 0.996, "x": 0.1927, "y": 0.6055},
            # Valeur attendue : juste sous le libellé
            {"text": "DSCHANG", "confidence": 0.999, "x": 0.1927, "y": 0.6182},
            # Libellé suivant (profession) -- plus bas, ne doit pas l'emporter
            {"text": "PROFESSION/OCCUPATION", "confidence": 0.913, "x": 0.1862, "y": 0.6445},
        ]

        resultat = self.parser.parser_verso(mots)

        self.assertEqual(resultat["lieu_naissance"], "DSCHANG")

    def test_parser_verso_prototype_reel(self):
        """
        Cas de test avec le prototype de verso fourni au projet (2j.jpeg) :
        la valeur doit venir de la zone géométriquement associée au libellé
        "LIEU DE NAISSANCE / PLACE OF BIRTH", jamais être codée en dur.
        """
        mots = [
            {"text": "NOM", "confidence": 0.996, "x": 0.2018, "y": 0.5127},
            {"text": "DU", "confidence": 0.997, "x": 0.237, "y": 0.5117},
            {"text": "PERE", "confidence": 0.682, "x": 0.2591, "y": 0.5088},
            {"text": "KEMEGNE", "confidence": 1.0, "x": 0.2018, "y": 0.5264},
            {"text": "LEONARD", "confidence": 1.0, "x": 0.3112, "y": 0.5225},
            {"text": "PASCAL", "confidence": 1.0, "x": 0.4167, "y": 0.5195},
            {"text": "DJOUELA", "confidence": 0.978, "x": 0.1953, "y": 0.5703},
            {"text": "MBA", "confidence": 0.998, "x": 0.3151, "y": 0.5693},
            {"text": "LILIE", "confidence": 1.0, "x": 0.3737, "y": 0.5674},
            {"text": "ALINE", "confidence": 0.997, "x": 0.4323, "y": 0.5645},
            {"text": "NAISSANCE/PLACE", "confidence": 0.875, "x": 0.2552, "y": 0.5957},
            {"text": "OF", "confidence": 1.0, "x": 0.4154, "y": 0.5967},
            {"text": "BIRTH", "confidence": 0.999, "x": 0.4427, "y": 0.5957},
            {"text": "DE", "confidence": 0.999, "x": 0.2318, "y": 0.6045},
            {"text": "LIEU", "confidence": 0.996, "x": 0.1927, "y": 0.6055},
            {"text": "DSCHANG", "confidence": 0.999, "x": 0.1927, "y": 0.6182},
            {"text": "PROFESSION/OCCUPATION", "confidence": 0.913, "x": 0.1862, "y": 0.6445},
            {"text": "AA12848533", "confidence": 0.855, "x": 0.1745, "y": 0.7871},
        ]

        resultat = self.parser.parser_verso(mots)

        self.assertEqual(resultat["lieu_naissance"], "DSCHANG")
        self.assertEqual(resultat["numero_cni"], "AA12848533")

    def test_parser_recto_lieu_absent_sur_recto_prototype(self):
        """
        Sur le recto prototype, aucun libellé "LIEU/PLACE" n'est détecté par
        l'OCR : le champ doit rester vide plutôt que de piocher un texte au hasard.
        """
        mots = [
            {"text": "NOMISURNAME", "confidence": 0.994, "x": 0.1875, "y": 0.6885},
            {"text": "KAMDEM", "confidence": 0.999, "x": 0.1914, "y": 0.709},
            {"text": "PRENOMSIGIVEN", "confidence": 0.597, "x": 0.1875, "y": 0.7422},
            {"text": "MARCELJONATHAN", "confidence": 0.997, "x": 0.1862, "y": 0.7539},
            {"text": "OF", "confidence": 0.999, "x": 0.444, "y": 0.7939},
            {"text": "BIRTH", "confidence": 0.957, "x": 0.4727, "y": 0.7891},
            {"text": "SEXEISEX", "confidence": 0.961, "x": 0.5495, "y": 0.7842},
            {"text": "DATE", "confidence": 0.991, "x": 0.1888, "y": 0.8047},
            {"text": "DE", "confidence": 0.986, "x": 0.2396, "y": 0.8037},
            {"text": "NAISSANCEZGATE", "confidence": 0.392, "x": 0.2682, "y": 0.792},
            {"text": "M", "confidence": 0.999, "x": 0.5521, "y": 0.8066},
            {"text": "22.08.2006", "confidence": 0.999, "x": 0.1888, "y": 0.8193},
        ]

        resultat = self.parser.parser_recto(mots)

        self.assertEqual(resultat["nom"], "KAMDEM")
        self.assertEqual(resultat["prenoms"], "MARCELJONATHAN")
        self.assertEqual(resultat["date_naissance"], "22.08.2006")
        self.assertEqual(resultat["lieu_naissance"], "")
