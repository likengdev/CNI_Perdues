from django.test import TestCase
from apps.annonces.services.passeport_parser import ServiceParserPasseport
from apps.annonces.services.mrz import ServiceMRZ


class TestServiceParserPasseport(TestCase):
    def setUp(self):
        self.parser = ServiceParserPasseport()
        self.mrz = ServiceMRZ()

    def test_decoder_mrz_standard(self):
        l1 = 'POCMRFOMEDJIEU<<YVES<<<<<<<<<<<<<<<<<<<<<<<<'
        l2 = 'AA367126<9CMR6811196M2711162<<<<<<<<<<<<<<02'
        res = self.mrz.decoder_td3(l1, l2)

        self.assertEqual(res['type'], 'PO')
        self.assertEqual(res['code_pays'], 'CMR')
        self.assertEqual(res['nom'], 'FOMEDJIEU')
        self.assertEqual(res['prenoms'], 'YVES')
        self.assertEqual(res['numero'], 'AA367126')
        self.assertEqual(res['date_naissance'], '1968-11-19')
        self.assertEqual(res['sexe'], 'M')
        self.assertEqual(res['date_expiration'], '2027-11-16')
        self.assertTrue(res['controles']['numero'])
        self.assertTrue(res['controles']['naissance'])
        self.assertTrue(res['controles']['expiration'])
        self.assertTrue(res['controles']['composite'])

    def test_decoder_mrz_avec_confusion_chevrons(self):
        """Teste la robustesse quand l'OCR confond << avec K< ou A parasite dans les fillers."""
        l1 = 'POCMRFOMEDJIEUK<YVES<<<<<<<A<<<<<<<<<<<<<<<<'
        l2 = 'AA367126<9CMR6811196M2711162<<<<<<<<<<<<<<02'
        res = self.mrz.decoder_td3(l1, l2)

        self.assertEqual(res['nom'], 'FOMEDJIEU')
        self.assertEqual(res['prenoms'], 'YVES')
        self.assertEqual(res['numero'], 'AA367126')
        self.assertTrue(res['controles']['numero'])

    def test_parser_passeport_specimen_reel(self):
        """Vérifie le parsing complet sur des mots extraits du spécimen officiel."""
        mots_specimen = [
            {'text': 'REPUBLIQUE', 'confidence': 0.99, 'x': 0.29, 'y': 0.056},
            {'text': 'PASSPORT', 'confidence': 0.98, 'x': 0.18, 'y': 0.092},
            {'text': 'NO', 'confidence': 0.89, 'x': 0.67, 'y': 0.102},
            {'text': 'AA367126', 'confidence': 0.99, 'x': 0.66, 'y': 0.132},
            {'text': '1.NOM', 'confidence': 0.94, 'x': 0.29, 'y': 0.184},
            {'text': 'FOMEDJIEU', 'confidence': 0.90, 'x': 0.29, 'y': 0.222},
            {'text': '2.PRENOMS', 'confidence': 0.85, 'x': 0.30, 'y': 0.261},
            {'text': 'YVES', 'confidence': 0.99, 'x': 0.29, 'y': 0.296},
            {'text': '4.DATE', 'confidence': 0.90, 'x': 0.29, 'y': 0.412},
            {'text': 'NAISSANCE', 'confidence': 0.99, 'x': 0.36, 'y': 0.412},
            {'text': '19.11.1968', 'confidence': 0.96, 'x': 0.29, 'y': 0.446},
            {'text': '6.LIEU', 'confidence': 0.85, 'x': 0.43, 'y': 0.488},
            {'text': 'PLACE', 'confidence': 0.87, 'x': 0.56, 'y': 0.484},
            {'text': 'FOTO', 'confidence': 0.98, 'x': 0.42, 'y': 0.517},
            {'text': 'POCMRFOMEDJIEUK<YVES<<<<<<<A<<<<<<<<<<<<<<<<', 'confidence': 0.64, 'x': 0.06, 'y': 0.805},
            {'text': 'AA367126<9CMR6811196M2711162<<<<<<<<<<<<<<02', 'confidence': 0.82, 'x': 0.06, 'y': 0.875},
        ]

        resultat = self.parser.extraire(mots_specimen)

        self.assertEqual(resultat['nom_titulaire'], 'FOMEDJIEU')
        self.assertEqual(resultat['prenom_titulaire'], 'YVES')
        self.assertEqual(resultat['date_naissance'], '1968-11-19')
        self.assertEqual(resultat['lieu_naissance'], 'FOTO')
        self.assertEqual(resultat['numero_carte'], 'AA367126')
        self.assertEqual(resultat['type_document'], 'passeport')
        self.assertIsNotNone(resultat['mrz'])
        self.assertTrue(resultat['confiance']['numero_carte'] >= 0.90)

    def test_parser_passeport_visuel_sans_mrz(self):
        """Si la MRZ est tronquée ou illisible, l'extraction visuelle prend le relais."""
        mots_sans_mrz = [
            {'text': 'AA367126', 'confidence': 0.99, 'x': 0.66, 'y': 0.132},
            {'text': '1.NOM', 'confidence': 0.94, 'x': 0.29, 'y': 0.184},
            {'text': 'KAMGA', 'confidence': 0.92, 'x': 0.29, 'y': 0.222},
            {'text': '2.PRENOMS', 'confidence': 0.85, 'x': 0.30, 'y': 0.261},
            {'text': 'JEAN', 'confidence': 0.95, 'x': 0.29, 'y': 0.296},
            {'text': '15.08.1995', 'confidence': 0.98, 'x': 0.29, 'y': 0.446},
            {'text': '6.LIEU', 'confidence': 0.85, 'x': 0.43, 'y': 0.488},
            {'text': 'BAFOUSSAM', 'confidence': 0.95, 'x': 0.42, 'y': 0.517},
        ]

        resultat = self.parser.extraire(mots_sans_mrz)

        self.assertEqual(resultat['nom_titulaire'], 'KAMGA')
        self.assertEqual(resultat['prenom_titulaire'], 'JEAN')
        self.assertEqual(resultat['date_naissance'], '15.08.1995')
        self.assertEqual(resultat['lieu_naissance'], 'BAFOUSSAM')
        self.assertEqual(resultat['numero_carte'], 'AA367126')

    def test_parser_passeport_aucun_mot(self):
        """Aucun mot ne doit pas lever d'exception et renvoyer des valeurs vides sécurisées."""
        resultat = self.parser.extraire([])
        self.assertEqual(resultat['nom_titulaire'], '')
        self.assertEqual(resultat['prenom_titulaire'], '')
        self.assertEqual(resultat['date_naissance'], '')
        self.assertEqual(resultat['lieu_naissance'], '')
        self.assertEqual(resultat['numero_carte'], '')
        self.assertIsNone(resultat['mrz'])
