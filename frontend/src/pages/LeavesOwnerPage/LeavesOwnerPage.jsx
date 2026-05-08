import { useState } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import './leavesOwnerPage.css'

const filters = ['Tous', 'Congé Annuel', 'Maladie', 'RTT']

const pending = [
  { initials: 'AL', name: 'Alice Lemaire', title: 'Développeuse Front-end', type: 'Congé Annuel', period: '12 Fév 2024 — 16 Fév 2024', days: '5 jours' },
  { initials: 'MD', name: 'Marc Dubois', title: 'Product Manager', type: 'Maladie', period: '05 Fév 2024', days: '1 jour' },
]

const history = [
  { name: 'Sophie Martin', type: 'Congé Annuel', period: 'Jan 10 — Jan 15', status: 'Approuvé' },
  { name: 'Lucas Petit', type: 'RTT', period: 'Dec 28', status: 'Refusé' },
]

export function LeavesOwnerPage() {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'
  const isRH = user?.role === 'RH'

  const [activeFilter, setActiveFilter] = useState('Tous')
  const [localPending, setLocalPending] = useState(pending)
  const [localHistory, setLocalHistory] = useState(history)

  const handleAction = (request, action) => {
    // Remove from pending
    setLocalPending(prev => prev.filter(p => p.name !== request.name || p.period !== request.period))
    // Add to history
    setLocalHistory(prev => [
      { name: request.name, type: request.type, period: request.period, status: action },
      ...prev
    ])
  }

  const filteredPending = localPending.filter(
    p => activeFilter === 'Tous' || p.type.toLowerCase() === activeFilter.toLowerCase()
  )

  return (
    <AppShell
      header={
        <TopBar
          title="Congés & Absences"
          showSearch
          searchPlaceholder="Rechercher..."
          right={
            <div className="loDates">
              <div className="dateBox">
                <span className="dateLabel">Du</span>
                <span className="dateValue">01/01/2024</span>
              </div>
              <div className="dateBox">
                <span className="dateLabel">Au</span>
                <span className="dateValue">12/31/2024</span>
              </div>
            </div>
          }
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }}
        />
      }
    >
      <div className="loPage">
        <div className="filterRow">
          <div className="filterLabel">TYPE</div>
          <div className="chips">
            {filters.map((f) => (
              <button
                key={f}
                className={f === activeFilter ? 'chip chipActive' : 'chip'}
                type="button"
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="sectionHead">
          <div className="sectionKicker">À TRAITER</div>
          <div className="sectionTitle">Demandes en attente</div>
          <div className="countPill">{filteredPending.length} demande{filteredPending.length !== 1 ? 's' : ''}</div>
        </div>

        <section className="pendingCard">
          {filteredPending.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucune demande en attente.
            </div>
          ) : (
            filteredPending.map((p) => (
              <div key={p.name + p.period} className="pendingRow">
                <div className="miniAvatar">{p.initials}</div>
              <div className="pMeta">
                <div className="pName">{p.name}</div>
                <div className="pTitle">{p.title}</div>
              </div>
              <div className="typePill">{p.type}</div>
              <div className="pPeriod">
                <div className="pDates">{p.period}</div>
                <div className="pDays">{p.days}</div>
              </div>
              <div className="statusPill">En attente</div>
              {/* M2_UC3: Approuver/Refuser — Owner only */}
              {isOwner && (
                <div className="actions">
                  <button className="btnGhost" type="button" onClick={() => handleAction(p, 'Refusé')}>
                    Refuser
                  </button>
                  <button className="btnPrimary" type="button" onClick={() => handleAction(p, 'Approuvé')}>
                    Approuver
                  </button>
                </div>
              )}
              {/* M2_UC5: Ajuster manuellement les soldes — RH only */}
              {isRH && (
                <div className="actions">
                  <button className="btnPrimary" type="button" onClick={() => alert('Ajuster solde pour ' + p.name)}>
                    Ajuster solde
                  </button>
                </div>
              )}
            </div>
          )))}
        </section>

        <section className="history">
          <div className="historyHead">
            <div className="historyTitle">HISTORIQUE DES DÉCISIONS RÉCENTES</div>
            <div className="chev">⌄</div>
          </div>
          {localHistory.map((h, i) => (
            <div key={h.name + h.period + i} className="historyRow">
              <div className="hName">{h.name}</div>
              <div className="hType">{h.type}</div>
              <div className="hPeriod">{h.period}</div>
              <div className={h.status === 'Approuvé' ? 'hStatus ok' : 'hStatus bad'}>{h.status}</div>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  )
}

