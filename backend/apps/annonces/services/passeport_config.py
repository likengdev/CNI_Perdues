"""Constantes du passeport camerounais.

À VÉRIFIER sur les spécimens réels (passe.jpg, autre version 2013/2021)
avant de figer définitivement.
"""

# Coordonnées approximatives de la zone photo sur la page d'identité.
# Proportionnelles à la zone de l'image brute fournie à docTR.
ZONE_PHOTO_PASSEPORT = {
    'x1': 0.04,
    'y1': 0.22,
    'x2': 0.26,
    'y2': 0.62,
}

# Labels FR/EN pour repérage visuel (à ajuster si besoin)
LABELS_PASSEPORT = [
    'NOM',
    'SURNAME',
    'PRENOM',
    'PRÉNOM',
    'PRENOMS',
    'GIVEN',
    'NAMES',
    'DATE ET LIEU DE NAISSANCE',
    'DATE DE NAISSANCE',
    'DATE OF BIRTH',
    'LIEU DE NAISSANCE',
    'PLACE OF BIRTH',
    'NATIONALITE',
    'NATIONALITÉ',
    'NATIONALITY',
    'SEXE',
    'SEX',
    'DATE D EXPIRATION',
    "DATE D'EXPIRATION",
    'DATE OF EXPIRY',
    'EXPIRY',
    'DATE DE DELIVRANCE',
    'DATE OF ISSUE',
    'ISSUE',
    'NUMERO DU PASSEPORT',
    'N° DU PASSEPORT',
    'NO DU PASSEPORT',
    'PASSPORT NO',
    'PASSEPORT',
    'PASSPORT',
    'PROFESSION',
    'OCCUPATION',
    'TAILLE',
    'HEIGHT',
    'CAN',
    'REPUBLIQUE',
    'REPUBLIC',
    'CAMEROUN',
    'CAMEROON',
    'TYPE',
    'CODE',
    'PAYS',
    'COUNTRY',
    'SIGNATURE',
    'TITULAIRE',
    'BEARER',
]

# Seuil de confiance identique au parcours CNI (docTR seul)
SEUIL_CONFIANCE_MIN = 0.80
