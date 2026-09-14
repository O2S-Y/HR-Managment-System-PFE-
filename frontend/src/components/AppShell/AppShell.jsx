import { NavLink } from 'react-router-dom'
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

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 11h-4v-2h3V7h2v6Z" />
    </svg>
  )
}

function IconWallet(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M21 7H3V5h18v2Zm0 2H3v10h18V9Zm-4 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  )
}

function IconGear(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
    </svg>
  )
}

function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  )
}

function IconChat(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M4 2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-4 4V4a2 2 0 0 1 2-2Zm2 6h12V6H6v2Zm0 4h9v-2H6v2Z" />
    </svg>
  )
}

export function AppShell({ header, children }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          {!user?.doitChangerMotDePasse ? (
            <>
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

              {/* MODULE 1 - Pointage: RH/Owner → /attendance, Employee → /attendance/me */}
              {(isRH || isOwner || isEmployee) && (
                <NavLink
                  className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
                  to={isEmployee ? "/attendance/me" : "/attendance"}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconClock className="shellNavIcon" />
                  <span>{isEmployee ? 'Mon Pointage' : 'Pointage'}</span>
                </NavLink>
              )}

              {/* MODULE 2 - Congés: each role → different route */}
              <NavLink
                className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
                to={isOwner || isRH ? "/leaves/owner" : "/leaves/me"}
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

              {/* MODULE 7 - Paie: all roles, different views */}
              <NavLink
                className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
                to={isEmployee ? "/payroll/me" : "/payroll"}
                onClick={() => setSidebarOpen(false)}
              >
                <IconWallet className="shellNavIcon" />
                <span>Paie</span>
              </NavLink>

              {/* MODULE 6 - Communication: RH + Owner (messages directs + annonces) */}
              {(isRH || isOwner) && (
                <NavLink
                  className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
                  to="/notifications"
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconChat className="shellNavIcon" />
                  <span>Communication</span>
                </NavLink>
              )}

              {/* MODULE 6 - Audit: Owner only */}
              {isOwner && (
                <NavLink
                  className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
                  to="/audit"
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconShield className="shellNavIcon" />
                  <span>Journal d'Audit</span>
                </NavLink>
              )}
            </>
          ) : null}

          {/* MODULE AUTH - Paramètres: all roles */}
          <NavLink
            className={({ isActive }) => `shellNavItem ${isActive ? 'active' : ''}`}
            to="/settings"
            onClick={() => setSidebarOpen(false)}
          >
            <IconGear className="shellNavIcon" />
            <span>Paramètres</span>
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

