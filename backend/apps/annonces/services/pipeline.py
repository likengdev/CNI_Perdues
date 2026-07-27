import cv2
import numpy as np

from .cni_parser import ServiceParserCNI
from .doctr_engine import ServiceOCRDocTR
from .photo_extractor import ServicePhotoExtractor
from .validator import ServiceValidation


class PipelineExtractionCNI:
    """
    Chef d'orchestre : OCR -> parsing -> validation -> extraction photo,
    pour recto et verso. Aucune exception ne remonte : un échec à une
    étape donne des champs vides (contrainte 10.1).

    Important : docTR reçoit l'image BRUTE, sans prétraitement OpenCV
    supplémentaire. docTR embarque son propre prétraitement interne,
    optimisé pour ses modèles -- un traitement maison ajouté par-dessus
    (débruitage, contraste, netteté) dégrade la détection des libellés
    plutôt que de l'améliorer, comme confirmé en comparant avec un test
    isolé sans prétraitement (résultats corrects) contre le pipeline
    avec prétraitement (confusion nom/prénom).
    """

    def __init__(self):
        self.ocr = ServiceOCRDocTR()
        self.parser = ServiceParserCNI()
        self.validation = ServiceValidation()
        self.photo_extractor = ServicePhotoExtractor()

    def _decoder(self, fichier_image):
        donnees = np.frombuffer(fichier_image.read(), np.uint8)
        fichier_image.seek(0)
        return cv2.imdecode(donnees, cv2.IMREAD_COLOR)

    def executer(self, fichier_recto, fichier_verso):
        image_recto = self._decoder(fichier_recto)
        image_verso = self._decoder(fichier_verso)

        mots_recto = self.ocr.lire_mots(image_recto)
        mots_verso = self.ocr.lire_mots(image_verso)

        champs_recto = self.parser.parser_recto(mots_recto)
        champs_verso = self.parser.parser_verso(mots_verso)

        return {
            "nom_titulaire": self.validation.nettoyer_texte(champs_recto["nom"]),
            "prenom_titulaire": self.validation.nettoyer_texte(champs_recto["prenoms"]),
            "date_naissance": self.validation.valider_date(champs_recto["date_naissance"]),
            "lieu_naissance": self.validation.nettoyer_texte(champs_verso["lieu_naissance"]),
            "numero_carte": self.validation.valider_numero_carte(champs_verso["numero_cni"]),
            "photo_titulaire_base64": self.photo_extractor.extraire_base64(image_recto),
        }