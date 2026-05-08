import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import './notificationsDrawer.css'

const NotificationsContext = createContext(null)

const chips = ['Toutes', 'Non lues', 'Congés', 'Évaluations', 'Actifs']

const demoItems = [
  { unread: true, icon: '📅', title: 'Demande de congé approuvée: Jean Dupont (25-28 Oct)', time: 'Il y a 10 min' },
  { unread: true, icon: '⭐', title: 'Évaluation annuelle requise pour le département Marketing', time: 'Il y a 1 heure' },
  { unread: false, icon: '💻', title: 'Nouvel équipement assigné: MacBook Pro (Marie L.)', time: 'Hier à 14:30' },
  { unread: false, icon: '🗓️', title: 'Nouvelle demande de congé en attente: Paul Martin', time: 'Hier à 09:15' },
]

function NotificationsDrawer({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="ndOverlay" role="dialog" aria-label="Notifications" aria-modal="true">
      <button className="ndBackdrop" type="button" aria-label="Fermer" onClick={onClose} />

      <aside className="ndPanel">
        <div className="ndHead">
          <div className="ndTitle">
            Notifications <span className="ndCount">(12)</span>
          </div>
          <button className="ndMarkAll" type="button">
            Tout marquer comme lu
          </button>
        </div>

        <div className="ndChips" aria-label="Filtres">
          {chips.map((c, idx) => (
            <button key={c} className={idx === 0 ? 'ndChip ndChipActive' : 'ndChip'} type="button">
              {c}
            </button>
          ))}
        </div>

        <div className="ndList">
          {demoItems.map((it, idx) => (
            <div key={idx} className={it.unread ? 'ndItem ndUnread' : 'ndItem ndRead'}>
              <div className="ndIcon" aria-hidden="true">
                {it.icon}
              </div>
              <div className="ndMeta">
                <div className="ndItemTitle">{it.title}</div>
                <div className="ndTime">{it.time}</div>
              </div>
              {it.unread ? <div className="ndDot" aria-hidden="true" /> : null}
            </div>
          ))}
        </div>

        <div className="ndFooter">{`Voir tout l'historique d'audit`}</div>
      </aside>
    </div>
  )
}

export function NotificationsProvider({ children }) {
  const [open, setOpen] = useState(false)

  const value = useMemo(() => {
    return {
      open,
      openDrawer: () => setOpen(true),
      closeDrawer: () => setOpen(false),
      toggleDrawer: () => setOpen((v) => !v),
    }
  }, [open])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationsDrawer open={open} onClose={() => setOpen(false)} />
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}

