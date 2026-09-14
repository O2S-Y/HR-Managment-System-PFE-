import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { leaveApi } from '../../services/authApi'
import './leavesOwnerPage.css'

const filters = ['Tous', 'ANNUEL', 'MALADIE', 'SANS_SOLDE', 'AUTRE']
const filterLabels = { Tous: 'Tous', ANNUEL: 'Congé Annuel', MALADIE: 'Maladie', SANS_SOLDE: 'Sans solde', AUTRE: 'Autre' }

function initialsFrom(name) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export function LeavesOwnerPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOwner = user?.role === 'OWNER'
  const isRH = user?.role === 'RH'

  const [activeFilter, setActiveFilter] = useState('Tous')
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [processedLeaves, setProcessedLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    leaveApi.getPending()
      .then((data) => {
        const all = data ?? []
        setPendingLeaves(all.filter(l => l.statut === 'EN_ATTENTE'))
        setProcessedLeaves(all.filter(l => l.statut !== 'EN_ATTENTE'))
      })
      .catch((err) => console.error('Failed to load leaves', err))
      .finally(() => setLoading(false))
  }, [])

  const handleAction = async (leave, approve, comment) => {
    try {
      await leaveApi.processLeave(leave.id, approve, comment)
      setPendingLeaves(prev => prev.filter(p => p.id !== leave.id))
      setProcessedLeaves(prev => [
        { ...leave, statut: approve ? 'APPROUVE' : 'REFUSE', commentaireDecision: comment },
        ...prev,
      ])
    } catch (err) {
      console.error('Process leave failed', err)
      alert(err.response?.data?.message || "Erreur lors du traitement de la demande")
    }
  }


  const filteredPending = pendingLeaves.filter(
    p => activeFilter === 'Tous' || p.typeConge?.categorie === activeFilter
  )

  return (
    <AppShell
      header={
        <TopBar
          title="Congés & Absences"
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }}
          right={
            isRH && (
              <button
                className="btnPrimary"
                type="button"
                onClick={() => navigate('/leaves/admin')}
                style={{ height: '36px', display: 'inline-flex', alignItems: 'center' }}
              >
                Configuration &amp; Mes Congés
              </button>
            )
          }
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
                {filterLabels[f] || f}
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
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement…</div>
          ) : filteredPending.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucune demande en attente.
            </div>
          ) : (
            filteredPending.map((p, index) => {
              const empName = p.employee?.nomComplet || p.employeeName || '—'
              return (
                <div key={p.id} style={{ borderTop: index === 0 ? '0' : '1px solid rgba(193, 199, 207, 0.15)', paddingBottom: isOwner ? '12px' : '0' }}>
                  <div className="pendingRow" style={{ borderTop: 0 }}>
                    <div className="miniAvatar">{initialsFrom(empName)}</div>
                    <div className="pMeta">
                      <div className="pName">{empName}</div>
                      <div className="pTitle">{p.employee?.poste || ''}</div>
                    </div>
                    <div className="typePill">{p.typeConge?.nom || filterLabels[p.typeConge?.categorie] || '—'}</div>
                    <div className="pPeriod">
                      <div className="pDates">{p.dateDebut} — {p.dateFin}</div>
                      <div className="pDays">{p.joursOuvrables} jour{p.joursOuvrables > 1 ? 's' : ''}</div>
                    </div>
                    <div className="statusPill">En attente</div>
                    {isOwner && (
                      <div className="actions">
                        <button 
                          className="btnGhost" 
                          type="button" 
                          onClick={() => {
                            const comment = document.getElementById(`comment-leave-${p.id}`)?.value || ''
                            if (!comment.trim()) {
                              alert("Un commentaire est obligatoire en cas de refus.")
                              return
                            }
                            handleAction(p, false, comment)
                          }}
                        >
                          Refuser
                        </button>
                        <button 
                          className="btnPrimary" 
                          type="button" 
                          onClick={() => {
                            const comment = document.getElementById(`comment-leave-${p.id}`)?.value || ''
                            handleAction(p, true, comment)
                          }}
                        >
                          Approuver
                        </button>
                      </div>
                    )}

                  </div>
                  {isOwner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px 6px 60px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(80, 96, 110, 0.75)', letterSpacing: '0.5px' }}>
                        COMMENTAIRE DE DÉCISION :
                      </span>
                      <input 
                        type="text" 
                        id={`comment-leave-${p.id}`}
                        placeholder="Obligatoire pour refuser..." 
                        style={{ 
                          flex: 1, 
                          maxWidth: '400px', 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border-mid)', 
                          fontSize: '13px' 
                        }} 
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </section>

        <section className="history">
          <div className="historyHead">
            <div className="historyTitle">HISTORIQUE DES DÉCISIONS RÉCENTES</div>
            <div className="chev">⌄</div>
          </div>
          {processedLeaves.map((h) => {
            const statusLabel = h.statut === 'APPROUVE' ? 'Approuvé' : h.statut === 'ANNULE' ? 'Annulé' : 'Refusé'
            return (
              <div key={h.id} className="historyRow">
                <div className="hName">{h.employee?.nomComplet || '—'}</div>
                <div className="hType">{h.typeConge?.nom || filterLabels[h.typeConge?.categorie] || '—'}</div>
                <div className="hPeriod">{h.dateDebut} — {h.dateFin}</div>
                <div className={h.statut === 'APPROUVE' ? 'hStatus ok' : h.statut === 'ANNULE' ? 'hStatus' : 'hStatus bad'}>{statusLabel}</div>
              </div>
            )
          })}
        </section>
      </div>
    </AppShell>
  )
}
