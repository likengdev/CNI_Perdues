import clientApi from './client'

export function verifierTelephone(telephone) {
  return clientApi.post('/utilisateurs/verifier/', { telephone })
}

export function inscrireDeclarant(donnees) {
  return clientApi.post('/utilisateurs/inscrire/declarant/', donnees)
}

export function inscrireBeneficiaire(donnees) {
  return clientApi.post('/utilisateurs/inscrire/beneficiaire/', donnees)
}

export function completerProfil(telephone, donnees) {
  return clientApi.patch(`/utilisateurs/${telephone}/completer-profil/`, donnees)
}
