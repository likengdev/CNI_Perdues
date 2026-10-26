import logging
import cv2
import numpy as np

from .cni_parser import ServiceParserCNI
from .doctr_engine import ServiceOCRDocTR
from .photo_extractor import ServicePhotoExtractor
from .validator import ServiceValidation
from .passeport_parser import ServiceParserPasseport

logger = logging.getLogger(__name__)


class ServiceQualiteImage:
    """Évalue la qualité d'une image avant OCR."""

    @staticmethod
    def calculer_flou(image):
        laplacien = cv2.Laplacian(image, cv2.CV_64F)
        return float(laplacien.var())

    @staticmethod
    def calculer_luminosite(image):
        gris = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return float(np.mean(gris))

    @staticmethod
    def est_floue(image, seuil=100):
        return ServiceQualiteImage.calculer_flou(image) < seuil

    @staticmethod
    def est_sombre(image, seuil=60):
        return ServiceQualiteImage.calculer_luminosite(image) < seuil

    @staticmethod
    def est_trop_claire(image, seuil=200):
        return ServiceQualiteImage.calculer_luminosite(image) > seuil

    @staticmethod
    def evaluer(image):
        flou = ServiceQualiteImage.calculer_flou(image)
        luminosite = ServiceQualiteImage.calculer_luminosite(image)
        problemes = []
        if flou < 100:
            problemes.append("image_floue")
        if luminosite < 60:
            problemes.append("image_sombre")
        elif luminosite > 200:
            problemes.append("image_trop_claire")
        return {
            "flou": round(flou, 2),
            "luminosite": round(luminosite, 2),
            "problemes": problemes,
            "qualite_ok": len(problemes) == 0,
        }


