import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import './evaluationOwnerPage.css'

function RatingDots({ value = 3, size = 16 }) {
  return (
    <div className="rate" aria-label={`Note ${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = idx < value
        return (
          <span
            key={idx}
            className={filled ? 'rDot rDotFilled' : 'rDot rDotEmpty'}
            style={{ width: size, height: size }}
          />
        )
      })}
    </div>
  )
}

export function EvaluationOwnerPage() {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'
  const isRH = user?.role === 'RH'

  return (
    <AppShell
      header={
        <TopBar title="Évaluation de Performance" showSearch searchPlaceholder="Rechercher..." user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }} />
      }
    >
      <div className="eoPage">
        <div className="eoSelectors">
          <button className="eoEmployeeBtn" type="button">
            <span className="eoEmployeeIcon" aria-hidden="true">
              👤
            </span>
            Sélectionner un employé
            <span className="eoCaret" aria-hidden="true">
              ▾
            </span>
          </button>

          <div className="eoPeriods" role="tablist" aria-label="Périodes">
            <button className="eoPeriod eoPeriodActive" type="button">
              T1 2025
            </button>
            <button className="eoPeriod" type="button">
              T2 2025
            </button>
            <button className="eoPeriod" type="button">
              T3 2025
            </button>
          </div>
        </div>

        <div className="eoDivider" />

        <section className="eoObjectives">
          <div className="obj">
            <div className="objHead">
              <div className="objTitle">Qualité du code</div>
              <RatingDots value={3} />
            </div>
            <div className="objBox">
              Commentaires sur la qualité du code (ex: tests unitaires, respect des conventions)...
            </div>
          </div>

          <div className="obj">
            <div className="objHead">
              <div className="objTitle">Collaboration équipe</div>
              <RatingDots value={4} />
            </div>
            <div className="objBox">{`Commentaires sur la communication et le travail d'équipe...`}</div>
          </div>

          <div className="obj">
            <div className="objHead">
              <div className="objTitle">Respect des délais</div>
              <RatingDots value={2} />
            </div>
            <div className="objBox">Commentaires sur la gestion du temps et les livraisons...</div>
          </div>
        </section>

        {/* M3_UC3: Soumettre une évaluation — Owner only */}
        {isOwner && (
          <div className="eoBottom">
            <div className="eoBottomTitle">NOTE GLOBALE</div>
            <RatingDots value={3} size={24} />
            <button className="eoSubmit" type="button">
              <span>▷ Soumettre l'évaluation</span>
            </button>
          </div>
        )}
        {/* M3_UC5: RH sees read-only overall rating */}
        {isRH && (
          <div className="eoBottom">
            <div className="eoBottomTitle">NOTE GLOBALE</div>
            <RatingDots value={3} size={24} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)', marginTop: '0.5rem' }}>Lecture seule</div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

