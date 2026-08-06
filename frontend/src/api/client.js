import axios from 'axios'

const clientApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

export function extraireMessageErreur(err, messageDefaut = 'Une erreur est survenue.') {
  const data = err?.response?.data
  if (!data) return messageDefaut
  if (typeof data === 'string') return data
  if (data.detail) return String(data.detail)
  if (data.erreur) return String(data.erreur)
  if (data.non_field_errors?.[0]) return String(data.non_field_errors[0])

  const premierChamp = Object.keys(data).find((cle) => Array.isArray(data[cle]) && data[cle][0])
  if (premierChamp) return String(data[premierChamp][0])

  return messageDefaut
}

export default clientApi
