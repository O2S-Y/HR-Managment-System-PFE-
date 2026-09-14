import { useNotifications } from '../../notifications/NotificationsProvider'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../theme/ThemeProvider'
import { getPhotoUrl } from '../../services/http'
import './topBar.css'

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return '—'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function IconBell(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 1 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z"
      />
    </svg>
  )
}

function IconMoon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
      />
    </svg>
  )
}

function IconSun(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16h0.01M12 22h0.01M4.22 4.22l0.01 0.01M19.78 19.78l0.01 0.01M2 12h0.01M22 12h0.01M4.22 19.78l0.01-0.01M19.78 4.22l0.01-0.01"
      />
    </svg>
  )
}

export function TopBar({
  title,
  left,
  center,
  right,
  user = { name: 'Admin RH', role: 'RH' },
}) {
  const { openDrawer, unreadCount } = useNotifications()
  const { logout, user: authUser } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayUser = authUser ? {
    name: authUser.name || authUser.email,
    role: authUser.role,
    photoProfil: authUser.photoProfil
  } : user

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const goProfile = () => {
    setMenuOpen(false)
    navigate('/employees/me')
  }

  const goSettings = () => {
    setMenuOpen(false)
    navigate('/settings')
  }

  const doLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="tbRoot">
      <div className="tbLeft">
        {typeof left !== 'undefined' ? (
          left
        ) : title ? (
          <div className="tbTitleBlock">
            {title ? <div className="tbTitle">{title}</div> : null}
          </div>
        ) : null}
      </div>

      <div className="tbCenter">{center}</div>

      <div className="tbRight">
        {right}
        <span className="tbDivider" aria-hidden="true" />

        <button
          className="tbIconBtn tbIconBtnMinimal"
          type="button"
          aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          onClick={toggle}
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>

        {!authUser?.doitChangerMotDePasse && (
          <button className="tbIconBtn" type="button" aria-label="Notifications" onClick={openDrawer}>
            <IconBell />
            {unreadCount > 0 && <span className="tbBadge">{unreadCount}</span>}
          </button>
        )}

        <div ref={menuRef} className="tbMenuWrap">
          <button
            className="tbUser"
            type="button"
            aria-label="Ouvrir le menu compte"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
          <span className="tbAvatar" aria-hidden="true">
            {displayUser.photoProfil ? (
              <img src={getPhotoUrl(displayUser.photoProfil)} alt={displayUser.name} className="tbAvatarImg" />
            ) : (
              initialsFromName(displayUser.name)
            )}
          </span>
          <span className="tbUserText">
            <span className="tbUserName">{displayUser.name}</span>
            <span className="tbUserRole">
              {displayUser.role === 'OWNER' ? 'Propriétaire' :
               displayUser.role === 'RH' ? 'RH' :
               displayUser.role === 'EMPLOYE' ? 'Employé' :
               displayUser.role}
            </span>
          </span>
          <span className="tbCaret" aria-hidden="true">
            ▾
          </span>
          </button>

          {menuOpen ? (
            <div className="tbMenu" role="menu" aria-label="Menu compte">
              {!authUser?.doitChangerMotDePasse && (
                <button className="tbMenuItem" type="button" role="menuitem" onClick={goProfile}>
                  Mon Profil
                </button>
              )}
              <button className="tbMenuItem" type="button" role="menuitem" onClick={goSettings}>
                Paramètres
              </button>
              <div className="tbMenuDivider" aria-hidden="true" />
              <button className="tbMenuItem tbMenuDanger" type="button" role="menuitem" onClick={doLogout}>
                Déconnexion
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

