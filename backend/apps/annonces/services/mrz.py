"""Décodage des lignes MRZ TD3 (passeports) en Python pur.

Aucune dépendance externe : les chiffres de contrôle ICAO 9303 sont
recalculés ici, puis les champs sont relus en tenant compte des
confusions classiques de l'OCR (O/0, I/1, S/5, B/8, Z/2).
"""

import datetime
import re

POIDS_CHIFFRE_CONTROLE = (7, 3, 1)

VALEURS_CARACTERES = {str(chiffre): chiffre for chiffre in range(10)}
for _index, _lettre in enumerate('ABCDEFGHIJKLMNOPQRSTUVWXYZ'):
    VALEURS_CARACTERES[_lettre] = 10 + _index
VALEURS_CARACTERES['<'] = 0

LONGUEUR_LIGNE_TD3 = 44
TOLERANCE_LIGNE = 0.015
SEUIL_TIERS_BAS = 2 / 3


def normaliser_numerique(texte):
    """Corrige les lettres lues à la place de chiffres (champs numériques)."""
    correspondances = {
        'O': '0',
        'D': '0',
        'Q': '0',
        'I': '1',
        'L': '1',
        'S': '5',
        'B': '8',
        'Z': '2',
    }
    return ''.join(correspondances.get(caractere, caractere) for caractere in (texte or ''))


def normaliser_alphabetique(texte):
    """Corrige les chiffres lus à la place de lettres (pays, noms)."""
    correspondances = {
        '0': 'O',
        '1': 'I',
        '5': 'S',
        '8': 'B',
        '2': 'Z',
    }
    return ''.join(correspondances.get(caractere, caractere) for caractere in (texte or ''))


def calculer_chiffre_controle(texte):
    """Chiffre de contrôle ICAO 9303 (poids 7, 3, 1)."""
    total = 0
    for index, caractere in enumerate((texte or '').upper()):
        valeur = VALEURS_CARACTERES.get(caractere, 0)
        total += valeur * POIDS_CHIFFRE_CONTROLE[index % 3]
    return total % 10


def _chiffre_ou_none(caractere):
    return int(caractere) if caractere and caractere.isdigit() else None


def _date_depuis_mrz(aa_mm_jj, type_date='autre'):
    """Convertit AAMMJJ en AAAA-MM-JJ, en appliquant la règle de siècle."""
    if not re.fullmatch(r'\d{6}', aa_mm_jj or ''):
        return ''
    aa, mois, jour = int(aa_mm_jj[0:2]), int(aa_mm_jj[2:4]), int(aa_mm_jj[4:6])
    if type_date == 'naissance':
        siecle = 1900 if aa > (datetime.date.today().year % 100) else 2000
    else:
        siecle = 2000
    try:
        return datetime.date(siecle + aa, mois, jour).isoformat()
    except ValueError:
        return ''


def _nettoyer_noms_mrz(valeur):
    """Transforme NOM<<PRENOM< en texte lisible et retire le filler final."""
    texte = re.sub(r'\s+', ' ', (valeur or '').replace('<', ' ')).strip()
    texte = re.sub(r'([KCS])\1{2,}$', '', texte).strip()
    return texte


def _nettoyer_numero(valeur):
    return (valeur or '').replace('<', '').strip()


def _lignes_depuis_mots(mots):
    """Regroupe les mots docTR en lignes, du haut vers le bas."""
    mots_tries = sorted(mots or [], key=lambda mot: (mot.get('y', 0), mot.get('x', 0)))
    lignes = []
    for mot in mots_tries:
        y = mot.get('y', 0)
        if lignes and abs(y - lignes[-1]['y']) <= TOLERANCE_LIGNE:
            lignes[-1]['mots'].append(mot)
            lignes[-1]['y'] = sum(m.get('y', 0) for m in lignes[-1]['mots']) / len(lignes[-1]['mots'])
        else:
            lignes.append({'y': y, 'mots': [mot]})
    for ligne in lignes:
        ligne['mots'].sort(key=lambda mot: mot.get('x', 0))
    return lignes


