import { useState } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import './evaluationOwnerPage.css'

function RatingDots({ value = 3, size = 16, onChange, readonly = false }) {
  return (
    <div className="rate" aria-label={`Note ${value} sur 5`} style={{ cursor: readonly ? 'default' : 'pointer' }}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = idx < value
        return (
          <span
            key={idx}
            className={filled ? 'rDot rDotFilled' : 'rDot rDotEmpty'}
            style={{ width: size, height: size }}
            onClick={() => {
              if (!readonly && onChange) onChange(idx + 1)
            }}
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

  const [activePeriod, setActivePeriod] = useState('T1 2025')
  const [scores, setScores] = useState([3, 4, 2])
  const [comments, setComments] = useState(['', '', ''])

  const globalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) || 0

  const handleSubmit = () => {
    alert(`Évaluation soumise pour la période ${activePeriod} avec une note globale de ${globalScore}/5`)
  }

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
            {['T1 2025', 'T2 2025', 'T3 2025'].map(p => (
              <button
                key={p}
                className={activePeriod === p ? 'eoPeriod eoPeriodActive' : 'eoPeriod'}
                type="button"
                onClick={() => setActivePeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="eoDivider" />

        <section className="eoObjectives">
          <div className="obj">
            <div className="objHead">
              <div className="objTitle">Qualité du code</div>
              <RatingDots value={scores[0]} onChange={(v) => setScores([v, scores[1], scores[2]])} readonly={!isOwner} />
            </div>
            {isOwner ? (
              <textarea className="objBox" style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid var(--border-soft)', borderRadius: '4px', background: 'transparent', resize: 'vertical' }} value={comments[0]} onChange={e => setComments([e.target.value, comments[1], comments[2]])} placeholder="Commentaires sur la qualité du code..." />
            ) : (
              <div className="objBox">{comments[0] || 'Commentaires sur la qualité du code (ex: tests unitaires, respect des conventions)...'}</div>
            )}
          </div>

          <div className="obj">
            <div className="objHead">
              <div className="objTitle">Collaboration équipe</div>
              <RatingDots value={scores[1]} onChange={(v) => setScores([scores[0], v, scores[2]])} readonly={!isOwner} />
            </div>
            {isOwner ? (
              <textarea className="objBox" style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid var(--border-soft)', borderRadius: '4px', background: 'transparent', resize: 'vertical' }} value={comments[1]} onChange={e => setComments([comments[0], e.target.value, comments[2]])} placeholder="Commentaires sur la communication et le travail d'équipe..." />
            ) : (
              <div className="objBox">{comments[1] || "Commentaires sur la communication et le travail d'équipe..."}</div>
            )}
          </div>

          <div className="obj">
            <div className="objHead">
              <div className="objTitle">Respect des délais</div>
              <RatingDots value={scores[2]} onChange={(v) => setScores([scores[0], scores[1], v])} readonly={!isOwner} />
            </div>
            {isOwner ? (
              <textarea className="objBox" style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid var(--border-soft)', borderRadius: '4px', background: 'transparent', resize: 'vertical' }} value={comments[2]} onChange={e => setComments([comments[0], comments[1], e.target.value])} placeholder="Commentaires sur la gestion du temps et les livraisons..." />
            ) : (
              <div className="objBox">{comments[2] || 'Commentaires sur la gestion du temps et les livraisons...'}</div>
            )}
          </div>
        </section>

        {/* M3_UC3: Soumettre une évaluation — Owner only */}
        {isOwner && (
          <div className="eoBottom">
            <div className="eoBottomTitle">NOTE GLOBALE</div>
            <RatingDots value={globalScore} size={24} readonly />
            <button className="eoSubmit" type="button" onClick={handleSubmit}>
              <span>▷ Soumettre l'évaluation</span>
            </button>
          </div>
        )}
        {/* M3_UC5: RH sees read-only overall rating */}
        {isRH && (
          <div className="eoBottom">
            <div className="eoBottomTitle">NOTE GLOBALE</div>
            <RatingDots value={globalScore} size={24} readonly />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #6b7280)', marginTop: '0.5rem' }}>Lecture seule</div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