class PipelineExtractionCNI:
    """
    Chef d'orchestre : OCR -> parsing -> validation -> extraction photo,
    pour recto et verso. Aucune exception ne remonte : un échec à une
    étape donne des champs vides (contrainte 10.1).
    """

    def __init__(self):
        self.ocr = ServiceOCRDocTR()
        self.parser = ServiceParserCNI()
        self.parser_passeport = ServiceParserPasseport()
        self.validation = ServiceValidation()
        self.photo_extractor = ServicePhotoExtractor()
        self.qualite = ServiceQualiteImage()

    def _decoder(self, fichier_image):
        donnees = np.frombuffer(fichier_image.read(), np.uint8)
        fichier_image.seek(0)
        return cv2.imdecode(donnees, cv2.IMREAD_COLOR)

    def _pretraiter_si_necessaire(self, image, mots):
        """Prétraitement uniquement si l'OCR initial n'a rien trouvé, et
        jamais au détriment des résultats existants (fiabilité avant tout)."""
        if image is None:
            return mots
        if mots:
            return mots
        from .preprocessing import ServicePretraitement
        image_traitee = ServicePretraitement().corriger(image)
        mots_traites = self.ocr.lire_mots(image_traitee)
        if len(mots_traites) > len(mots):
            return mots_traites
        return mots

    def _extraire_numero_recto(self, mots):
        """Fallback : cherche un numéro CNI sur le recto (format 1-2 lettres + 8 chiffres)."""
        import re
        for mot in mots:
            if re.fullmatch(r"[A-Z]{1,2}\d{8}", mot["text"]):
                return mot
        for mot in mots:
            if re.fullmatch(r"\d{9,10}", mot["text"]):
                return mot
        return None

    def executer(self, fichier_recto, fichier_verso=None, type_document='cni'):
        try:
            type_document = (type_document or 'cni').lower()
            image_recto = self._decoder(fichier_recto) if fichier_recto is not None else None
            image_verso = self._decoder(fichier_verso) if fichier_verso is not None else None

            qualite_recto = self.qualite.evaluer(image_recto) if image_recto is not None else {"qualite_ok": False, "problemes": ["image_manquante"]}
            qualite_verso = self.qualite.evaluer(image_verso) if image_verso is not None else {"qualite_ok": False, "problemes": []}

            if type_document == 'passeport':
                mots_recto = self.ocr.lire_mots(image_recto) if image_recto is not None else []
                mots_verso = self.ocr.lire_mots(image_verso) if image_verso is not None else []
                mots_recto = self._pretraiter_si_necessaire(image_recto, mots_recto)

                donnees = self.parser_passeport.extraire(mots_recto, image=image_recto)
                if (not donnees.get('numero_carte')) and mots_verso:
                    donnees_v = self.parser_passeport.extraire(mots_verso, image=image_verso)
                    if donnees_v.get('numero_carte'):
                        for cle in ['nom_titulaire', 'prenom_titulaire', 'date_naissance', 'lieu_naissance', 'numero_carte']:
                            if not donnees.get(cle) and donnees_v.get(cle):
                                donnees[cle] = donnees_v[cle]
                        if donnees_v.get('mrz'):
                            donnees['mrz'] = donnees_v['mrz']

                photo_base64 = ""
                if image_recto is not None:
                    photo_base64 = self.photo_extractor.extraire_base64(image_recto, type_document='passeport')
                if not photo_base64 and image_verso is not None:
                    photo_base64 = self.photo_extractor.extraire_base64(image_verso, type_document='passeport')

                numero_carte = self.validation.valider_numero_passeport(donnees.get('numero_carte', '')) or self.validation.normaliser_numero_document(donnees.get('numero_carte', ''))
                if numero_carte and not self.validation.valider_numero_passeport(numero_carte):
                    numero_carte = ""

                confiances = {
                    "nom": donnees.get('confiance', {}).get('nom_titulaire', 0),
                    "prenoms": donnees.get('confiance', {}).get('prenom_titulaire', 0),
                    "date_naissance": donnees.get('confiance', {}).get('date_naissance', 0),
                    "lieu_naissance": donnees.get('confiance', {}).get('lieu_naissance', 0),
                    "numero_carte": donnees.get('confiance', {}).get('numero_carte', 0),
                    "photo": 1 if photo_base64 else 0,
                }

                return {
                    "nom_titulaire": self.validation.nettoyer_texte(donnees.get('nom_titulaire', '')),
                    "prenom_titulaire": self.validation.nettoyer_texte(donnees.get('prenom_titulaire', '')),
                    "date_naissance": self.validation.valider_date(donnees.get('date_naissance', '')),
                    "lieu_naissance": self.validation.nettoyer_texte(donnees.get('lieu_naissance', '')),
                    "numero_carte": numero_carte,
                    "photo_titulaire_base64": photo_base64,
                    "confiances": confiances,
                    "qualite_images": {
                        "recto": qualite_recto,
                        "verso": qualite_verso,
                    },
                    "type_document": "passeport",
                    "mrz": donnees.get('mrz'),
                }

            mots_recto = self.ocr.lire_mots(image_recto) if image_recto is not None else []
            mots_verso = self.ocr.lire_mots(image_verso) if image_verso is not None else []

            mots_recto = self._pretraiter_si_necessaire(image_recto, mots_recto)
            mots_verso = self._pretraiter_si_necessaire(image_verso, mots_verso)

            champs_recto = self.parser.parser_recto(mots_recto)
            champs_verso = self.parser.parser_verso(mots_verso)

            numero_carte = self.validation.valider_numero_carte(champs_verso.get("numero_cni", ""))
            if not numero_carte:
                numero_recto = self._extraire_numero_recto(mots_recto)
                if numero_recto:
                    numero_carte = self.validation.valider_numero_carte(numero_recto["text"])
                    champs_recto.setdefault("confidence", {})["numero_carte_recto"] = numero_recto["confidence"]

            photo_base64 = ""
            if image_recto is not None:
                photo_base64 = self.photo_extractor.extraire_base64(image_recto)

            confiances = {
                "nom": champs_recto.get("confidence", {}).get("nom", 0),
                "prenoms": champs_recto.get("confidence", {}).get("prenoms", 0),
                "date_naissance": champs_recto.get("confidence", {}).get("date_naissance", 0),
                "lieu_naissance": champs_verso.get("confidence", {}).get("lieu_naissance", 0) or champs_recto.get("confidence", {}).get("lieu_naissance", 0),
                "numero_carte": champs_verso.get("confidence", {}).get("numero_cni", 0) or champs_recto.get("confidence", {}).get("numero_carte_recto", 0),
                "photo": 1 if photo_base64 else 0,
            }

            return {
                "nom_titulaire": self.validation.nettoyer_texte(champs_recto.get("nom", "")),
                "prenom_titulaire": self.validation.nettoyer_texte(champs_recto.get("prenoms", "")),
                "date_naissance": self.validation.valider_date(champs_recto.get("date_naissance", "")),
                "lieu_naissance": self.validation.nettoyer_texte(champs_verso.get("lieu_naissance", "") or champs_recto.get("lieu_naissance", "")),
                "numero_carte": numero_carte,
                "photo_titulaire_base64": photo_base64,
                "confiances": confiances,
                "qualite_images": {
                    "recto": qualite_recto,
                    "verso": qualite_verso,
                },
                "type_document": "cni",
            }
        except Exception as exc:
            logger.exception("Erreur lors de l'exécution du pipeline d'extraction: %s", exc)
            return {
                "nom_titulaire": "",
                "prenom_titulaire": "",
                "date_naissance": "",
                "lieu_naissance": "",
                "numero_carte": "",
                "photo_titulaire_base64": "",
                "confiances": {},
                "qualite_images": {},
                "type_document": type_document if 'type_document' in locals() else 'cni',
            }
