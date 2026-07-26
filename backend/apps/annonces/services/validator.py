import re


class ServiceValidation:
    """Nettoie et valide le format des champs extraits, jamais d'exception -- champ invalide devient vide."""

    def valider_date(self, date_brute):
        if not re.fullmatch(r"\d{2}\.\d{2}\.\d{4}", date_brute or ""):
            return ""
        jj, mm, aaaa = date_brute.split('.')
        if not (1 <= int(jj) <= 31 and 1 <= int(mm) <= 12):
            return ""
        return date_brute

    def valider_numero_carte(self, valeur_brute):
        if re.fullmatch(r"[A-Z]{1,2}\d{8}", (valeur_brute or "").strip()):
            return valeur_brute.strip()
        return ""

    def nettoyer_texte(self, valeur):
        return (valeur or "").strip()