import re


class ServiceParserCNI:
    """
    Interprète les mots OCR (texte + position + confiance, sortie de
    ServiceOCRDocTR) selon la structure connue d'une CNI camerounaise
    (cahier des charges, section 7.B et point 29 : libellés bilingues
    FR/EN, parfois concaténés par l'OCR).
    """

    LABELS = [
        "NOM", "NAME", "SURNAME",
        "PRENOM", "PRÉNOM", "GIVEN", "NAMES",
        "BIRTH", "DATE", "NAISSANCE",
        "SEX", "SEXE", "LIEU", "PLACE", "DE", "OF",
        "NUMERO", "NUMÉRO", "NIC",
        "PÈRE", "MÈRE", "MOTHER", "FATHER",
    ]
    SEUIL_CONFIANCE_MIN = 0.80

    def _est_label(self, texte):
        # We only skip if the text is exactly a label or contains a long label
        return any(label == texte or (len(label) > 3 and label in texte) for label in self.LABELS)

    def _est_ancre_lieu(self, texte):
        # L'ancre du libellé bilingue "LIEU DE NAISSANCE / PLACE OF BIRTH" :
        # l'OCR concatène parfois les libellés (ex: "NAISSANCE/PLACE").
        return "LIEU" in texte or "PLACE" in texte

    def _chercher_lieu_naissance(self, mots, deja_utilises):
        """
        Recherche explicitement le libellé "LIEU DE NAISSANCE / PLACE OF BIRTH"
        puis la valeur spatialement associée : juste SOUS le libellé et
        horizontalement alignée avec sa zone. Refuse les mots situés au-dessus
        (ex: "LA" du bloc "NOM DE LA MÈRE") qui polluaient l'extraction.
        """
        ancres = [m for m in mots if self._est_ancre_lieu(m["text"])]
        if not ancres:
            return None

        x_min = min(m["x"] for m in ancres)
        x_max = max(m["x"] for m in ancres)
        y_min = min(m["y"] for m in ancres)

        candidats = []
        for mot in mots:
            if self._est_ancre_lieu(mot["text"]):
                continue
            if self._identifiant(mot) in deja_utilises:
                continue
            if self._est_label(mot["text"]):
                continue
            if re.search(r"\d{2}\.\d{2}\.\d{4}", mot["text"]):
                continue
            if mot["confidence"] < self.SEUIL_CONFIANCE_MIN:
                continue

            # La valeur doit être en dessous du libellé, jamais au-dessus.
            dy = mot["y"] - y_min
            if dy < 0 or dy > 0.09:
                continue

            # La valeur doit commencer dans la largeur du libellé (marge).
            if not (x_min - 0.06 <= mot["x"] <= x_max + 0.2):
                continue

            candidats.append((abs(dy), mot))

        if not candidats:
            return None

        candidats.sort(key=lambda c: c[0])
        return candidats[0][1]

    def _identifiant(self, mot):
        return (round(mot["x"], 4), round(mot["y"], 4), mot["text"])

    def _chercher_apres(self, mots, index_label, deja_utilises):
        label = mots[index_label]
        candidats = []
        
        for i, mot in enumerate(mots):
            if i == index_label:
                continue
            if self._identifiant(mot) in deja_utilises:
                continue
            if self._est_label(mot["text"]):
                continue
            if re.search(r"\d{2}\.\d{2}\.\d{4}", mot["text"]):
                continue
            if mot["confidence"] < self.SEUIL_CONFIANCE_MIN:
                continue
            
            # En utilisant les coordonnées, y grandit vers le bas et x vers la droite
            dy = mot["y"] - label["y"]
            dx = mot["x"] - label["x"]
            
            # La valeur doit être approximativement sur la même ligne ou en dessous
            # On autorise un léger décalage vers le haut (-0.05) et on cherche plus loin en bas (0.4)
            if dy > -0.05 and dy < 0.4 and abs(dx) < 0.5:
                # Distance spatiale (euclidienne au carré pour comparer)
                distance = (dx ** 2) + (dy ** 2)
                candidats.append((distance, mot))
                
        if candidats:
            candidats.sort(key=lambda c: c[0])
            return candidats[0][1]
            
        return None

    def parser_recto(self, mots):
        """Nom, prénoms, date de naissance, lieu de naissance -- présents sur le recto."""
        resultat = {"nom": "", "prenoms": "", "date_naissance": "", "lieu_naissance": "", "confidence": {}}
        deja_utilises = set()

        dates = [m for m in mots if re.search(r"\d{2}\.\d{2}\.\d{4}", m["text"])]
        if dates:
            resultat["date_naissance"] = dates[0]["text"]
            resultat["confidence"]["date_naissance"] = dates[0]["confidence"]

        for index, mot in enumerate(mots):
            if "SURNAME" in mot["text"] or mot["text"] == "NOM":
                valeur = self._chercher_apres(mots, index, deja_utilises)
                if valeur:
                    resultat["nom"] = valeur["text"]
                    resultat["confidence"]["nom"] = valeur["confidence"]
                    deja_utilises.add(self._identifiant(valeur))
                    break

        for index, mot in enumerate(mots):
            if "GIVEN" in mot["text"] or "PRENOM" in mot["text"] or "PRÉNOM" in mot["text"]:
                valeur = self._chercher_apres(mots, index, deja_utilises)
                if valeur:
                    resultat["prenoms"] = valeur["text"]
                    resultat["confidence"]["prenoms"] = valeur["confidence"]
                    deja_utilises.add(self._identifiant(valeur))
                    break

        valeur_lieu = self._chercher_lieu_naissance(mots, deja_utilises)
        if valeur_lieu:
            resultat["lieu_naissance"] = valeur_lieu["text"]
            resultat["confidence"]["lieu_naissance"] = valeur_lieu["confidence"]
            deja_utilises.add(self._identifiant(valeur_lieu))

        return resultat

    def parser_verso(self, mots):
        """
        Lieu de naissance et numéro CNI -- présents sur le verso.
        Le numéro CNI suit le format 1-2 lettres + 8 chiffres
        (ex: AA12848533), différent du numéro de document du recto
        (cahier des charges, point 29).
        """
        resultat = {"lieu_naissance": "", "numero_cni": "", "confidence": {}}
        deja_utilises = set()

        valeur_lieu = self._chercher_lieu_naissance(mots, deja_utilises)
        if valeur_lieu:
            resultat["lieu_naissance"] = valeur_lieu["text"]
            resultat["confidence"]["lieu_naissance"] = valeur_lieu["confidence"]
            deja_utilises.add(self._identifiant(valeur_lieu))

        for mot in mots:
            if re.fullmatch(r"[A-Z]{1,2}\d{8}", mot["text"]):
                resultat["numero_cni"] = mot["text"]
                resultat["confidence"]["numero_cni"] = mot["confidence"]
                break

        return resultat