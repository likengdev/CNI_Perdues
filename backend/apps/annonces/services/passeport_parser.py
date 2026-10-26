"""Parsing spatial des informations visibles du passeport camerounais.

S'appuie sur les mots docTR (même structure que cni_parser). MRZ utilisé
pour validation/croisement ; photo extraite via ServicePhotoExtractor avec
coordonnées passeport.
"""

import re

from apps.annonces.services.cni_parser import ServiceParserCNI
from apps.annonces.services.passeport_config import LABELS_PASSEPORT, SEUIL_CONFIANCE_MIN
from apps.annonces.services.mrz import ServiceMRZ


class ServiceParserPasseport(ServiceParserCNI):
    LABELS_PRIORITAIRES = list(LABELS_PASSEPORT)

    def __init__(self):
        self.mrz = ServiceMRZ()

    def extraire(self, mots, image=None):
        donnees = super()._initialiser_donnees()
        donnees['type_document'] = 'passeport'

        mots_filtrés = [m for m in mots if m.get('confiance', 0) >= SEUIL_CONFIANCE_MIN]
        if not mots_filtrés:
            mots_filtrés = list(mots or [])

        donnees.update(self._extraire_depuis_labels(mots_filtrés))
        donnees.update(self._extraire_mrz(mots_filtrés, image))

        # Harmonisation avec MRZ (priorité MRZ si cohérente)
        if donnees.get('mrz') and donnees['mrz'].get('controles'):
            mrz = donnees['mrz']
            if donnees.get('numero_carte') and mrz.get('numero'):
                if donnees['numero_carte'].replace('<', '') == mrz['numero'].replace('<', ''):
                    donnees['numero_carte'] = mrz['numero']
            if mrz.get('nom') and not donnees.get('nom_titulaire'):
                donnees['nom_titulaire'] = mrz['nom']
            if mrz.get('prenoms') and not donnees.get('prenom_titulaire'):
                donnees['prenom_titulaire'] = mrz['prenoms']
            if mrz.get('date_naissance') and not donnees.get('date_naissance'):
                donnees['date_naissance'] = mrz['date_naissance']
            if mrz.get('code_pays') or mrz.get('nationalite'):
                donnees['nationalite'] = mrz.get('nationalite') or mrz.get('code_pays')

        return donnees

    def _extraire_mrz(self, mots, image=None):
        if image is None:
            return {}
        ligne1, ligne2 = self.mrz.trouver_lignes(mots)
        if not ligne1 or not ligne2:
            return {}
        decoded = self.mrz.decoder_td3(ligne1, ligne2)
        return {'mrz': decoded}
