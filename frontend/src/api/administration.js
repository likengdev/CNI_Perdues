import clientApi from './client'

export function connexionAdmin(email, password) {
  return clientApi.post('/admin/auth/login/', { email, password })
}

export function obtenirProfilAdmin(token) {
  return clientApi.get('/admin/auth/me/', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function obtenirStatsDashboard(token) {
  return clientApi.get('/admin/dashboard/stats/', {
    headers: { Authorization: `Bearer ${token}` },
  })
}