import { createContext, useContext, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { http } from '../services/http'

const AuthContext = createContext(null)

// 15 minutes inactivity timeout
const INACTIVITY_TIMEOUT = 5 * 60 * 1000

/**
 * user shape (from backend JwtResponse):
 *   { token: string, id: number, name: string, role: 'OWNER'|'RH'|'EMPLOYE' }
 *
 * The JWT token is read from localStorage by the Axios interceptor in http.js
 * and added as "Authorization: Bearer <token>" to every request automatically.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  })

  const timerRef = useRef(null)

  const login = (jwtResponseData) => {
    // jwtResponseData = { token, id, name, role }
    localStorage.setItem('auth_user', JSON.stringify(jwtResponseData))
    setUser(jwtResponseData)
  }

  const logout = () => {
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  const updateUserPhoto = (photoUrl) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, photoProfil: photoUrl }
      localStorage.setItem('auth_user', JSON.stringify(updated))
      return updated
    })
  }

  const markPasswordChanged = () => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, doitChangerMotDePasse: false }
      localStorage.setItem('auth_user', JSON.stringify(updated))
      return updated
    })
  }

  useEffect(() => {
    if (!user || !user.token || user.doitChangerMotDePasse) return

    let active = true
    const fetchLatestProfile = async () => {
      try {
        const res = await http.get('/api/employees/me')
        if (active && res.data && res.data.data) {
          const emp = res.data.data
          const latestName = emp.nomComplet || emp.name
          const latestPhoto = emp.photoProfil
          
          setUser((prev) => {
            if (!prev) return null
            if (prev.name === latestName && prev.photoProfil === latestPhoto) {
              return prev
            }
            const updated = { ...prev, name: latestName || prev.name, photoProfil: latestPhoto || prev.photoProfil }
            localStorage.setItem('auth_user', JSON.stringify(updated))
            return updated
          })
        }
      } catch (err) {
        console.error('Failed to sync auth user profile', err)
      }
    }

    fetchLatestProfile()
    return () => {
      active = false
    }
  }, [user?.token])

  useEffect(() => {
    // If no user is logged in, no need to monitor inactivity
    if (!user) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const handleInactivity = () => {
      logout()
      toast.error("Votre session a expiré en raison d'une inactivité prolongée.", {
        id: 'inactivity-logout-toast',
        duration: 6000,
      })
    }

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(handleInactivity, INACTIVITY_TIMEOUT)
    }

    // Events indicating user activity
    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart']

    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    // Initial setup of timer
    resetTimer()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserPhoto, markPasswordChanged }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
