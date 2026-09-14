import { useEffect, useMemo, useState } from 'react'
import './loginPage.css'
import logo from '../../assets/branding/logo_NewDev.png'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../services/authApi'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [forgotMsg, setForgotMsg] = useState(false)

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showRecoveryKey, setShowRecoveryKey] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Redirect if already logged in (blocks backing into login page)
  useEffect(() => {
    if (user) {
      if (user.doitChangerMotDePasse) {
        navigate('/settings', { replace: true })
      } else if (user.role === 'EMPLOYE') {
        navigate('/leaves/me', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, navigate])

  // Owner Recovery States
  const [showOwnerRecovery, setShowOwnerRecovery] = useState(false)
  const [recoveryKey, setRecoveryKey] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmittingRecovery, setIsSubmittingRecovery] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')
  const [recoverySuccess, setRecoverySuccess] = useState('')

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
      // Real API call → POST /api/auth/login
      // Returns { token, id, name, role } from backend JwtResponse
      const jwtData = await authApi.login({ email, password })
      login(jwtData) // store in AuthContext + localStorage

      if (jwtData.doitChangerMotDePasse) {
        navigate('/settings', { replace: true })
      } else if (jwtData.role === 'EMPLOYE') {
        navigate('/leaves/me', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message
      setError(serverMsg || 'Échec de connexion. Vérifiez vos identifiants.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleOwnerRecovery(e) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setRecoveryError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setRecoveryError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setRecoveryError('')
    setRecoverySuccess('')
    setIsSubmittingRecovery(true)
    try {
      await authApi.resetOwnerPassword({ recoveryKey, newPassword })
      setRecoverySuccess('✅ Mot de passe propriétaire réinitialisé avec succès !')
      setRecoveryKey('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowOwnerRecovery(false)
        setRecoverySuccess('')
      }, 3000)
    } catch (err) {
      const serverMsg = err.response?.data?.message
      setRecoveryError(serverMsg || 'Clé de récupération invalide ou erreur de serveur.')
    } finally {
      setIsSubmittingRecovery(false)
    }
  }

  return (
    <main className="app">
      <div className={`loginCardContainer ${showOwnerRecovery ? 'isFlipped' : ''}`}>
        <div className="loginCardInner">
          {/* FRONT FACE: Standard Login Form */}
          <section className="loginCard loginCardFront" aria-label="Connexion">
            <img className="loginLogo" src={logo} alt="NewDev Maroc" />
            <h1 className="loginTitle">Bon retour !</h1>
            <p className="loginSubtitle">
              Connectez-vous à votre compte <strong>NewDev</strong>
            </p>
            <form className="loginForm" onSubmit={onSubmit}>
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
                <span className="srOnly">Mot de passe</span>
                <div className="inputWrapper">
                  <input
                    className="input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="togglePassword"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </label>
              {error && (
                <div className="error" role="alert">
                  {error}
                </div>
              )}
              <button className="button" type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Connexion…' : 'Se connecter'}
              </button>
              <button className="link" type="button" onClick={() => setForgotMsg(v => !v)}>
                Mot de passe oublié ?
              </button>
              {forgotMsg && (
                <div className="forgotInfo" role="status" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>🔒 Veuillez contacter votre responsable RH pour réinitialiser votre mot de passe.</div>
                  <button
                    type="button"
                    className="link"
                    style={{ fontSize: '0.8rem', alignSelf: 'center', marginTop: '4px' }}
                    onClick={() => {
                      setForgotMsg(false)
                      setShowOwnerRecovery(true)
                    }}
                  >
                    Propriétaire du système ? Réinitialiser via clé de serveur
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* BACK FACE: Owner Recovery Form */}
          <section className="loginCard loginCardBack" aria-label="Récupération">
            <img className="loginLogo" src={logo} alt="NewDev Maroc" />
            <h1 className="loginTitle">Récupération</h1>
            <p className="loginSubtitle">
              Réinitialiser le mot de passe du propriétaire
            </p>
            <form className="loginForm" onSubmit={handleOwnerRecovery}>
              <label className="field">
                <span className="srOnly">Clé de récupération</span>
                <div className="inputWrapper">
                  <input
                    className="input"
                    type={showRecoveryKey ? "text" : "password"}
                    placeholder="Clé de récupération du serveur"
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="togglePassword"
                    onClick={() => setShowRecoveryKey(!showRecoveryKey)}
                    aria-label={showRecoveryKey ? "Masquer la clé" : "Afficher la clé"}
                  >
                    {showRecoveryKey ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </label>
              
              <label className="field">
                <span className="srOnly">Nouveau mot de passe</span>
                <div className="inputWrapper">
                  <input
                    className="input"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nouveau mot de passe (min. 8 car.)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="togglePassword"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showNewPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </label>
              
              <label className="field">
                <span className="srOnly">Confirmer le nouveau mot de passe</span>
                <div className="inputWrapper">
                  <input
                    className="input"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmer le nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="togglePassword"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </label>

              {recoveryError && (
                <div className="error" role="alert">
                  {recoveryError}
                </div>
              )}

              {recoverySuccess && (
                <div className="success" style={{ color: '#27ae60', fontSize: '0.85rem', marginBottom: '0.8rem', textAlign: 'center' }}>
                  {recoverySuccess}
                </div>
              )}

              <button className="button" type="submit" disabled={isSubmittingRecovery}>
                {isSubmittingRecovery ? 'Réinitialisation…' : 'Enregistrer'}
              </button>

              <button
                className="link"
                type="button"
                onClick={() => {
                  setShowOwnerRecovery(false)
                  setRecoveryError('')
                  setRecoverySuccess('')
                  setRecoveryKey('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
              >
                Retour à la connexion
              </button>
            </form>
          </section>
        </div>
      </div>

      <footer className="footer" aria-label="Mentions légales">
        © {new Date().getFullYear()} NewDev, Inc. Tous droits réservés.
      </footer>
    </main>
  )
}

function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
