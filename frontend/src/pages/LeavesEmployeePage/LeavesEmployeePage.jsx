import { useState } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import './leavesEmployeePage.css'

function IconPaperPlane(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M2 21 23 12 2 3v7l15 2-15 2v7Z" />
    </svg>
  )
}

const myRequests = [
  { type: 'Congés payés', typeTone: 'purple', period: '12 Août – 23 Août', duration: '10 jours', status: 'Approuvé', tone: 'ok' },
  { type: 'RTT', typeTone: 'indigo', period: '05 Septembre', duration: '1 jour', status: 'En attente', tone: 'wait' },
  { type: 'Maladie', typeTone: 'rose', period: '10 Mai – 11 Mai', duration: '2 jours', status: 'Justifié', tone: 'info' },
  { type: 'Congés payés', typeTone: 'purple', period: '26 Déc – 31 Déc', duration: '4 jours', status: 'Refusé', tone: 'bad' },
]

export function LeavesEmployeePage() {
  const [localRequests, setLocalRequests] = useState(myRequests)
  const [type, setType] = useState('Congés payés')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [comment, setComment] = useState('')

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!startDate || !endDate || duration <= 0) return

    const newReq = {
      type,
      typeTone: type === 'RTT' ? 'indigo' : type === 'Maladie' ? 'rose' : 'purple',
      period: `${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}`,
      duration: `${duration} jour${duration > 1 ? 's' : ''}`,
      status: 'En attente',
      tone: 'wait'
    }

    setLocalRequests([newReq, ...localRequests])
    setStartDate('')
    setEndDate('')
    setComment('')
    setType('Congés payés')
  }

  return (
    <AppShell
      header={
        <TopBar title="Congés & Absences" showSearch searchPlaceholder="Rechercher..." user={{ name: 'Mohamed Alami', role: 'Employé' }} />
      }
    >
      <div className="lePage">
        <section className="leKpis" aria-label="Solde">
          <div className="leKpi">
            <div className="leKpiLabel">ACQUIS</div>
            <div className="leKpiValue">26</div>
          </div>
          <div className="leKpiDivider" />
          <div className="leKpi">
            <div className="leKpiLabel">PRIS</div>
            <div className="leKpiValue">8</div>
          </div>
          <div className="leKpiDivider" />
          <div className="leKpi">
            <div className="leKpiLabel">RESTANTS</div>
            <div className="leKpiValue">18</div>
          </div>
        </section>

        <section className="card" aria-label="Nouvelle demande">
          <h2 className="cardTitle">Nouvelle demande</h2>

          <form className="formGrid" onSubmit={handleSubmit}>
            <div className="field">
              <div className="label">TYPE DE CONGÉ</div>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Congés payés">Congés payés</option>
                <option value="RTT">RTT</option>
                <option value="Maladie">Maladie</option>
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
              <div className="label">COMMENTAIRE (OPTIONNEL)</div>
              <textarea className="textarea" placeholder="Ajoutez un motif ou une précision si nécessaire..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>

            <div className="cardFooter" style={{ gridColumn: '1 / -1' }}>
              <div className="duration">
                <span className="durationDot" aria-hidden="true" />
                Durée : {duration > 0 ? `${duration} jour${duration > 1 ? 's' : ''} ouvrable${duration > 1 ? 's' : ''}` : '-'}
              </div>
              <button className="submitBtn" type="submit" disabled={duration <= 0}>
                <IconPaperPlane />
                Soumettre
              </button>
            </div>
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
                <th className="thRight">STATUT</th>
              </tr>
            </thead>
            <tbody>
              {localRequests.map((r, idx) => (
                <tr key={idx}>
                  <td className="strong">{r.type}</td>
                  <td className="mono">{r.period}</td>
                  <td>{r.duration}</td>
                  <td className="tdRight">
                    <span className={`badge ${r.tone}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cardLink">{`Voir tout l'historique ›`}</div>
        </section>
      </div>
    </AppShell>
  )
}

