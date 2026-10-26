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
    'PRENOM',
    'PRÉNOM',
    'DATE ET LIEU DE NAISSANCE',
    'DATE DE NAISSANCE',
    'LIEU DE NAISSANCE',
    'NATIONALITE',
    'NATIONALITÉ',
    'SEXE',
    'DATE D EXPIRATION',
    "DATE D'EXPIRATION",
    'NUMERO DU PASSEPORT',
    'N° DU PASSEPORT',
    'NO DU PASSEPORT',
]

# Seuil de confiance identique au parcours CNI (docTR seul)
SEUIL_CONFIANCE_MIN = 0.80
