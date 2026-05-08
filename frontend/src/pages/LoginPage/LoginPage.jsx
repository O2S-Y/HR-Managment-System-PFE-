import { useMemo, useState } from 'react'
import './loginPage.css'
import logo from '../../assets/branding/logo_NewDev.png'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('OWNER')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false
    if (!password) return false
    return true
  }, [email, password])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit || isSubmitting) return

    setError('')
    setIsSubmitting(true)
    try {
      // Mock Login logic
      await new Promise((resolve) => setTimeout(resolve, 500)) // simulate delay
      login({ email, role, token: 'mock-jwt-token' })
      
      if (role === 'EMPLOYE') {
        navigate('/employees/me')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Échec de connexion. Vérifiez vos identifiants.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app">
      <section className="loginCard" aria-label="Connexion">
        <img className="loginLogo" src={logo} alt="NewDev Maroc" />

        <h1 className="loginTitle">Welcome back !</h1>
        <p className="loginSubtitle">
          Connectez-vous à votre compte <strong>NewDev</strong>
        </p>

        <form className="loginForm" onSubmit={onSubmit}>
          <label className="field">
            <span className="srOnly">Role (Mock)</span>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="OWNER">Propriétaire (OWNER)</option>
              <option value="RH">Ressources Humaines (RH)</option>
              <option value="EMPLOYE">Employé (EMPLOYE)</option>
            </select>
          </label>

          <label className="field">
            <span className="srOnly">Email</span>
            <input
              className="input"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="srOnly">Password</span>
            <input
              className="input"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? (
            <div className="error" role="alert">
              {error}
            </div>
          ) : null}

          <button className="button" type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? 'Connexion…' : 'Login'}
          </button>

          <button className="link" type="button" disabled>
            Forgot password?
          </button>
        </form>
      </section>

      <footer className="footer" aria-label="Mentions légales">
        © {new Date().getFullYear()} NewDev, Inc. Tous droits réservés.
      </footer>
    </main>
  )
}
