import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.doitChangerMotDePasse) {
    if (location.pathname !== '/settings') {
      return <Navigate to="/settings" replace />
    }
  } else {
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to the appropriate default page based on role
      switch (user.role) {
        case 'EMPLOYE':
          return <Navigate to="/leaves/me" replace />
        case 'RH':
          return <Navigate to="/dashboard" replace />
        case 'OWNER':
          return <Navigate to="/dashboard" replace />
        default:
          return <Navigate to="/login" replace />
      }
    }
  }

  return <Outlet />
}
