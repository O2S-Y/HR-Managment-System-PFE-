import { useState, useEffect } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { evaluationApi } from '../../services/authApi'
import toast from 'react-hot-toast'
import './evaluationRhPage.css'

function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M5 9.2h3V19H5V9.2ZM10.6 5h2.8v14h-2.8V5Zm5.6 8H19v6h-2.8v-6Z" />
    </svg>
  )
}

function DotRating({ value = 0 }) {
  return (
    <div className="erhDots" aria-label={`Note ${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? 'erhDot erhDotOn' : 'erhDot erhDotOff'} />
      ))}
    </div>
  )
}

export function EvaluationRhPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const evals = await evaluationApi.getAll()
        const mapped = (evals || []).map(ev => ({
          id: ev.id,
          name: ev.employee?.nomComplet || ev.employee?.user?.email || '—',
          dept: ev.employee?.departement || '—',
          period: ev.periode?.libelle || ev.dateEvaluation || '—',
          score: ev.noteGlobale || 0,
          status: ev.statut === 'FINALISE' ? 'Finalisée' : ev.statut === 'BROUILLON' ? 'Brouillon' : ev.statut || 'Complété',
          commentaires: ev.commentaires || '—',
        }))
        setEvaluations(mapped)
      } catch (err) {
        console.error('Failed to load evaluations', err)
        toast.error("Erreur lors du chargement des évaluations")
      } finally {
        setLoading(false)
      }
    }
    fetchEvaluations()
  }, [])

  return (
    <AppShell
      header={
        <TopBar
          title="Évaluations"
          right={
            <button className="erhExportBtn" type="button" onClick={() => window.print()}>
              <IconChart />
              Générer rapport
            </button>
          }
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }}
        />
      }
    >
      <div className="erhPage">
        <section className="erhCard">
          <div className="erhCardHead">
            <div className="erhCardTitle">ÉVALUATIONS — CONSULTATION</div>
          </div>
          <table className="erhTable">
            <thead>
              <tr>
                <th>EMPLOYÉ</th>
                <th>DÉPARTEMENT</th>
                <th>PÉRIODE</th>
                <th>NOTE</th>
                <th>COMMENTAIRES</th>
                <th className="thRight">STATUT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#8a9bb0' }}>Chargement…</td></tr>
              ) : evaluations.length > 0 ? (
                evaluations.map((ev) => (
                  <tr key={ev.id || ev.name}>
                    <td className="strong">{ev.name}</td>
                    <td>{ev.dept}</td>
                    <td className="mono">{ev.period}</td>
                    <td><DotRating value={ev.score} /></td>
                    <td className="erhComment">{ev.commentaires}</td>
                    <td className="tdRight">
                      <span className={ev.status === 'Complété' || ev.status === 'Finalisée' || ev.status === 'FINALISE' ? 'erhStatus ok' : 'erhStatus wait'}>{ev.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Aucune évaluation trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  )
}
