import { createContext, useContext, useState, useEffect } from 'react'
import { obtenirProfilAdmin } from '../api/administration'

const ContexteAdmin = createContext(null)

export function FournisseurAdmin({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || null)
  const [admin, setAdmin] = useState(null)

  // Charge le profil de l'administrateur connecté (endpoint existant /admin/auth/me/)
  useEffect(() => {
    if (!token) {
      setAdmin(null)
      return undefined
    }
    let actif = true
    obtenirProfilAdmin(token)
      .then(({ data }) => {
        if (actif) setAdmin(data)
      })
      .catch(() => {
        if (actif) setAdmin(null)
      })
    return () => {
      actif = false
    }
  }, [token])

  useEffect(() => {
    const onTokenUpdated = (e) => {
      setToken(e.detail)
    }
    const onAuthExpired = () => {
      deconnecter()
    }

    window.addEventListener('token-updated', onTokenUpdated)
    window.addEventListener('auth-expired', onAuthExpired)

    return () => {
      window.removeEventListener('token-updated', onTokenUpdated)
      window.removeEventListener('auth-expired', onAuthExpired)
    }
  }, [])

  const connecter = (nouveauToken, nouveauRefreshToken, infosAdmin) => {
    sessionStorage.setItem('admin_token', nouveauToken)
    if (nouveauRefreshToken) {
      sessionStorage.setItem('admin_refresh_token', nouveauRefreshToken)
    }
    setToken(nouveauToken)
    setAdmin(infosAdmin)
  }

  const deconnecter = () => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_refresh_token')
    setToken(null)
    setAdmin(null)
  }

  return (
    <ContexteAdmin.Provider value={{ token, admin, connecter, deconnecter }}>
      {children}
    </ContexteAdmin.Provider>
  )
}

export function useAdmin() {
  return useContext(ContexteAdmin)
}