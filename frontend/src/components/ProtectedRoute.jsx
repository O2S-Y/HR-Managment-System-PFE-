import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

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

  return <Outlet />
}
