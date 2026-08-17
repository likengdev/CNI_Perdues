import clientApi from './client'

export function cloturerMiseEnRelation(id) {
  return clientApi.post(`/mise_en_relation/${id}/cloturer/`)
}

export function declencherMiseEnRelation(annonceId, telephoneBeneficiaire) {
  return clientApi.post('/mise_en_relation/declencher/', {
    annonce_id: annonceId,
    telephone_beneficiaire: telephoneBeneficiaire,
  })
}

export function confirmerRestitution(id) {
  return clientApi.post(`/mise_en_relation/${id}/confirmer/`)
}