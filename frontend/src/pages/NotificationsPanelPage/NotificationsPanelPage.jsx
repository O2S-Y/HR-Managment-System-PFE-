import { useState, useEffect } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { notificationApi, employeeApi } from '../../services/authApi'
import './notificationsPanelPage.css'

const chipFilters = ['Toutes', 'Non lues']

export function NotificationsPanelPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeChip, setActiveChip] = useState('Toutes')

  // Message Sending State
  const [employees, setEmployees] = useState([])
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  useEffect(() => {
    notificationApi.getAll()
      .then((data) => setNotifications(data ?? []))
      .catch((err) => console.error('Failed to load notifications', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user?.role === 'RH' || user?.role === 'OWNER') {
      employeeApi.getAll()
        .then((data) => setEmployees(data ?? []))
        .catch((err) => console.error('Failed to load employees', err))
    }
  }, [user])

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })))
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const handleToggleRecipient = (userId) => {
    setSelectedRecipients(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    const otherEmployees = employees.filter(emp => emp.userId !== user?.id)
    const filteredEmployees = otherEmployees.filter(emp =>
      emp.nomComplet.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const allFilteredIds = filteredEmployees.map(emp => emp.userId)
    const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedRecipients.includes(emp.userId))

    if (isAllSelected) {
      // Deselect all filtered employees
      setSelectedRecipients(prev => prev.filter(id => !allFilteredIds.includes(id)))
    } else {
      // Select all filtered employees
      setSelectedRecipients(prev => {
        const newSelection = [...prev]
        allFilteredIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id)
          }
        })
        return newSelection
      })
    }
  }

  const handleSendBulk = async (e) => {
    e.preventDefault()
    if (selectedRecipients.length === 0 || !messageText.trim()) return
    try {
      setSending(true)
      setStatusMsg(null)
      await notificationApi.sendBulk(selectedRecipients, messageText.trim())
      setMessageText('')
      setSelectedRecipients([])
      setSearchQuery('')
      setStatusMsg({ success: true, message: 'Message envoyé avec succès.' })
      
      // Refresh notification list to sync
      const updated = await notificationApi.getAll()
      setNotifications(updated ?? [])
    } catch (err) {
      console.error('Failed to send bulk messages', err)
      setStatusMsg({ success: false, message: 'Erreur lors de l\'envoi du message.' })
    } finally {
      setSending(false)
    }
  }

  const filtered = notifications.filter(n => {
    if (activeChip === 'Non lues') return !n.lu
    return true
  })

  const unreadCount = notifications.filter(n => !n.lu).length

  const iconForType = (type) => {
    const map = {
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
    return map[type] || '🔔'
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'À l\'instant'
    if (diffMin < 60) return `Il y a ${diffMin} min`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `Il y a ${diffH}h`
    const diffD = Math.floor(diffH / 24)
    return `Il y a ${diffD} jour${diffD > 1 ? 's' : ''}`
  }

  return (
    <AppShell
      header={
        <TopBar
          title="Notifications"
          user={{ name: user?.email || 'Utilisateur', role: user?.role || '' }}
        />
      }
    >
      <div className="npPage" style={{ paddingRight: '400px', minHeight: 'calc(100svh - 64px)', position: 'relative' }}>
        {/* Left Side Console: Visible only for RH / OWNER */}
        {(user?.role === 'RH' || user?.role === 'OWNER') ? (
          <div className="npAdminPanel" style={{ padding: '32px', maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--np-text)', letterSpacing: '-0.6px', margin: 0 }}>
              Administration des Notifications
            </h2>
            <p style={{ color: 'var(--np-muted)', fontSize: '14px', margin: '-20px 0 0' }}>
              Envoyez un message direct à un collaborateur ou diffusez une annonce générale à l'ensemble du personnel.
            </p>

             {/* Unified Communication Form */}
             <form onSubmit={handleSendBulk} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--np-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--np-text)', margin: 0 }}>
                 Envoyer un message ou une annonce
               </h3>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--np-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                   Destinataires
                 </label>

                 {/* Search Field */}
                 <input
                   type="text"
                   placeholder="Rechercher un collaborateur..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', outline: 'none', marginBottom: '4px' }}
                 />

                 {/* Select All Toggle */}
                 {(() => {
                   const otherEmployees = employees.filter(emp => emp.userId !== user?.id)
                   const filteredEmployees = otherEmployees.filter(emp =>
                     emp.nomComplet.toLowerCase().includes(searchQuery.toLowerCase())
                   )
                   const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedRecipients.includes(emp.userId))
                   
                   return (
                     <>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text)', cursor: 'pointer', paddingBottom: '8px', borderBottom: '1px solid var(--border-soft)' }}>
                         <input
                           type="checkbox"
                           checked={isAllSelected}
                           onChange={handleSelectAll}
                         />
                         Tout sélectionner ({filteredEmployees.length})
                       </label>

                       {/* List container */}
                       <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 12px', border: '1px solid var(--border-soft)', borderRadius: '8px', background: 'var(--surface-hover, rgba(0,0,0,0.015))' }}>
                         {filteredEmployees.length === 0 ? (
                           <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                             Aucun collaborateur trouvé
                           </div>
                         ) : (
                           filteredEmployees.map(emp => {
                             const isChecked = selectedRecipients.includes(emp.userId)
                             return (
                               <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text)', cursor: 'pointer' }}>
                                 <input
                                   type="checkbox"
                                   checked={isChecked}
                                   onChange={() => handleToggleRecipient(emp.userId)}
                                 />
                                 <span>{emp.nomComplet}</span>
                                 <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '4px' }}>
                                   ({emp.userRole === 'EMPLOYE' ? 'Employé' : emp.userRole})
                                 </span>
                               </label>
                             )
                           })
                         )}
                       </div>
                     </>
                   )
                 })()}
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--np-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                   Message
                 </label>
                 <textarea
                   value={messageText}
                   onChange={(e) => setMessageText(e.target.value)}
                   placeholder="Écrivez votre message ici..."
                   style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', minHeight: '90px', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
                   required
                 />
               </div>

               <button
                 type="submit"
                 disabled={sending || selectedRecipients.length === 0 || !messageText.trim()}
                 style={{ padding: '12px 20px', borderRadius: '8px', background: 'var(--np-accent)', color: '#fff', border: 0, fontWeight: 800, fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s', opacity: (sending || selectedRecipients.length === 0 || !messageText.trim()) ? 0.6 : 1 }}
               >
                 {sending ? 'Envoi en cours...' : `Envoyer à ${selectedRecipients.length} destinataire(s)`}
               </button>

               {statusMsg && (
                 <div style={{ fontSize: '13px', color: statusMsg.success ? '#10b981' : '#ef4444', fontWeight: 700, marginTop: '4px' }}>
                   {statusMsg.message}
                 </div>
               )}
             </form>
          </div>
        ) : (
          <div style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--np-text)', letterSpacing: '-0.6px', margin: 0 }}>
              Tableau de bord des notifications
            </h2>
            <p style={{ color: 'var(--np-muted)', marginTop: '8px', fontSize: '14px' }}>
              Consultez et gérez vos notifications sur le panneau latéral droit.
            </p>
          </div>
        )}

        {/* Right Side Sidebar: Notifications History Panel */}
        <aside className="npPanel" aria-label="Notifications" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '380px', borderLeft: '1px solid var(--np-border)', display: 'flex', flexDirection: 'column' }}>
          <div className="npPanelHead">
            <div className="npPanelTitle">
              Notifications <span className="npCount">({unreadCount})</span>
            </div>
            <button className="npMarkAll" type="button" onClick={handleMarkAllRead} style={{ cursor: 'pointer' }}>
              Tout marquer comme lu
            </button>
          </div>

          <div className="npChips">
            {chipFilters.map((c) => (
              <button
                key={c}
                className={c === activeChip ? 'npChip npChipActive' : 'npChip'}
                type="button"
                onClick={() => setActiveChip(c)}
                style={{ cursor: 'pointer' }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="npList">
            {loading ? (
              <div className="npItem npRead" style={{ textAlign: 'center', color: '#8a9bb0' }}>
                <div className="npMeta"><div className="npTitle">Chargement…</div></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="npItem npRead" style={{ textAlign: 'center', color: '#8a9bb0' }}>
                <div className="npMeta"><div className="npTitle">Aucune notification</div></div>
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  className={!n.lu ? 'npItem npUnread' : 'npItem npRead'}
                  onClick={() => !n.lu && handleMarkRead(n.id)}
                  style={{ cursor: !n.lu ? 'pointer' : 'default' }}
                >
                  <div className="npIcon">{iconForType(n.typeEvenement)}</div>
                  <div className="npMeta">
                    <div className="npTitle">{n.message || n.titre || '—'}</div>
                    <div className="npTime">{timeAgo(n.dateCreation)}</div>
                  </div>
                  {!n.lu ? <div className="npDot" aria-hidden="true" /> : null}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