class ServiceMRZ:
    """Localisation et décodage des deux lignes MRZ d'un passeport TD3."""

    LONGUEUR_LIGNE = LONGUEUR_LIGNE_TD3
    TOLERANCE_LIGNE = TOLERANCE_LIGNE

    @staticmethod
    def calculer_chiffre_controle(texte):
        return calculer_chiffre_controle(texte)

    def trouver_lignes(self, mots):
        """Renvoie (ligne1, ligne2) ou (None, None) si la MRZ est illisible."""
        if not mots:
            return None, None

        y_min = min(mot.get('y', 0) for mot in mots)
        y_max = max(mot.get('y2', mot.get('y', 0)) for mot in mots)
        seuil = y_min + SEUIL_TIERS_BAS * (y_max - y_min)
        mots_bas = [mot for mot in mots if mot.get('y', 0) >= seuil]

        candidates = []
        for ligne in _lignes_depuis_mots(mots_bas):
            texte = ''.join(
                caractere
                for mot in ligne['mots']
                for caractere in str(mot.get('text', '')).upper()
                if caractere in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<'
            )
            if len(texte) >= 28 and '<' in texte:
                candidates.append({'y': ligne['y'], 'texte': texte})

        if len(candidates) < 2:
            return None, None

        candidates.sort(key=lambda candidat: candidat['y'])
        deux_dernieres = candidates[-2:]
        lignes = [
            candidat['texte'][: self.LONGUEUR_LIGNE].ljust(self.LONGUEUR_LIGNE, '<')
            for candidat in deux_dernieres
        ]
        return lignes[0], lignes[1]

    def decoder_td3(self, ligne1, ligne2):
        """Décode deux lignes TD3 et vérifie les chiffres de contrôle."""
        ligne1 = (ligne1 or '')[: self.LONGUEUR_LIGNE].ljust(self.LONGUEUR_LIGNE, '<')
        ligne2 = (ligne2 or '')[: self.LONGUEUR_LIGNE].ljust(self.LONGUEUR_LIGNE, '<')

        type_document = normaliser_alphabetique(ligne1[0:2])
        code_pays = normaliser_alphabetique(ligne1[2:5])
        zone_noms = normaliser_alphabetique(ligne1[5:44])

        # Le séparateur principal nom/prénoms en TD3 est entre lettres ('<<').
        # L'OCR le lit parfois comme 'K<', '<K', 'KK', 'C<', etc.
        parts = re.split(r'(?<=[A-Z])[<KC]{2}(?=[A-Z])', zone_noms, maxsplit=1)
        if len(parts) == 2:
            nom_brut = parts[0]
            reste = parts[1]
        elif '<<' in zone_noms:
            nom_brut, reste = zone_noms.split('<<', 1)
        else:
            nom_brut, reste = zone_noms, ''

        # Les prénoms s'arrêtent avant la séquence de chevrons de remplissage
        prenoms_brut = re.split(r'<<|[<]{2,}', reste, maxsplit=1)[0] if reste else ''

        champ_numero = ligne2[0:9].upper()
        chiffre_numero = normaliser_numerique(ligne2[9:10])
        nationalite = normaliser_alphabetique(ligne2[10:13])
        naissance_brute = normaliser_numerique(ligne2[13:19])
        chiffre_naissance = normaliser_numerique(ligne2[19:20])
        sexe = normaliser_alphabetique(ligne2[20:21])
        expiration_brute = normaliser_numerique(ligne2[21:27])
        chiffre_expiration = normaliser_numerique(ligne2[27:28])
        numero_personnel = ligne2[28:42].upper()
        chiffre_personnel = normaliser_numerique(ligne2[42:43])
        chiffre_composite = normaliser_numerique(ligne2[43:44])

        ligne2_normalisee = (
            champ_numero
            + chiffre_numero
            + nationalite
            + naissance_brute
            + chiffre_naissance
            + sexe
            + expiration_brute
            + chiffre_expiration
            + numero_personnel
            + chiffre_personnel
            + chiffre_composite
        )
        source_composite = (
            ligne2_normalisee[0:10]
            + ligne2_normalisee[13:20]
            + ligne2_normalisee[21:43]
        )

        controles = {
            'numero': calculer_chiffre_controle(champ_numero) == _chiffre_ou_none(chiffre_numero),
            'naissance': calculer_chiffre_controle(naissance_brute) == _chiffre_ou_none(chiffre_naissance),
            'expiration': calculer_chiffre_controle(expiration_brute) == _chiffre_ou_none(chiffre_expiration),
            'composite': calculer_chiffre_controle(source_composite) == _chiffre_ou_none(chiffre_composite),
        }

        return {
            'type': type_document,
            'code_pays': code_pays,
            'nom': _nettoyer_noms_mrz(nom_brut),
            'prenoms': _nettoyer_noms_mrz(prenoms_brut),
            'numero': _nettoyer_numero(champ_numero),
            'nationalite': nationalite,
            'date_naissance': _date_depuis_mrz(naissance_brute, 'naissance'),
            'sexe': sexe if sexe in ('M', 'F') else '',
            'date_expiration': _date_depuis_mrz(expiration_brute, 'expiration'),
            'numero_personnel': _nettoyer_numero(numero_personnel),
            'numero_personnel_present': bool(_nettoyer_numero(numero_personnel)),
            'controles': controles,
            'ligne1': ligne1,
            'ligne2': ligne2,
        }
