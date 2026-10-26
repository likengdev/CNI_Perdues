import clientApi from './client'

export function extraireInformationsCni(photoRecto, photoVerso, typeDocument = 'cni') {
  const donnees = new FormData()
  donnees.append('photo_recto', photoRecto)
  if (photoVerso) {
    donnees.append('photo_verso', photoVerso)
  }
  if (typeDocument) {
    donnees.append('type_document', typeDocument)
  }
  return clientApi.post('/annonces/extraire/', donnees)
}

export function extraireInformationsPasseport(photoRecto, photoVerso, typeDocument = 'passeport') {
  return extraireInformationsCni(photoRecto, photoVerso, typeDocument)
}

export function publierAnnonce(champs) {
  const donnees = new FormData()
  Object.entries(champs).forEach(([cle, valeur]) => {
    if (valeur !== undefined && valeur !== null) donnees.append(cle, valeur)
  })
  return clientApi.post('/annonces/publier/', donnees)
}
export function validerAnnonce(id){
  return clientApi.post(`/annonces/${id}/valider/`)
}

export function rejeterAnnonce(id, motifRejet){
  return clientApi.post(`/annonces/${id}/rejeter/`, { motif_rejet: motifRejet})

}

export function rechercherAnnonces(nom, prenom, dateNaissance, numeroCarte, telephone, typeDocument, numero) {
  const params = {
    nom: nom || undefined,
    prenom: prenom || undefined,
    date_naissance: dateNaissance || undefined,
    numero_carte: numeroCarte || numero || undefined,
    numero: numero || numeroCarte || undefined,
    telephone: telephone || undefined,
    type_document: typeDocument || undefined,
  }
  return clientApi.get('/annonces/rechercher/', { params })
}