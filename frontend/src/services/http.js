import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function getPhotoUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Intercepteur de requêtes : insérer un jeton JWT à chaque appel ──────────────
http.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user?.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`
        }
      } catch (_) { /* ignore */ }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Intercepteur de réponse : effacer la session en cas de 401 (jeton expiré) ───────
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
