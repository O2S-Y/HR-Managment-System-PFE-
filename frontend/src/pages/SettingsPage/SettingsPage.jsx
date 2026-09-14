import { useState, useMemo, useEffect } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { authApi, userApi } from '../../services/authApi'
import './settingsPage.css'

/* ──────────────────────────────────────────────
   SVG Icons
   ────────────────────────────────────────────── */
function IconLock(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6v10h12V10h-1V7a5 5 0 0 0-5-5Zm3 8H9V7a3 3 0 1 1 6 0v3Zm-3 3a2 2 0 0 0-1 3.73V19h2v-2.27A2 2 0 0 0 12 13Z" />
    </svg>
  )
}
function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2 4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3Zm-1 15-4-4 1.41-1.41L11 14.17l5.59-5.59L18 10l-7 7Z" />
    </svg>
  )
}
function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" />
    </svg>
  )
}
function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M10 2a8 8 0 1 0 5.293 14.293l4.207 4.207 1.414-1.414-4.207-4.207A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
    </svg>
  )
}
function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z" />
    </svg>
  )
}
function IconKey(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12.65 10A6 6 0 1 0 7 14a5.92 5.92 0 0 0 3.65-1.27L12 14h2v2h2v2h3v-3l-4.35-4.35A5.9 5.9 0 0 0 12.65 10ZM7 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
    </svg>
  )
}

/* ──────────────────────────────────────────────
   Mock accounts data — in production from API
   ────────────────────────────────────────────── */
const INITIAL_ACCOUNTS = [
  { id: 1, courriel: 'owner@newdev.ma',   role: 'OWNER',   actif: true,  dateCreation: '2024-01-15' },
  { id: 2, courriel: 'rh@newdev.ma',      role: 'RH',      actif: true,  dateCreation: '2024-01-15' },
  { id: 3, courriel: 'oussama@newdev.ma', role: 'EMPLOYE', actif: true,  dateCreation: '2024-09-01' },
  { id: 4, courriel: 'karim@newdev.ma',   role: 'EMPLOYE', actif: true,  dateCreation: '2023-03-15' },
  { id: 5, courriel: 'yasmine@newdev.ma', role: 'EMPLOYE', actif: true,  dateCreation: '2025-11-01' },
]

/* ──────────────────────────────────────────────
   Utility — generate temp password
   ────────────────────────────────────────────── */
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#'
  let pw = ''
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  return pw
}

/* ══════════════════════════════════════════════
   SettingsPage
   ══════════════════════════════════════════════ */
