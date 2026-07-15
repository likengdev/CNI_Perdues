import re

import cv2
import numpy as np
import pytesseract
from django.conf import settings

pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD


class ServiceExtractionCNI:
    """
    Encapsule toute la logique d'extraction OCR d'une CNI (cahier des
    charges, section 7.B). Recto et verso sont analysés séparément
    (les informations ne sont pas au même endroit sur les deux faces),
    et l'extraction se fait ligne par ligne plutôt que par une seule
    expression régulière globale, ce qui évite qu'un libellé proche
    (ex: "NOM DU PÈRE") ne soit confondu avec le libellé recherché
    (ex: "NOM / SURNAME").

    Contrainte 10.1 respectée : un champ non détecté reste vide, jamais
    d'exception qui bloquerait le parcours du déclarant.
    """

    LABELS_CONNUS = [
        "NOM", "SURNAME", "PRÉNOM", "PRENOM", "GIVEN", "DATE",
        "SEXE", "SEX", "LIEU", "PLACE", "PROFESSION", "SIGNATURE",
        "NUMÉRO", "NUMERO", "TAILLE", "HEIGHT",
    ]

    def __init__(self, image_recto, image_verso):
        self.image_recto = image_recto
        self.image_verso = image_verso

    def _pretraiter(self, image_file):
        """Améliore la lisibilité de l'image avant l'OCR (niveaux de gris + seuillage)."""
        image_bytes = np.frombuffer(image_file.read(), np.uint8)
        image_file.seek(0)
        image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
        gris = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, seuil = cv2.threshold(gris, 150, 255, cv2.THRESH_BINARY)
        return seuil

    def _extraire_texte(self, image_traitee):
        return pytesseract.image_to_string(image_traitee, lang='fra')

    def extraire(self):
        """
        Retourne un dictionnaire des champs détectés. Recto et verso
        sont traités séparément car chaque information (nom, prénoms,
        lieu de naissance, numéro CNI...) se trouve sur une face précise
        de la carte, jamais mélangée entre les deux.
        """
        texte_recto = self._extraire_texte(self._pretraiter(self.image_recto))
        texte_verso = self._extraire_texte(self._pretraiter(self.image_verso))

        return {
            "nom_titulaire": self._chercher_apres_label(texte_recto, ["SURNAME", "NOM"]),
            "prenom_titulaire": self._chercher_apres_label(texte_recto, ["GIVEN NAMES", "PRÉNOMS", "PRENOMS"]),
            "date_naissance": self._chercher_date(texte_recto),
            "lieu_naissance": self._chercher_apres_label(texte_verso, ["PLACE OF BIRTH", "LIEU DE NAISSANCE"]),
            "numero_carte": self._chercher_numero_cni(texte_verso),
        }

    def _nettoyer_lignes(self, texte):
        return [ligne.strip() for ligne in texte.splitlines() if ligne.strip()]

    def _chercher_apres_label(self, texte, labels):
        """
        Sur une CNI, le libellé (ex: "NOM / SURNAME") et la valeur
        (ex: "KAMDEM") se retrouvent après l'OCR sur deux lignes
        séparées. On repère la ligne contenant l'un des libellés
        recherchés, puis on retourne la ligne suivante non vide qui
        ne contient elle-même aucun autre libellé connu -- ce qui
        évite de confondre "NOM / SURNAME" avec "NOM DU PÈRE", par
        exemple.
        """
        lignes = self._nettoyer_lignes(texte)

        for i, ligne in enumerate(lignes):
            ligne_maj = ligne.upper()
            if any(label in ligne_maj for label in labels):
                for suivante in lignes[i + 1:]:
                    suivante_maj = suivante.upper()
                    if any(autre in suivante_maj for autre in self.LABELS_CONNUS):
                        continue
                    return suivante.strip()
        return ""

    def _chercher_date(self, texte):
        """
        Cherche une date au format JJ.MM.AAAA ou JJ/MM/AAAA, en priorité
        sur la ligne contenant "NAISSANCE" ou "BIRTH" (ou juste après),
        pour éviter de confondre avec une date d'expiration.
        """
        lignes = self._nettoyer_lignes(texte)
        for i, ligne in enumerate(lignes):
            if "NAISSANCE" in ligne.upper() or "BIRTH" in ligne.upper():
                for suivante in lignes[i:i + 3]:
                    correspondance = re.search(r"(\d{2}[./]\d{2}[./]\d{4})", suivante)
                    if correspondance:
                        return correspondance.group(1).replace('/', '.')

        correspondance = re.search(r"(\d{2}[./]\d{2}[./]\d{4})", texte)
        return correspondance.group(1).replace('/', '.') if correspondance else ""

    def _chercher_numero_cni(self, texte_verso):
        """
        Le numéro CNI camerounais suit le format 2 lettres + chiffres
        (ex: AA12848533), visible sur le verso. Ce motif est bien plus
        fiable qu'une simple recherche de chiffres, qui capturerait
        n'importe quel autre nombre présent sur la carte.
        """
        correspondance = re.search(r"\b([A-Z]{2}\d{6,9})\b", texte_verso)
        return correspondance.group(1) if correspondance else ""