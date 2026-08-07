import { createContext, useContext, useState } from 'react'

const ContexteAdmin = createContext(null)

export function FournisseurAdmin({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || null)
  const [admin, setAdmin] = useState(null)

  const connecter = (nouveauToken, infosAdmin) => {
    sessionStorage.setItem('admin_token', nouveauToken)
    setToken(nouveauToken)
    setAdmin(infosAdmin)
  }

  const deconnecter = () => {
    sessionStorage.removeItem('admin_token')
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