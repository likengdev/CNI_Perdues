"""Parsing spatial des informations visibles du passeport camerounais et fusion MRZ.

Combine l'extraction visuelle spatiale des libellés (1. Nom, 2. Prénoms, 4. Date de naissance,
6. Lieu de naissance, No de passeport) et le décodage MRZ (ICAO 9303 TD3) avec contrôle
par clé de vérification.
"""

import re

from apps.annonces.services.passeport_config import LABELS_PASSEPORT, SEUIL_CONFIANCE_MIN
from apps.annonces.services.mrz import ServiceMRZ


class ServiceParserPasseport:
    """Interprète les mots docTR pour un passeport camerounais et croise avec la MRZ."""

    LABELS = list(LABELS_PASSEPORT)

    def __init__(self):
        self.mrz = ServiceMRZ()

    def _est_label(self, texte):
        texte = (texte or '').upper().strip()
        return any(label == texte or (len(label) > 3 and label in texte) for label in self.LABELS)

    def _identifiant(self, mot):
        return (round(mot.get("x", 0), 4), round(mot.get("y", 0), 4), mot.get("text", ""))

    def _chercher_sous_label(
        self, mots, pred_label, max_dy=0.08, min_dy=0.005, max_dx=0.35, min_confidence=0.70, deja_utilises=None
    ):
        """Recherche spatialement la valeur associée située directement sous ou après un libellé."""
        deja_utilises = deja_utilises or set()
        for w in mots:
            if pred_label(w.get("text", "")):
                candidats = []
                for other in mots:
                    if other == w or self._identifiant(other) in deja_utilises:
                        continue
                    dy = other.get("y", 0) - w.get("y", 0)
                    dx = other.get("x", 0) - w.get("x", 0)
                    if min_dy <= dy <= max_dy and -0.05 <= dx <= max_dx:
                        if other.get("confidence", 0) >= min_confidence and not self._est_label(other.get("text", "")):
                            if not re.search(r"^\d{2}\.\d{2}\.\d{4}$", other.get("text", "")):
                                candidats.append((dy, abs(dx), other))
                if candidats:
                    candidats.sort(key=lambda c: (c[0], c[1]))
                    best = candidats[0][2]
                    line_words = [best]
                    deja_utilises.add(self._identifiant(best))

                    for other in mots:
                        if other == best or other == w or self._identifiant(other) in deja_utilises:
                            continue
                        if abs(other.get("y", 0) - best.get("y", 0)) < 0.03 and other.get("x", 0) > best.get("x", 0):
                            if other.get("confidence", 0) >= min_confidence and not self._est_label(other.get("text", "")):
                                line_words.append(other)
                                deja_utilises.add(self._identifiant(other))

                    line_words.sort(key=lambda m: m.get("x", 0))
                    valeur = " ".join(m.get("text", "") for m in line_words).strip()
                    conf = sum(m.get("confidence", 0) for m in line_words) / len(line_words)
                    return valeur, conf
        return "", 0.0

    def extraire(self, mots, image=None):
        """
        Extrait l'ensemble des informations de la page d'identité du passeport.
        Croise les données visuelles avec la zone MRZ pour une fiabilité maximale.
        """
        mots_tries = sorted(mots or [], key=lambda w: (w.get("y", 0), w.get("x", 0)))
        deja_utilises = set()

        # -------------------------------------------------------------
        # 1. Extraction visuelle des champs
        # -------------------------------------------------------------

        # Numéro de passeport visuel (ex: AA367126 dans le tiers supérieur)
        num_visuel = ""
        conf_num_visuel = 0.0
        for mot in mots_tries:
            texte = mot.get("text", "").replace(' ', '').replace('<', '')
            if re.fullmatch(r"[A-Z]{1,2}\d{6,8}", texte) and mot.get("y", 0) < 0.35:
                num_visuel = texte
                conf_num_visuel = mot.get("confidence", 0)
                deja_utilises.add(self._identifiant(mot))
                break

        # Nom de famille (1. Nom / Surname)
        nom_visuel, conf_nom_visuel = self._chercher_sous_label(
            mots_tries,
            lambda t: "1.NOM" in t or ("NOM" in t and "PRENOM" not in t and "LIEU" not in t and "NAISSANCE" not in t) or "SURNAME" in t,
            deja_utilises=deja_utilises
        )

        # Prénoms (2. Prénoms / Given names)
        prenom_visuel, conf_prenom_visuel = self._chercher_sous_label(
            mots_tries,
            lambda t: "2" in t and ("PRENOM" in t or "GIVEN" in t or "NAMES" in t) or t in ["PRENOM", "PRENOMS", "PRENOMS,", "GIVEN", "NAMES"],
            deja_utilises=deja_utilises
        )

        # Dates au format JJ.MM.AAAA (naissance, délivrance, expiration)
        dates_valides = [m for m in mots_tries if re.fullmatch(r"\d{2}\.\d{2}\.\d{4}", m.get("text", ""))]
        date_naiss_visuel = dates_valides[0]["text"] if len(dates_valides) >= 1 else ""
        conf_date_naiss = dates_valides[0]["confidence"] if len(dates_valides) >= 1 else 0.0

        # Lieu de naissance (6. Lieu de naissance / Place of birth)
        lieu_visuel = ""
        conf_lieu_visuel = 0.0
        for w in mots_tries:
            t = w.get("text", "")
            if ("LICU" in t or "LIEU" in t or "PLACE" in t) and ("DELIVRANCE" not in t and "ISSUE" not in t and "EXPIR" not in t):
                cands = []
                for other in mots_tries:
                    if other == w or self._identifiant(other) in deja_utilises:
                        continue
                    dy = other.get("y", 0) - w.get("y", 0)
                    dx = other.get("x", 0) - w.get("x", 0)
                    # Le lieu de naissance est situé sous le libellé 6
                    if 0.01 <= dy <= 0.07 and -0.08 <= dx <= 0.25:
                        if other.get("confidence", 0) >= 0.70 and not self._est_label(other.get("text", "")):
                            if not re.search(r"\d", other.get("text", "")):
                                cands.append((dy, abs(dx), other))
                if cands:
                    cands.sort(key=lambda c: (c[0], c[1]))
                    lieu_visuel = cands[0][2].get("text", "")
                    conf_lieu_visuel = cands[0][2].get("confidence", 0)
                    deja_utilises.add(self._identifiant(cands[0][2]))
                    break

        # -------------------------------------------------------------
        # 2. Décodage MRZ (ICAO Doc 9303 TD3)
        # -------------------------------------------------------------
        l1, l2 = self.mrz.trouver_lignes(mots_tries)
        mrz_decoded = None
        if l1 and l2:
            mrz_decoded = self.mrz.decoder_td3(l1, l2)

        # -------------------------------------------------------------
        # 3. Fusion et harmonisation intelligente (MRZ + Visuel)
        # -------------------------------------------------------------
        numero_carte = num_visuel
        conf_numero = conf_num_visuel
        nom = nom_visuel
        conf_nom = conf_nom_visuel
        prenom = prenom_visuel
        conf_prenom = conf_prenom_visuel
        date_naissance = date_naiss_visuel
        lieu_naissance = lieu_visuel
        conf_lieu = conf_lieu_visuel

        if mrz_decoded:
            ctrls = mrz_decoded.get("controles", {})

            # Numéro : contrôle checksum ICAO
            mrz_num = mrz_decoded.get("numero", "")
            if mrz_num:
                if ctrls.get("numero") or not numero_carte:
                    numero_carte = mrz_num
                    conf_numero = 1.0 if ctrls.get("numero") else max(conf_numero, 0.90)
                elif numero_carte and numero_carte == mrz_num:
                    conf_numero = 1.0

            # Date de naissance : contrôle checksum ICAO
            mrz_date = mrz_decoded.get("date_naissance", "")
            if mrz_date:
                if ctrls.get("naissance") or not date_naissance:
                    date_naissance = mrz_date
                    conf_date_naiss = 1.0 if ctrls.get("naissance") else max(conf_date_naiss, 0.90)

            # Nom : fusion visuel et MRZ
            mrz_nom = mrz_decoded.get("nom", "").strip()
            if mrz_nom:
                if not nom:
                    nom = mrz_nom
                    conf_nom = 0.90
                elif nom in mrz_nom or mrz_nom in nom:
                    conf_nom = max(conf_nom, 0.95)
                elif conf_nom < 0.80:
                    nom = mrz_nom
                    conf_nom = 0.90

            # Prénoms : fusion visuel et MRZ
            mrz_prenoms = mrz_decoded.get("prenoms", "").strip()
            if mrz_prenoms:
                if not prenom:
                    prenom = mrz_prenoms
                    conf_prenom = 0.90
                elif prenom in mrz_prenoms or mrz_prenoms in prenom:
                    conf_prenom = max(conf_prenom, 0.95)
                elif conf_prenom < 0.80:
                    prenom = mrz_prenoms
                    conf_prenom = 0.90

        return {
            "type_document": "passeport",
            "nom_titulaire": nom,
            "prenom_titulaire": prenom,
            "date_naissance": date_naissance,
            "lieu_naissance": lieu_naissance,
            "numero_carte": numero_carte,
            "confiance": {
                "nom_titulaire": round(conf_nom, 3),
                "prenom_titulaire": round(conf_prenom, 3),
                "date_naissance": round(conf_date_naiss, 3),
                "lieu_naissance": round(conf_lieu, 3),
                "numero_carte": round(conf_numero, 3),
            },
            "mrz": mrz_decoded,
        }