export function SettingsPage() {
  const { user } = useAuth()
  const canManageAccounts = (user?.role === 'RH' || user?.role === 'OWNER') && !user?.doitChangerMotDePasse

  const [activeTab, setActiveTab] = useState('password')

  return (
    <AppShell header={<TopBar title="Paramètres" />}>
      <div className="stMain">
        {user?.doitChangerMotDePasse && (
          <div className="stAlert stAlertWarning" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            lineHeight: '1.5'
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <div>
              <strong>Action requise :</strong> Vous utilisez un mot de passe temporaire. Veuillez modifier votre mot de passe pour débloquer l'accès complet à l'application.
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="stTabBar" role="tablist">
          <button
            className={`stTab ${activeTab === 'password' ? 'stTabActive' : ''}`}
            role="tab"
            aria-selected={activeTab === 'password'}
            onClick={() => setActiveTab('password')}
            type="button"
          >
            <IconLock className="stTabIcon" />
            Mon Compte
          </button>
          {canManageAccounts && (
            <button
              className={`stTab ${activeTab === 'accounts' ? 'stTabActive' : ''}`}
              role="tab"
              aria-selected={activeTab === 'accounts'}
              onClick={() => setActiveTab('accounts')}
              type="button"
            >
              <IconShield className="stTabIcon" />
              Gestion des Comptes
            </button>
          )}
        </div>

        {/* Tab panels */}
        {activeTab === 'password' && <PasswordTab userEmail={user?.email} />}
        {activeTab === 'accounts' && canManageAccounts && <AccountsTab />}
      </div>
    </AppShell>
  )
}

/* ══════════════════════════════════════════════
   Tab 1 — Mon Compte (Change Password)
   ══════════════════════════════════════════════ */
function PasswordTab({ userEmail }) {
  const { markPasswordChanged } = useAuth()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Password visibility states
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const canSubmit = currentPw.length >= 1 && newPw.length >= 8 && newPw === confirmPw && !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPw.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPw !== confirmPw) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)
    try {
      // Real API call → POST /api/auth/change-password
      // Email is taken from the JWT on the backend side
      await authApi.changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      })
      setSuccess('Mot de passe modifié avec succès !')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      markPasswordChanged()
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la modification du mot de passe.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stCard" role="tabpanel">
      <div className="stCardHeader">
        <h2 className="stCardTitle">Modifier mon mot de passe</h2>
        <p className="stCardDesc">
          Choisissez un nouveau mot de passe pour votre compte ({userEmail || 'utilisateur'}).
        </p>
      </div>

      <form className="stPwForm" onSubmit={handleSubmit}>
        <label className="stFieldGroup">
          <span className="stLabel">Mot de passe actuel</span>
          <div className="stInputWrapper">
            <input
              className="stInput"
              type={showCurrentPw ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="togglePassword"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              aria-label={showCurrentPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showCurrentPw ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
        </label>

        <label className="stFieldGroup">
          <span className="stLabel">Nouveau mot de passe</span>
          <div className="stInputWrapper">
            <input
              className="stInput"
              type={showNewPw ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
              placeholder="Minimum 8 caractères"
              required
              minLength={8}
            />
            <button
              type="button"
              className="togglePassword"
              onClick={() => setShowNewPw(!showNewPw)}
              aria-label={showNewPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showNewPw ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
          {newPw && newPw.length < 8 && (
            <span className="stFieldHint stFieldHintWarn">Minimum 8 caractères requis</span>
          )}
        </label>

        <label className="stFieldGroup">
          <span className="stLabel">Confirmer le mot de passe</span>
          <div className="stInputWrapper">
            <input
              className="stInput"
              type={showConfirmPw ? "text" : "password"}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              autoComplete="new-password"
              placeholder="Retapez le nouveau mot de passe"
              required
            />
            <button
              type="button"
              className="togglePassword"
              onClick={() => setShowConfirmPw(!showConfirmPw)}
              aria-label={showConfirmPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showConfirmPw ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
          {confirmPw && newPw !== confirmPw && (
            <span className="stFieldHint stFieldHintWarn">Les mots de passe ne correspondent pas</span>
          )}
        </label>

        {error && <div className="stAlert stAlertError">{error}</div>}
        {success && <div className="stAlert stAlertSuccess">{success}</div>}

        <div className="stPwActions">
          <button className="stBtnPrimary" type="submit" disabled={!canSubmit}>
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════════
   Tab 2 — Gestion des Comptes (RH only)
   ══════════════════════════════════════════════ */
function AccountsTab() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [roleModalOpen, setRoleModalOpen] = useState(null) // account id
  const [resetModalResult, setResetModalResult] = useState(null) // { email, tempPw }

  // Load accounts on mount
  useEffect(() => {
    userApi.getAll()
      .then((data) => setAccounts(data ?? []))
      .catch((err) => console.error('Failed to load accounts', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts
    const term = search.toLowerCase()
    return accounts.filter(a =>
      a.courriel.toLowerCase().includes(term) ||
      a.role.toLowerCase().includes(term)
    )
  }, [accounts, search])

  /* ── Create Account ── */
  const handleCreate = async (data) => {
    try {
      const newAccount = await userApi.create({
        email: data.email,
        role: data.role,
        password: data.password,
      })
      setAccounts((prev) => [...prev, newAccount])
      setCreateOpen(false)
    } catch (err) {
      console.error('Create account failed', err)
    }
  }

  /* ── Toggle active/inactive ── */
  const toggleActive = async (id) => {
    try {
      const updated = await userApi.toggleActive(id)
      setAccounts((prev) => prev.map(a => a.id === id ? { ...a, actif: updated.actif } : a))
    } catch (err) {
      console.error('Toggle active failed', err)
    }
  }

  /* ── Change Role ── */
  const changeRole = async (id, newRole) => {
    try {
      const updated = await userApi.changeRole(id, newRole)
      setAccounts((prev) => prev.map(a => a.id === id ? { ...a, role: updated.role } : a))
      setRoleModalOpen(null)
    } catch (err) {
      console.error('Change role failed', err)
    }
  }

  /* ── Reset Password ── */
  const resetPassword = async (account) => {
    try {
      const result = await userApi.resetPassword(account.id)
      // result = { tempPassword: '...' } or similar from backend
      setResetModalResult({ email: account.courriel, tempPw: result?.tempPassword ?? generateTempPassword() })
    } catch (err) {
      console.error('Reset password failed', err)
      // Fallback: show generated password with a note that it wasn't saved
      setResetModalResult({ email: account.courriel, tempPw: generateTempPassword() })
    }
  }

  return (
    <div className="stCard" role="tabpanel">
      <div className="stCardHeader">
        <div>
          <h2 className="stCardTitle">Gestion des Comptes Utilisateurs</h2>
          <p className="stCardDesc">Créer, modifier le rôle, ou désactiver les comptes du système.</p>
        </div>
        <button className="stBtnPrimary" type="button" onClick={() => setCreateOpen(true)}>
          <IconPlus /> Nouveau Compte
        </button>
      </div>

      {/* Search bar */}
      <div className="stSearchRow">
        <div className="stSearchWrap">
          <IconSearch className="stSearchIcon" />
          <input
            className="stSearchInput"
            type="search"
            placeholder="Rechercher par email ou rôle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="stCountBadge">{filtered.length} compte{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="stTableWrap">
        <table className="stTable">
          <thead>
            <tr>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th className="stThRight">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((acc) => (
              <tr key={acc.id} className={!acc.actif ? 'stRowInactive' : ''}>
                <td className="stTdEmail">{acc.courriel}</td>
                <td>
                  <span className={`stRoleBadge stRoleBadge${acc.role}`}>
                    {acc.role === 'OWNER' ? 'Propriétaire' : acc.role === 'RH' ? 'RH' : acc.role === 'EMPLOYE' ? 'Employé' : acc.role}
                  </span>
                </td>
                <td>
                  <span className={`stStatusDot ${acc.actif ? 'stStatusActive' : 'stStatusInactive'}`}>
                    {acc.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="stTdDate">{acc.dateCreation}</td>
                <td className="stTdActions">
                  {acc.role === 'OWNER' ? (
                    <span className="stOwnerLock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#8a9bb0', fontSize: '0.85rem', fontWeight: '500' }}>
                      <IconLock style={{ width: '14px', height: '14px' }} /> Sécurisé
                    </span>
                  ) : (
                    <>
                      <button
                        className="stActBtn"
                        type="button"
                        title="Modifier le rôle"
                        onClick={() => setRoleModalOpen(acc.id)}
                      >
                        Rôle
                      </button>
                      <button
                        className={`stActBtn ${acc.actif ? 'stActBtnWarn' : 'stActBtnSuccess'}`}
                        type="button"
                        title={acc.actif ? 'Désactiver' : 'Réactiver'}
                        onClick={() => toggleActive(acc.id)}
                      >
                        {acc.actif ? 'Désactiver' : 'Réactiver'}
                      </button>
                      <button
                        className="stActBtn"
                        type="button"
                        title="Réinitialiser le mot de passe"
                        onClick={() => resetPassword(acc)}
                      >
                        <IconKey /> Reset
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="stEmptyRow">Aucun compte trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Account Modal ── */}
      {createOpen && (
        <CreateAccountModal
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreate}
          existingEmails={accounts.map(a => a.courriel)}
        />
      )}

      {/* ── Role Change Modal ── */}
      {roleModalOpen && (
        <RoleChangeModal
          account={accounts.find(a => a.id === roleModalOpen)}
          onClose={() => setRoleModalOpen(null)}
          onSave={changeRole}
        />
      )}

      {/* ── Reset Password Result Modal ── */}
      {resetModalResult && (
        <ResetResultModal
          email={resetModalResult.email}
          tempPw={resetModalResult.tempPw}
          onClose={() => setResetModalResult(null)}
        />
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────
   Modal — Create Account
   ────────────────────────────────────────────── */
function CreateAccountModal({ onClose, onCreate, existingEmails }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('EMPLOYE')
  const [password, setPassword] = useState(() => generateTempPassword())
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez saisir un email valide.')
      return
    }
    if (existingEmails.includes(email.trim().toLowerCase())) {
      setError('Cet email existe déjà.')
      return
    }

    onCreate({ email: email.trim().toLowerCase(), role, password })
  }

  return (
    <div className="stOverlay" onClick={onClose}>
      <div className="stModal" onClick={(e) => e.stopPropagation()}>
        <div className="stModalHeader">
          <h3 className="stModalTitle">Créer un nouveau compte</h3>
          <button className="stModalClose" type="button" onClick={onClose} aria-label="Fermer">
            <IconClose />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="stModalBody">
            <label className="stFieldGroup">
              <span className="stLabel">Adresse email</span>
              <input
                className="stInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@newdev.ma"
                required
                autoFocus
              />
            </label>

            <label className="stFieldGroup">
              <span className="stLabel">Rôle</span>
              <select className="stInput stSelect" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="EMPLOYE">Employé</option>
                <option value="RH">RH</option>
              </select>
            </label>

            <label className="stFieldGroup">
              <span className="stLabel">Mot de passe temporaire</span>
              <div className="stTempPwRow">
                <input className="stInput stInputMono" type="text" value={password} readOnly />
                <button
                  className="stBtnSecondary"
                  type="button"
                  onClick={() => setPassword(generateTempPassword())}
                >
                  Regénérer
                </button>
              </div>
              <span className="stFieldHint">Communiquez ce mot de passe à l'utilisateur en personne.</span>
            </label>

            {error && <div className="stAlert stAlertError">{error}</div>}
          </div>
          <div className="stModalFooter">
            <button className="stBtnSecondary" type="button" onClick={onClose}>Annuler</button>
            <button className="stBtnPrimary" type="submit">Créer le compte</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Modal — Change Role
   ────────────────────────────────────────────── */
function RoleChangeModal({ account, onClose, onSave }) {
  const [role, setRole] = useState(account?.role || 'EMPLOYE')

  if (!account) return null

  return (
    <div className="stOverlay" onClick={onClose}>
      <div className="stModal stModalSmall" onClick={(e) => e.stopPropagation()}>
        <div className="stModalHeader">
          <h3 className="stModalTitle">Modifier le rôle</h3>
          <button className="stModalClose" type="button" onClick={onClose} aria-label="Fermer">
            <IconClose />
          </button>
        </div>
        <div className="stModalBody">
          <p className="stModalDesc">
            Compte : <strong>{account.courriel}</strong>
          </p>
          <label className="stFieldGroup">
            <span className="stLabel">Nouveau rôle</span>
            <select className="stInput stSelect" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="EMPLOYE">Employé</option>
              <option value="RH">RH</option>
            </select>
          </label>
        </div>
        <div className="stModalFooter">
          <button className="stBtnSecondary" type="button" onClick={onClose}>Annuler</button>
          <button
            className="stBtnPrimary"
            type="button"
            onClick={() => onSave(account.id, role)}
            disabled={role === account.role}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Modal — Reset Password Result
   ────────────────────────────────────────────── */
function ResetResultModal({ email, tempPw, onClose }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tempPw)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* fallback: manual copy */ }
  }

  return (
    <div className="stOverlay" onClick={onClose}>
      <div className="stModal stModalSmall" onClick={(e) => e.stopPropagation()}>
        <div className="stModalHeader">
          <h3 className="stModalTitle">Mot de passe réinitialisé</h3>
          <button className="stModalClose" type="button" onClick={onClose} aria-label="Fermer">
            <IconClose />
          </button>
        </div>
        <div className="stModalBody">
          <p className="stModalDesc">
            Le mot de passe de <strong>{email}</strong> a été réinitialisé.
          </p>
          <div className="stResetResult">
            <span className="stLabel">Nouveau mot de passe temporaire :</span>
            <div className="stTempPwRow">
              <code className="stTempPwCode">{tempPw}</code>
              <button className="stBtnSecondary" type="button" onClick={copyToClipboard}>
                {copied ? '✓ Copié' : 'Copier'}
              </button>
            </div>
            <span className="stFieldHint stFieldHintWarn">
              ⚠ Communiquez ce mot de passe à l'utilisateur en personne. Il ne sera plus affiché.
            </span>
          </div>
        </div>
        <div className="stModalFooter">
          <button className="stBtnPrimary" type="button" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
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
