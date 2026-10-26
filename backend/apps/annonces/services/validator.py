import re


class ServiceValidation:
    """Nettoie et valide le format des champs extraits, jamais d'exception -- champ invalide devient vide."""

    def valider_date(self, date_brute):
        """
        Accepte JJ.MM.AAAA (format CNI) ou AAAA-MM-JJ.
        Renvoie toujours AAAA-MM-JJ pour le DateField Django / le formulaire.
        """
        valeur = (date_brute or "").strip()
        if re.fullmatch(r"\d{2}\.\d{2}\.\d{4}", valeur):
            jj, mm, aaaa = valeur.split('.')
            if not (1 <= int(jj) <= 31 and 1 <= int(mm) <= 12):
                return ""
            return f"{aaaa}-{mm}-{jj}"
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", valeur):
            aaaa, mm, jj = valeur.split('-')
            if not (1 <= int(jj) <= 31 and 1 <= int(mm) <= 12):
                return ""
            return valeur
        return ""

    def valider_numero_carte(self, valeur_brute):
        valeur = (valeur_brute or "").strip().upper().replace('<', '')
        if re.fullmatch(r"[A-Z]{1,2}\d{8}", valeur):
            return valeur
        return ""

    def valider_numero_passeport(self, valeur_brute):
        valeur = (valeur_brute or "").strip().upper().replace('<', '').replace(' ', '')
        if re.fullmatch(r"[A-Z]{1,2}\d{6,9}", valeur):
            return valeur
        if re.fullmatch(r"[A-Z0-9<]{6,9}", valeur):
            return valeur
        return ""

    def normaliser_numero_document(self, valeur_brute):
        valeur = (valeur_brute or "").strip().upper().replace('<', '').replace(' ', '')
        return valeur

    def nettoyer_texte(self, valeur):
        return (valeur or "").strip()