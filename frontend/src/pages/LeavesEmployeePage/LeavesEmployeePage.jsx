import { useState, useEffect } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { leaveApi, employeeApi } from '../../services/authApi'
import './leavesEmployeePage.css'

function IconPaperPlane(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M2 21 23 12 2 3v7l15 2-15 2v7Z" />
    </svg>
  )
}

export function LeavesEmployeePage() {
  const { user } = useAuth()
  const [myRequests, setMyRequests] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [typeId, setTypeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [comment, setComment] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [profile, setProfile] = useState(null)

  // Load my leave history, profile and active leave types on mount
  useEffect(() => {
    Promise.all([
      leaveApi.getMyLeaves(),
      employeeApi.getMe(),
      leaveApi.getTypes(),
    ])
      .then(([leavesData, profileData, typesData]) => {
        setMyRequests(leavesData ?? [])
        setProfile(profileData)
        const types = typesData ?? []
        setLeaveTypes(types)
        if (types.length > 0) setTypeId(String(types[0].id))
      })
      .catch((err) => console.error('Failed to load leaves, profile or types', err))
      .finally(() => setLoading(false))
  }, [])

  const selectedType = leaveTypes.find((t) => String(t.id) === String(typeId)) || null

  const joursAcquis = profile?.leaveAcquired ?? 0
  const joursPris = profile?.leaveUsed ?? 0
  const joursRestants = profile?.leaveRemaining ?? 0

  // Calculate rough duration
  let duration = 0
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      const diffTime = Math.abs(end - start)
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // inclusive
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate || duration <= 0 || submitting || !selectedType) return
    setSubmitError('')

    if (selectedType.categorie === 'ANNUEL' && duration > joursRestants) {
      setSubmitError(`Votre solde de congés est insuffisant (Solde disponible : ${joursRestants} jours).`)
      return
    }

    setSubmitting(true)
    try {
      const newLeave = await leaveApi.submitLeave({
        idTypeConge: Number(selectedType.id),
        dateDebut: startDate,
        dateFin: endDate,
        joursOuvrables: duration,
        commentaire: comment,
      })
      setMyRequests((prev) => [newLeave, ...prev])
      setStartDate('')
      setEndDate('')
      setComment('')
      if (leaveTypes.length > 0) setTypeId(String(leaveTypes[0].id))

      // Re-fetch profile to sync balances
      employeeApi.getMe().then(p => setProfile(p)).catch(() => {})
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette demande ?")) return
    try {
      const updated = await leaveApi.cancelLeave(id)
      setMyRequests((prev) => prev.map((r) => (r.id === id ? updated : r)))
      employeeApi.getMe().then(p => setProfile(p)).catch(() => {})
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'annulation")
    }
  }

  // Map backend status to badge tone
  const statusTone = (s) => {
    if (!s) return 'wait'
    s = s.toUpperCase()
    if (s === 'APPROUVE') return 'ok'
    if (s === 'REFUSE') return 'bad'
    if (s === 'EN_ATTENTE') return 'wait'
    return 'info'
  }

  const statusLabel = (s) => {
    if (!s) return '—'
    const map = { 'EN_ATTENTE': 'En attente', 'APPROUVE': 'Approuvé', 'REFUSE': 'Refusé' }
    return map[s.toUpperCase()] ?? s
  }


  return (
    <AppShell
      header={
        <TopBar title="Congés & Absences" user={{ name: user?.email || 'Utilisateur', role: user?.role || 'Employé' }} />
      }
    >
      <div className="lePage">
        <section className="leKpis" aria-label="Solde">
          <div className="leKpi">
            <div className="leKpiLabel">ACQUIS</div>
            <div className="leKpiValue">{joursAcquis}</div>
          </div>
          <div className="leKpiDivider" />
          <div className="leKpi">
            <div className="leKpiLabel">PRIS</div>
            <div className="leKpiValue">{joursPris}</div>
          </div>
          <div className="leKpiDivider" />
          <div className="leKpi">
            <div className="leKpiLabel">RESTANTS</div>
            <div className="leKpiValue">{joursRestants}</div>
          </div>
        </section>

        <section className="card" aria-label="Nouvelle demande">
          <h2 className="cardTitle">Nouvelle demande</h2>

          <form className="formGrid" onSubmit={handleSubmit}>
            <div className="field">
              <div className="label">TYPE DE CONGÉ</div>
              <select className="select" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
                {leaveTypes.length === 0 && <option value="">Aucun type disponible</option>}
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.nom}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <div className="label">DATE DE DÉBUT</div>
              <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="field">
              <div className="label">DATE DE FIN</div>
              <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div className="field fieldWide">
              <div className="label">MOTIF</div>
              <textarea className="textarea" placeholder="Indiquez le motif de votre demande de congé..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>

            <div className="cardFooter" style={{ gridColumn: '1 / -1' }}>
              <div className="duration">
                <span className="durationDot" aria-hidden="true" />
                Durée : {duration > 0 ? `${duration} jour${duration > 1 ? 's' : ''} ouvrable${duration > 1 ? 's' : ''}` : '-'}
              </div>
              <button className="submitBtn" type="submit" disabled={duration <= 0 || submitting}>
                <IconPaperPlane />
                {submitting ? 'Envoi…' : 'Soumettre'}
              </button>
            </div>
            {submitError && <div className="badge bad" style={{ marginTop: '0.5rem' }}>{submitError}</div>}
          </form>
        </section>

        <section className="card" aria-label="Mes demandes">
          <div className="cardHeadRow">
            <h2 className="cardTitle">Mes demandes</h2>
          </div>
          <table className="reqTable">
            <thead>
              <tr>
                <th>TYPE</th>
                <th>PÉRIODE</th>
                <th>DURÉE</th>
                <th>STATUT</th>
                <th className="thRight">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: '#8a9bb0' }}>Chargement…</td></tr>
              ) : myRequests.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: '#8a9bb0' }}>Aucune demande</td></tr>
              ) : myRequests.map((r, idx) => (
                <tr key={r.id ?? idx}>
                  <td className="strong">
                    {r.typeConge?.nom ?? '—'}
                    {r.commentaireDecision && (
                      <div style={{ fontSize: '11px', color: '#e74c3c', marginTop: '4px', fontWeight: 'normal' }}>
                        Note décideur: {r.commentaireDecision}
                      </div>
                    )}
                  </td>
                  <td className="mono">{r.dateDebut} – {r.dateFin}</td>
                  <td>{r.joursOuvrables ?? '—'} j.</td>
                  <td>
                    <span className={`badge ${statusTone(r.statut)}`}>{statusLabel(r.statut)}</span>
                  </td>
                  <td className="tdRight">
                    {r.statut === 'EN_ATTENTE' && (
                      <button
                        type="button"
                        style={{ color: '#dc2626', padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => handleCancel(r.id)}
                      >
                        Annuler
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  )
}

