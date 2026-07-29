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
        "SEX", "SEXE", "LIEU", "PLACE",
        "NUMERO", "NUMÉRO", "NIC",
        "PÈRE", "MÈRE", "MOTHER", "FATHER",
    ]
    SEUIL_CONFIANCE_MIN = 0.80

    def _est_label(self, texte):
        # We only skip if the text is exactly a label or contains a long label
        return any(label == texte or (len(label) > 3 and label in texte) for label in self.LABELS)

    def _identifiant(self, mot):
        return (round(mot["x"], 4), round(mot["y"], 4), mot["text"])

    def _chercher_apres(self, mots, index_label, deja_utilises):
        label = mots[index_label]
        for mot in mots[index_label + 1:]:
            if self._identifiant(mot) in deja_utilises:
                continue
            if self._est_label(mot["text"]):
                continue
            if re.search(r"\d{2}\.\d{2}\.\d{4}", mot["text"]):
                continue
            if mot["y"] < label["y"]:
                continue
            if mot["confidence"] < self.SEUIL_CONFIANCE_MIN:
                continue
            return mot
        return None

    def parser_recto(self, mots):
        """Nom, prénoms, date de naissance -- présents sur le recto."""
        resultat = {"nom": "", "prenoms": "", "date_naissance": "", "confidence": {}}
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

        for index, mot in enumerate(mots):
            if "PLACE" in mot["text"] or "LIEU" in mot["text"]:
                valeur = self._chercher_apres(mots, index, deja_utilises)
                if valeur:
                    resultat["lieu_naissance"] = valeur["text"]
                    resultat["confidence"]["lieu_naissance"] = valeur["confidence"]
                    deja_utilises.add(self._identifiant(valeur))
                    break

        for mot in mots:
            if re.fullmatch(r"[A-Z]{1,2}\d{8}", mot["text"]):
                resultat["numero_cni"] = mot["text"]
                resultat["confidence"]["numero_cni"] = mot["confidence"]
                break

        return resultat