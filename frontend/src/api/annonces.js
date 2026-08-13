import clientApi from './client'

export function extraireInformationsCni(photoRecto, photoVerso) {
  const donnees = new FormData()
  donnees.append('photo_recto', photoRecto)
  donnees.append('photo_verso', photoVerso)
  return clientApi.post('/annonces/extraire/', donnees)
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