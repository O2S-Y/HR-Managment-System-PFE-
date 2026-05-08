import { AppShell } from '../../components/AppShell/AppShell'
import './notificationsPanelPage.css'

const chips = ['Toutes', 'Non lues', 'Congés', 'Évaluations', 'Actifs']

const items = [
  { unread: true, icon: '📅', title: 'Demande de congé approuvée: Jean Dupont (25-28 Oct)', time: 'Il y a 10 min' },
  { unread: true, icon: '⭐', title: 'Évaluation annuelle requise pour le département Marketing', time: 'Il y a 1 heure' },
  { unread: false, icon: '💻', title: 'Nouvel équipement assigné: MacBook Pro (Marie L.)', time: 'Hier à 14:30' },
  { unread: false, icon: '🗓️', title: 'Nouvelle demande de congé en attente: Paul Martin', time: 'Hier à 09:15' },
]

export function NotificationsPanelPage() {
  return (
    <AppShell
      header={
        <div className="npHeader">
          <div className="npLeft">
            <div className="npWorkspace">Workspace HR</div>
            <div className="npMenu">
              <span>Directory</span>
              <span>Resources</span>
              <span>Policies</span>
            </div>
          </div>
          <div className="npRight">
            <span className="npBell" aria-hidden="true">
              🔔
            </span>
            <span className="npAvatar" aria-label="Profil" />
          </div>
        </div>
      }
    >
      <div className="npPage">
        <div className="npBehind" aria-hidden="true">
          <h2 className="npBehindTitle">Dashboard Overview</h2>
          <div className="npCards">
            <div className="npCard" />
            <div className="npCard" />
            <div className="npCard" />
          </div>
        </div>

        <aside className="npPanel" aria-label="Notifications">
          <div className="npPanelHead">
            <div className="npPanelTitle">
              Notifications <span className="npCount">(12)</span>
            </div>
            <button className="npMarkAll" type="button">
              Tout marquer comme lu
            </button>
          </div>

          <div className="npChips">
            {chips.map((c, idx) => (
              <button key={c} className={idx === 0 ? 'npChip npChipActive' : 'npChip'} type="button">
                {c}
              </button>
            ))}
          </div>

          <div className="npList">
            {items.map((it, idx) => (
              <div key={idx} className={it.unread ? 'npItem npUnread' : 'npItem npRead'}>
                <div className="npIcon">{it.icon}</div>
                <div className="npMeta">
                  <div className="npTitle">{it.title}</div>
                  <div className="npTime">{it.time}</div>
                </div>
                {it.unread ? <div className="npDot" aria-hidden="true" /> : null}
              </div>
            ))}
          </div>

          <div className="npFooter">{`Voir tout l'historique d'audit`}</div>
        </aside>
      </div>
    </AppShell>
  )
}

