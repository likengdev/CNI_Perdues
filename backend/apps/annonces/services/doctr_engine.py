import cv2
from doctr.io import DocumentFile
from doctr.models import ocr_predictor


class ServiceOCRDocTR:
    """
    OCR pur via docTR, aucune interprétation métier. Le modèle est chargé
    une seule fois au niveau de la classe (coûteux à charger, réutilisé
    entre les requêtes).

    IMPORTANT : docTR reçoit l'image BRUTE, sans prétraitement OpenCV
    supplémentaire -- un prétraitement maison dégrade la détection des
    libellés plutôt que de l'améliorer (confirmé par comparaison de tests).
    """

    _modele = None

    @classmethod
    def _obtenir_modele(cls):
        if cls._modele is None:
            cls._modele = ocr_predictor(pretrained=True)
        return cls._modele

    def lire_mots(self, image_cv2):
        if image_cv2 is None:
            return []
            
        succes, buffer = cv2.imencode('.jpg', image_cv2)
        if not succes:
            return []

        image_bytes = buffer.tobytes()
        try:
            document = DocumentFile.from_images([image_bytes])
            resultat = self._obtenir_modele()(document)
        except Exception:
            return []

        mots = []
        for page in resultat.pages:
            for bloc in page.blocks:
                for ligne in bloc.lines:
                    for mot in ligne.words:
                        mots.append({
                            "text": mot.value.upper().strip(),
                            "confidence": float(mot.confidence),
                            "x": mot.geometry[0][0],
                            "y": mot.geometry[0][1],
                        })
        return sorted(mots, key=lambda w: (w["y"], w["x"]))