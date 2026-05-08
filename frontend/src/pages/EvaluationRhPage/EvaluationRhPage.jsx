import { useState } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import './evaluationRhPage.css'

function DotRating({ value = 3 }) {
  return (
    <div className="erhDots" aria-label={`Note ${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? 'erhDot erhDotOn' : 'erhDot erhDotOff'} />
      ))}
    </div>
  )
}

const evaluations = [
  { name: 'Mohamed Alami', dept: 'Engineering', period: 'T1 2025', score: 4, status: 'Complété' },
  { name: 'Alice Lemaire', dept: 'Design', period: 'T1 2025', score: 3, status: 'Complété' },
  { name: 'Marc Dubois', dept: 'Produit', period: 'T1 2025', score: 5, status: 'Complété' },
  { name: 'Sophie Martin', dept: 'Marketing', period: 'T1 2025', score: 4, status: 'En cours' },
]

export function EvaluationRhPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEvaluations = evaluations.filter(ev => 
    ev.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AppShell
      header={
        <TopBar
          title="Évaluations"
          subtitle="LECTURE SEULE"
          showSearch
          searchPlaceholder="Rechercher un employé..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          right={
            <button className="erhExportBtn" type="button">
              📊 Générer rapport
            </button>
          }
          user={{ name: 'Admin RH', role: 'RH' }}
        />
      }
    >
      <div className="erhPage">
        <section className="erhCard">
          <div className="erhCardHead">
            <div className="erhCardTitle">ÉVALUATIONS — CONSULTATION</div>
            <div className="erhBadgeRO">Lecture seule</div>
          </div>
          <table className="erhTable">
            <thead>
              <tr>
                <th>EMPLOYÉ</th>
                <th>DÉPARTEMENT</th>
                <th>PÉRIODE</th>
                <th>NOTE</th>
                <th className="thRight">STATUT</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvaluations.length > 0 ? (
                filteredEvaluations.map((ev) => (
                  <tr key={ev.name}>
                    <td className="strong">{ev.name}</td>
                    <td>{ev.dept}</td>
                    <td className="mono">{ev.period}</td>
                    <td><DotRating value={ev.score} /></td>
                    <td className="tdRight">
                      <span className={ev.status === 'Complété' ? 'erhStatus ok' : 'erhStatus wait'}>{ev.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Aucune évaluation trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  )
}
