import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './appShell.css'
import logo from '../../assets/branding/logo_NewDev.png'
import { useAuth } from '../../contexts/AuthContext'

function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
    </svg>
  )
}

function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
      />
    </svg>
  )
}

function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M16 11a4 4 0 1 0-3.999-4A4 4 0 0 0 16 11ZM8 12a3 3 0 1 0-2.999-3A3 3 0 0 0 8 12Zm8 2c-3.33 0-6 1.34-6 3v2h12v-2c0-1.66-2.67-3-6-3Zm-8 1c-2.67 0-5 1.07-5 2.5V19h7v-1.5C10 16.07 9.33 15 8 15Z"
      />
    </svg>
  )
}

function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm13 8H6v10h14V10Z" />
    </svg>
  )
}

function IconClipboard(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M9 2h6a2 2 0 0 1 2 2h2v18H5V4h2a2 2 0 0 1 2-2Zm0 2v2h6V4H9Zm-2 4v12h10V8H7Z"
      />
    </svg>
  )
}

function IconLaptop(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M4 5h16v10H4V5Zm-2 12h20v2H2v-2Z" />
    </svg>
  )
}

export function AppShell({ header, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = (e) => {
    e.preventDefault()
    logout()
    navigate('/login')
  }

  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen])

  const isOwner = user?.role === 'OWNER'
  const isRH = user?.role === 'RH'
  const isEmployee = user?.role === 'EMPLOYE'

  return (
    <div className={sidebarOpen ? 'shellRoot shellRootSidebarOpen' : 'shellRoot'}>
      <button
        className="shellMenuBtn"
        type="button"
        aria-label="Ouvrir le menu"
        aria-haspopup="dialog"
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen(true)}
      >
        <IconMenu />
      </button>

      {sidebarOpen ? (
        <button
          className="shellBackdrop"
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside className={sidebarOpen ? 'shellSidebar shellSidebarOpen' : 'shellSidebar'} aria-label="Navigation">
        <div className="shellBrand">
          <img src={logo} alt="NewDev Maroc" className="shellBrandLogo" />
          <div className="shellBrandDivider" />
        </div>

        <nav className="shellNav">
          {/* MODULE 4 - Tableau de Bord: Owner + RH only */}
          {(!isEmployee) && (
            <NavLink
              className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
            >
              <IconGrid className="shellNavIcon" />
              <span>Tableau de Bord</span>
            </NavLink>
          )}

          {/* MODULE 1 - Employés: RH (CRUD) + Owner (lecture) */}
          {(!isEmployee) && (
            <NavLink
              className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
              to="/employees"
              onClick={() => setSidebarOpen(false)}
            >
              <IconUsers className="shellNavIcon" />
              <span>Employés</span>
            </NavLink>
          )}

          {/* MODULE 1 - Employé: son propre profil */}
          {isEmployee && (
            <NavLink
              className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
              to="/employees/me"
              onClick={() => setSidebarOpen(false)}
            >
              <IconUsers className="shellNavIcon" />
              <span>Mon Profil</span>
            </NavLink>
          )}

          {/* MODULE 2 - Congés: each role → different route */}
          <NavLink
            className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
            to={isOwner ? "/leaves/owner" : isRH ? "/leaves/admin" : "/leaves/me"}
            onClick={() => setSidebarOpen(false)}
          >
            <IconCalendar className="shellNavIcon" />
            <span>Congés &amp; Absences</span>
          </NavLink>

          {/* MODULE 3 - Évaluations: each role → different route */}
          <NavLink
            className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
            to={isOwner ? "/evaluations/owner" : isRH ? "/evaluations/rh" : "/evaluations/me"}
            onClick={() => setSidebarOpen(false)}
          >
            <IconClipboard className="shellNavIcon" />
            <span>Évaluations</span>
          </NavLink>

          {/* MODULE 5 - Actifs IT: all roles, different views */}
          <NavLink
            className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
            to={isEmployee ? "/assets/me" : "/assets"}
            onClick={() => setSidebarOpen(false)}
          >
            <IconLaptop className="shellNavIcon" />
            <span>Actifs IT</span>
          </NavLink>
        </nav>

        <div className="shellBottom">
          <div className="shellReserved" aria-label="Mentions légales">
            © {new Date().getFullYear()} NewDev, Inc. Tous droits réservés.
          </div>
        </div>
      </aside>

      <main className="shellMain">
        {header ? <header className="shellHeader">{header}</header> : null}
        <div className="shellContent">{children}</div>
      </main>
    </div>
  )
}

