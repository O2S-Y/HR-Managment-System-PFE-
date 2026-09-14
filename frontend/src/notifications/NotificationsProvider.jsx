import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { notificationApi } from '../services/authApi'
import './notificationsDrawer.css'

const NotificationsContext = createContext(null)

const ICON_MAP = {
  LEAVE_SUBMITTED: '🗓️',
  LEAVE_APPROVED: '✅',
  LEAVE_REFUSED: '❌',
  EVALUATION_SUBMITTED: '⭐',
  ASSET_ASSIGNED: '💻',
  ASSET_RETURNED: '📦',
  PROFILE_CHANGE_SUBMITTED: '📝',
  PROFILE_CHANGE_APPROVED: '✏️',
  PROFILE_CHANGE_REJECTED: '🚫',
  PAYSLIP_GENERATED: '💰',
  PASSWORD_CHANGED: '🔑',
  ANNOUNCEMENT: '📢',
}

const CATEGORY_MAP = {
  Congés: ['LEAVE_SUBMITTED', 'LEAVE_APPROVED', 'LEAVE_REFUSED'],
  Évaluations: ['EVALUATION_SUBMITTED'],
  Actifs: ['ASSET_ASSIGNED', 'ASSET_RETURNED'],
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  return `Il y a ${days} jours`
}

const chips = ['Toutes', 'Non lues', 'Congés', 'Évaluations', 'Actifs']

function NotificationsDrawer({ open, onClose, notifications, unreadCount, onMarkAsRead, onMarkAllAsRead, loading }) {
  const [activeChip, setActiveChip] = useState('Toutes')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const filtered = notifications.filter((n) => {
    if (activeChip === 'Toutes') return true
    if (activeChip === 'Non lues') return !n.lu
    const types = CATEGORY_MAP[activeChip]
    return types ? types.includes(n.typeEvenement) : true
  })

  return (
    <div className="ndOverlay" role="dialog" aria-label="Notifications" aria-modal="true">
      <button className="ndBackdrop" type="button" aria-label="Fermer" onClick={onClose} />

      <aside className="ndPanel">
        <div className="ndHead">
          <div className="ndTitle">
            Notifications <span className="ndCount">({unreadCount})</span>
          </div>
          <button className="ndMarkAll" type="button" onClick={onMarkAllAsRead}>
            Tout marquer comme lu
          </button>
        </div>

        <div className="ndChips" aria-label="Filtres">
          {chips.map((c) => (
            <button
              key={c}
              className={c === activeChip ? 'ndChip ndChipActive' : 'ndChip'}
              type="button"
              onClick={() => setActiveChip(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="ndList">
          {loading ? (
            <div className="ndItem ndRead" style={{ textAlign: 'center', color: '#8a9bb0' }}>
              Chargement…
            </div>
          ) : filtered.length === 0 ? (
            <div className="ndItem ndRead" style={{ textAlign: 'center', color: '#8a9bb0' }}>
              Aucune notification
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className={n.lu ? 'ndItem ndRead' : 'ndItem ndUnread'}
                onClick={() => !n.lu && onMarkAsRead(n.id)}
                role="button"
                tabIndex={0}
                style={{ cursor: n.lu ? 'default' : 'pointer' }}
              >
                <div className="ndIcon" aria-hidden="true">
                  {ICON_MAP[n.typeEvenement] || '🔔'}
                </div>
                <div className="ndMeta">
                  <div className="ndItemTitle">{n.message}</div>
                  <div className="ndTime">{timeAgo(n.dateCreation)}</div>
                </div>
                {!n.lu ? <div className="ndDot" aria-hidden="true" /> : null}
              </div>
            ))
          )}
        </div>

        <div className="ndFooter">{`Voir tout l'historique d'audit`}</div>
      </aside>
    </div>
  )
}

export function NotificationsProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        const u = JSON.parse(stored)
        if (u.doitChangerMotDePasse) {
          setNotifications([])
          setUnreadCount(0)
          return
        }
      }
    } catch (e) {}

    try {
      setLoading(true)
      const data = await notificationApi.getAll()
      setNotifications(data ?? [])
      setUnreadCount((data ?? []).filter((n) => !n.lu).length)
    } catch {
      // Not logged in or API unavailable — that's fine
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  // Also fetch on mount to get the unread count for the badge
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        const u = JSON.parse(stored)
        if (u.doitChangerMotDePasse) {
          setUnreadCount(0)
          return
        }
      }
    } catch (e) {}

    notificationApi.getUnreadCount()
      .then((count) => setUnreadCount(count ?? 0))
      .catch(() => {})
  }, [])

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }, [])

  const value = useMemo(() => {
    return {
      open,
      unreadCount,
      openDrawer: () => setOpen(true),
      closeDrawer: () => setOpen(false),
      toggleDrawer: () => setOpen((v) => !v),
      refreshNotifications: fetchNotifications,
    }
  }, [open, unreadCount, fetchNotifications])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationsDrawer
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        loading={loading}
      />
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
