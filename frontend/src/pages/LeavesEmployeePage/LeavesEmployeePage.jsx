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

          <div className="formGrid">
            <div className="field">
              <div className="label">TYPE DE CONGÉ</div>
              <select className="select">
                <option>Congés payés</option>
                <option>RTT</option>
                <option>Maladie</option>
              </select>
            </div>
            <div className="field">
              <div className="label">DATE DE DÉBUT</div>
              <input className="input" placeholder="mm/dd/yyyy" />
            </div>
            <div className="field">
              <div className="label">DATE DE FIN</div>
              <input className="input" placeholder="mm/dd/yyyy" />
            </div>
            <div className="field fieldWide">
              <div className="label">COMMENTAIRE (OPTIONNEL)</div>
              <textarea className="textarea" placeholder="Ajoutez un motif ou une précision si nécessaire..." />
            </div>
          </div>

          <div className="cardFooter">
            <div className="duration">
              <span className="durationDot" aria-hidden="true" />
              Durée : 5 jours ouvrables
            </div>
            <button className="submitBtn" type="button">
              <IconPaperPlane />
              Soumettre
            </button>
          </div>
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
              {myRequests.map((r, idx) => (
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

