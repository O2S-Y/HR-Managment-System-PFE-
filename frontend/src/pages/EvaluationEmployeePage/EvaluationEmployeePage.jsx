import { useState, useEffect } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { evaluationApi } from '../../services/authApi'
import './evaluationEmployeePage.css'

function DotRating({ value = 0 }) {
  return (
    <div className="eeDots" aria-label={`Note ${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? 'eeDot eeDotOn' : 'eeDot eeDotOff'} />
      ))}
    </div>
  )
}

export function EvaluationEmployeePage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    evaluationApi.getMyEvaluations()
      .then((data) => setEvaluations(data ?? []))
      .catch((err) => console.error('Failed to load evaluations', err))
      .finally(() => setLoading(false))
  }, [])

  const latest = evaluations[0]

  return (
    <AppShell
      header={
        <TopBar
          title="Évaluations"
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'Employé' }}
        />
      }
    >
      <div className="eePage">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8a9bb0' }}>Chargement…</div>
        ) : evaluations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8a9bb0' }}>Aucune évaluation disponible</div>
        ) : (
          <>
            <section className="eeHeader">
              <div className="eeNameRow">
                <h1 className="eeName">{latest?.employee?.nomComplet || user?.email || '—'}</h1>
                <span className="eePeriodPill">{latest?.periode?.libelle || latest?.dateEvaluation || '—'}</span>
              </div>
              <div className="eeSub">{latest?.employee?.poste || ''} • {latest?.employee?.departement || ''}</div>
            </section>

            <section className="eeOverall">
              <div className="eeOverallTitle">PERFORMANCE GLOBALE</div>
              <div className="eeOverallScore">{latest?.noteGlobale || 0} / 5</div>
              <DotRating value={latest?.noteGlobale || 0} />
              <div className="eeOverallText">
                {(latest?.noteGlobale || 0) >= 4 ? 'Dépasse les attentes' : (latest?.noteGlobale || 0) >= 3 ? 'Répond aux attentes' : 'À améliorer'}
              </div>
            </section>

            {latest?.objectiveScores && latest.objectiveScores.length > 0 && (
              <section className="eeObjectives">
                <div className="eeSectionTitle">DÉTAIL DES OBJECTIFS</div>
                <div className="eeObjGrid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {latest.objectiveScores.map((scoreObj, idx) => (
                    <div key={scoreObj.id || idx} className="eeObjCard" style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div className="eeObjHeader" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                            {idx + 1}. {scoreObj.objectif?.titre || 'Objectif'}
                          </h3>
                          {scoreObj.objectif?.descriptionDetail && (
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.4' }}>
                              {scoreObj.objectif.descriptionDetail}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)' }}>Note : {scoreObj.note || 0}/5</span>
                          <DotRating value={scoreObj.note || 0} />
                        </div>
                      </div>

                      {scoreObj.commentaire && (
                        <div className="eeCommentBox" style={{
                          background: 'var(--surface-2, rgba(0,0,0,0.015))',
                          borderLeft: '3px solid var(--brand-cyan, #5B96AE)',
                          padding: '12px 16px',
                          borderRadius: '0 8px 8px 0',
                          marginTop: '4px'
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Commentaire
                          </div>
                          <div className="eeCommentText" style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.5' }}>
                            {scoreObj.commentaire}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {latest?.commentaires && (
              <section className="eeObjectives">
                <div className="eeSectionTitle">COMMENTAIRE GÉNÉRAL</div>
                <div className="eeObj">
                  <div className="eeCommentBox">
                    <div className="eeCommentText">{latest.commentaires}</div>
                  </div>
                </div>
              </section>
            )}

            <footer className="eeFooter">
              <div className="eeFooterItem">ÉVALUÉ PAR: {latest?.evaluateur?.courriel || '—'}</div>
              <div className="eeFooterItem">{latest?.dateEvaluation || '—'}</div>
            </footer>

            {evaluations.length > 1 && (
              <section className="eeObjectives" style={{ marginTop: '2rem' }}>
                <div className="eeSectionTitle">HISTORIQUE DES ÉVALUATIONS</div>
                {evaluations.slice(1).map((ev) => (
                  <div key={ev.id} className="eeObj" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <div className="eeObjHead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '8px' }}>
                      <div className="eeObjTitle">{ev.periode?.libelle || ev.dateEvaluation || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Global : {ev.noteGlobale || 0}/5</span>
                        <DotRating value={ev.noteGlobale || 0} />
                      </div>
                    </div>
                    
                    {ev.objectiveScores && ev.objectiveScores.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '12px', borderLeft: '2px solid var(--border-soft)' }}>
                        {ev.objectiveScores.map((scoreObj, sIdx) => (
                          <div key={scoreObj.id || sIdx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600 }}>{sIdx + 1}. {scoreObj.objectif?.titre}</span>
                              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Note : {scoreObj.note}/5</span>
                            </div>
                            {scoreObj.commentaire && (
                              <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '2px', fontStyle: 'italic', paddingLeft: '8px' }}>
                                "{scoreObj.commentaire}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {ev.commentaires && (!ev.objectiveScores || ev.objectiveScores.length === 0) && (
                      <div className="eeCommentBox">
                        <div className="eeCommentText">{ev.commentaires}</div>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
