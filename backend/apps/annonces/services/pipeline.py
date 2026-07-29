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
        try:
            image_recto = self._decoder(fichier_recto)
            image_verso = self._decoder(fichier_verso)

            mots_recto = self.ocr.lire_mots(image_recto) if image_recto is not None else []
            mots_verso = self.ocr.lire_mots(image_verso) if image_verso is not None else []

            champs_recto = self.parser.parser_recto(mots_recto)
            champs_verso = self.parser.parser_verso(mots_verso)

            photo_base64 = ""
            if image_recto is not None:
                photo_base64 = self.photo_extractor.extraire_base64(image_recto)

            return {
                "nom_titulaire": self.validation.nettoyer_texte(champs_recto.get("nom", "")),
                "prenom_titulaire": self.validation.nettoyer_texte(champs_recto.get("prenoms", "")),
                "date_naissance": self.validation.valider_date(champs_recto.get("date_naissance", "")),
                "lieu_naissance": self.validation.nettoyer_texte(champs_verso.get("lieu_naissance", "")),
                "numero_carte": self.validation.valider_numero_carte(champs_verso.get("numero_cni", "")),
                "photo_titulaire_base64": photo_base64,
            }
        except Exception:
            return {
                "nom_titulaire": "",
                "prenom_titulaire": "",
                "date_naissance": "",
                "lieu_naissance": "",
                "numero_carte": "",
                "photo_titulaire_base64": "",
            }