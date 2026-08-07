import { Navigate } from 'react-router-dom'
import { useAdmin } from '../contexte/ContexteAdmin'

function RouteProtegeeAdmin({ children }) {
  const { token } = useAdmin()
  if (!token) return <Navigate to="/admin/connexion" replace />
  return children
}

export default RouteProtegeeAdmin