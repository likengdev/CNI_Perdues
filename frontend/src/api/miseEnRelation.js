import clientApi from './client'

export function cloturerMiseEnRelation(id) {
  return clientApi.post(`/mise_en_relation/${id}/cloturer/`)
}