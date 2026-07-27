import re


class ServiceParserCNI:
    """Interprète les mots OCR selon la structure connue d'une CNI camerounaise."""

    LABELS = [
        "NOM", "NAME", "SURNAME", "NOMISURNAME",
        "PRENOM", "PRÉNOM", "PRÉNOMSIGIVEN", "GIVEN", "NAMES",
        "BIRTH", "DATE", "NAISSANCE",
        "SEX", "SEXE", "LIEU", "PLACE",
        "NUMERO", "NUMÉRO", "NIC",             
        "OF", "DE", "DU", "LA",
    ]
    SEUIL_CONFIANCE_MIN = 0.80 

    def _est_label(self, texte):
        return any(label in texte for label in self.LABELS)

    def _chercher_apres(self, mots, index_label):
        label = mots[index_label]
        for mot in mots[index_label + 1:]:
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
        resultat = {"nom": "", "prenoms": "", "date_naissance": "", "confidence": {}}

        dates = [m for m in mots if re.search(r"\d{2}\.\d{2}\.\d{4}", m["text"])]
        if dates:
            resultat["date_naissance"] = dates[0]["text"]
            resultat["confidence"]["date_naissance"] = dates[0]["confidence"]

        for index, mot in enumerate(mots):
            if "NOMISURNAME" in mot["text"] or mot["text"] == "NOM":
                valeur = self._chercher_apres(mots, index)
                if valeur:
                    resultat["nom"] = valeur["text"]
                    resultat["confidence"]["nom"] = valeur["confidence"]
                    break

        for index, mot in enumerate(mots):
            if "PRENOM" in mot["text"] or "GIVEN" in mot["text"]:
                valeur = self._chercher_apres(mots, index)
                if valeur:
                    resultat["prenoms"] = valeur["text"]
                    resultat["confidence"]["prenoms"] = valeur["confidence"]
                    break

        return resultat

    def parser_verso(self, mots):
        resultat = {"lieu_naissance": "", "numero_cni": "", "confidence": {}}

        for index, mot in enumerate(mots):
            if "LIEU" in mot["text"] or "PLACE" in mot["text"]:
                valeur = self._chercher_apres(mots, index)
                if valeur:
                    resultat["lieu_naissance"] = valeur["text"]
                    resultat["confidence"]["lieu_naissance"] = valeur["confidence"]
                    break

        for mot in mots:
            if re.fullmatch(r"[A-Z]{1,2}\d{8}", mot["text"]):
                resultat["numero_cni"] = mot["text"]
                resultat["confidence"]["numero_cni"] = mot["confidence"]
                break

        return resultat