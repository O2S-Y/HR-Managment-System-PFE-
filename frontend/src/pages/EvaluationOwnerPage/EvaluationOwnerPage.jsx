import { useState, useEffect, useCallback } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { employeeApi, evaluationApi, evaluationPeriodApi, objectiveApi } from '../../services/authApi'
import { getPhotoUrl } from '../../services/http'
import './evaluationOwnerPage.css'

/* ─── Helpers ───────────────────────────────────────────────── */
function formatDate(isoStr) {
  if (!isoStr) return ''
  const [y, m, d] = isoStr.split('-')
  return `${d}/${m}/${y}`
}

/* ─── Subcomponents ──────────────────────────────────────────── */

function RatingDots({ value = 0, size = 16, onChange, readonly = false }) {
  return (
    <div className="rate" aria-label={`Note ${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <span
          key={idx}
          className={idx < value ? 'rDot rDotFilled' : 'rDot rDotEmpty'}
          style={{ width: size, height: size, cursor: readonly ? 'default' : 'pointer' }}
          onClick={() => { if (!readonly && onChange) onChange(idx + 1) }}
          title={`${idx + 1}/5`}
        />
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE:   { label: 'Active',   cls: 'badgeActive' },
    CLOTUREE: { label: 'Clôturée', cls: 'badgeClosed' },
  }
  const { label, cls } = map[status] || {}
  return <span className={`badge ${cls}`}>{label}</span>
}


/* ─── Main page ──────────────────────────────────────────────── */

export function EvaluationOwnerPage() {
  const { user } = useAuth()

  // ── Employee list from API
  const [apiEmployees, setApiEmployees] = useState([])

  // ── Periods state
  const [periods, setPeriods]         = useState([])
  const [activePeriodId, setActivePeriodId] = useState(null)

  // ── Objectives for the active period (loaded from backend)
  const [objectives, setObjectives] = useState([])

  // ── Tab: 'setup' | 'evaluate'
  const [tab, setTab] = useState('setup')

  // ── Period creation modal
  const [showPeriodModal, setShowPeriodModal] = useState(false)
  const [newPeriod, setNewPeriod] = useState({ libelle: '', dateDebut: '', dateFin: '' })

  // ── Objective creation modal
  const [showObjModal, setShowObjModal] = useState(false)
  const [newObj, setNewObj] = useState({ titre: '', description: '' })

  // ── Evaluation state (local UI state for scoring before submit)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [scores, setScores]   = useState({})   // { empId: [s1,s2,...] }
  const [comments, setComments] = useState({}) // { empId: [c1,c2,...] }
  const [noteGlobale, setNoteGlobale] = useState({}) // { empId: int }

  // ── Submitted evaluations from backend (to mark employees as evaluated)
  const [submittedEvals, setSubmittedEvals] = useState([]) // array of Evaluation objects

  // ── Confirm close modal
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  // ── Loading / saving state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  /* helpers */
  const activePeriod = periods.find(p => p.id === activePeriodId) || null
  const isActive     = activePeriod?.statut === 'ACTIVE'

  function getScore(empId, i) {
    return scores[empId]?.[i] ?? 0
  }
  function getComment(empId, i) {
    return comments[empId]?.[i] ?? ''
  }
  function getNoteGlobale(empId) {
    return noteGlobale[empId] ?? 0
  }

  function setScore(empId, i, v) {
    setScores(prev => ({
      ...prev,
      [empId]: Object.assign(
        Array.from({ length: objectives.length }, (_, j) => getScore(empId, j)),
        { [i]: v }
      ),
    }))
  }
  function setComment(empId, i, v) {
    setComments(prev => ({
      ...prev,
      [empId]: Object.assign(
        Array.from({ length: objectives.length }, (_, j) => getComment(empId, j)),
        { [i]: v }
      ),
    }))
  }

  /* ── Load objectives for a period */
  const loadObjectives = useCallback(async (periodId) => {
    try {
      const objs = await objectiveApi.getByPeriod(periodId)
      setObjectives(objs ?? [])
    } catch (err) {
      console.error('Failed to load objectives', err)
      setObjectives([])
    }
  }, [])

  /* ── Load all data on mount */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Load employees
        const emps = await employeeApi.getAll()
        const mapped = (emps ?? []).map(e => {
          const name = e.nomComplet || e.name || '—'
          const parts = name.trim().split(/\s+/)
          const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase()
          return {
            id: e.id,
            name,
            poste: e.poste || '—',
            departement: e.departement || '—',
            initials,
            photoProfil: e.photoProfil || '',
          }
        })
        setApiEmployees(mapped)

        // Load periods from backend
        const periodsData = await evaluationPeriodApi.getAll()
        setPeriods(periodsData ?? [])

        // Auto-select the first active period, or the first period overall
        if (periodsData && periodsData.length > 0) {
          const active = periodsData.find(p => p.statut === 'ACTIVE')
          const selected = active || periodsData[0]
          setActivePeriodId(selected.id)
          // Load objectives for this period
          await loadObjectivesForPeriod(selected.id)
        }

        // Load all submitted evaluations (to mark employees as evaluated)
        try {
          const evals = await evaluationApi.getAll()
          setSubmittedEvals(evals ?? [])
        } catch (err) {
          console.error('Failed to load evaluations', err)
        }
      } catch (error) {
        console.error('Error fetching evaluation data:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadObjectivesForPeriod = async (periodId) => {
      try {
        const objs = await objectiveApi.getByPeriod(periodId)
        setObjectives(objs ?? [])
      } catch (err) {
        console.error('Failed to load objectives', err)
      }
    }

    fetchData()
  }, [])

  /* ── When active period changes, load its objectives */
  const handleSelectPeriod = async (periodId) => {
    setActivePeriodId(periodId)
    setSelectedEmployee(null)
    // Reset local scoring state when switching periods
    setScores({})
    setComments({})
    setNoteGlobale({})
    await loadObjectives(periodId)
  }

  /* ── Create period via API */
  async function handleCreatePeriod() {
    if (!newPeriod.libelle.trim() || !newPeriod.dateDebut) return
    setSaving(true)
    try {
      const created = await evaluationPeriodApi.create({
        libelle: newPeriod.libelle.trim(),
        dateDebut: newPeriod.dateDebut,
        dateFin: newPeriod.dateFin || newPeriod.dateDebut,
      })
      // Add to local state and select it
      setPeriods(prev => [created, ...prev])
      setActivePeriodId(created.id)
      setObjectives([])
      setNewPeriod({ libelle: '', dateDebut: '', dateFin: '' })
      setShowPeriodModal(false)
      setTab('setup')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la création'
      alert(`❌ ${msg}`)
      console.error('Failed to create period', err)
    } finally {
      setSaving(false)
    }
  }

  /* ── Add objective via API */
  async function handleAddObjective() {
    if (!newObj.titre.trim() || !activePeriodId) return
    setSaving(true)
    try {
      const created = await objectiveApi.create({
        idPeriode: activePeriodId,
        titre: newObj.titre.trim(),
        descriptionDetail: newObj.description.trim() || null,
      })
      setObjectives(prev => [...prev, created])
      setNewObj({ titre: '', description: '' })
      setShowObjModal(false)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la création'
      alert(`❌ ${msg}`)
      console.error('Failed to create objective', err)
    } finally {
      setSaving(false)
    }
  }

  /* ── Remove objective via API */
  async function handleDeleteObjective(objId) {
    setSaving(true)
    try {
      await objectiveApi.delete(objId)
      setObjectives(prev => prev.filter(o => o.id !== objId))
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la suppression'
      alert(`❌ ${msg}`)
      console.error('Failed to delete objective', err)
    } finally {
      setSaving(false)
    }
  }

  /* ── Submit evaluation via API */
  async function handleSubmitEval() {
    if (!selectedEmployee || !activePeriodId) return
    const empId = selectedEmployee.id
    const s = Array.from({ length: objectives.length }, (_, i) => getScore(empId, i))
    const ng = noteGlobale[empId] || Math.round(s.reduce((a, b) => a + b, 0) / (s.length || 1)) || 0

    setSaving(true)
    try {
      const objComments = Array.from({ length: objectives.length }, (_, i) => getComment(empId, i))

      // Build objectiveScores payload
      const objectiveScores = objectives.map((obj, i) => ({
        idObjectif: obj.id,
        note: s[i] || 0,
        commentaire: getComment(empId, i) || '',
      }))

      // Build objectifsAtteints from objectives that scored >= 3
      const objectifsAtteints = objectives
        .filter((_, i) => s[i] >= 3)
        .map(o => o.titre)
        .join(', ')

      // Build axesAmelioration from objectives that scored < 3
      const axesAmelioration = objectives
        .filter((_, i) => s[i] > 0 && s[i] < 3)
        .map(o => o.titre)
        .join(', ')

      await evaluationApi.create({
        idEmploye: empId,
        titre: activePeriod.libelle,
        dateEvaluation: new Date().toISOString().split('T')[0],
        noteGlobale: ng,
        commentaires: objComments.filter(c => c.trim()).join(' | '),
        objectifsAtteints: objectifsAtteints || null,
        axesAmelioration: axesAmelioration || null,
        statut: 'FINALISE',
        objectiveScores: objectiveScores,
      })

      // Add to submitted evaluations so the employee shows as evaluated
      setSubmittedEvals(prev => [...prev, {
        employee: { id: empId },
        titre: activePeriod.libelle,
        noteGlobale: ng,
      }])

      alert(`✅ Évaluation de ${selectedEmployee.name} soumise avec la note globale ${ng}/5`)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Erreur lors de la soumission"
      alert(`❌ ${msg}`)
      console.error('Failed to submit evaluation', err)
    } finally {
      setSaving(false)
    }
  }

  /* ── Close period via API */
  async function handleClosePeriod() {
    if (!activePeriodId) return
    setSaving(true)
    try {
      const updated = await evaluationPeriodApi.close(activePeriodId)
      setPeriods(prev => prev.map(p =>
        p.id === activePeriodId ? { ...p, statut: updated.statut || 'CLOTUREE' } : p
      ))
      setShowCloseConfirm(false)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la clôture'
      alert(`❌ ${msg}`)
      console.error('Failed to close period', err)
    } finally {
      setSaving(false)
    }
  }

  /* ── Check if employee is evaluated for current period */
  function isEmployeeEvaluated(empId) {
    if (!activePeriod) return false
    return submittedEvals.some(
      ev => (ev.employee?.id === empId) && (ev.titre === activePeriod.libelle)
    )
  }

  /* ── Evaluated count */
  function evaluatedCount() {
    if (!activePeriod) return 0
    return apiEmployees.filter(emp => isEmployeeEvaluated(emp.id)).length
  }

  /* ─────────────────────── RENDER ─────────────────────── */
  if (loading) {
    return (
      <AppShell header={
        <TopBar title="Évaluation de Performance" user={{ name: user?.email || 'Utilisateur', role: user?.role || 'OWNER' }} />
      }>
        <div className="eoEmptyMain">
          <div className="eoEmptyTitle">Chargement…</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell header={
      <TopBar title="Évaluation de Performance" user={{ name: user?.email || 'Utilisateur', role: user?.role || 'OWNER' }} />
    }>
      <div className="eoLayout">

        {/* ── LEFT SIDEBAR : period list ── */}
        <aside className="eoSidebar">
          <div className="eoSidebarHeader">
            <span className="eoSidebarTitle">Périodes</span>
            <button className="eoBtnIcon" id="btn-new-period" onClick={() => setShowPeriodModal(true)} title="Nouvelle période">＋</button>
          </div>

          <div className="eoPeriodList">
            {periods.map(p => (
              <button
                key={p.id}
                className={`eoPeriodItem ${activePeriodId === p.id ? 'eoPeriodItemActive' : ''}`}
                onClick={() => handleSelectPeriod(p.id)}
              >
                <div className="eoPeriodItemName">{p.libelle}</div>
                <div className="eoPeriodItemMeta">
                  <StatusBadge status={p.statut} />
                </div>
                <div className="eoPeriodItemDate">{formatDate(p.dateDebut)}</div>
              </button>
            ))}
            {periods.length === 0 && (
              <div className="eoEmpty">Aucune période.<br />Cliquez sur ＋ pour commencer.</div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="eoMain">
          {!activePeriod ? (
            <div className="eoEmptyMain">
              <div className="eoEmptyIcon">—</div>
              <div className="eoEmptyTitle">Sélectionnez ou créez une période</div>
              <div className="eoEmptyDesc">Cliquez sur une période à gauche ou créez-en une nouvelle.</div>
              <button className="eoBtnPrimary" onClick={() => setShowPeriodModal(true)}>＋ Nouvelle période</button>
            </div>
          ) : (
            <>
              {/* Period header */}
              <div className="eoPeriodHeader">
                <div>
                  <div className="eoPeriodHeaderTitle">{activePeriod.libelle}</div>
                  <div className="eoPeriodHeaderMeta">
                    <StatusBadge status={activePeriod.statut} />
                    <span className="eoPeriodHeaderSep">·</span>
                    <span className="eoPeriodHeaderDate">{formatDate(activePeriod.dateDebut)}{activePeriod.dateFin !== activePeriod.dateDebut ? ` → ${formatDate(activePeriod.dateFin)}` : ''}</span>
                    <span className="eoPeriodHeaderSep">·</span>
                    <span className="eoPeriodHeaderStat">{evaluatedCount()}/{apiEmployees.length} évalués</span>
                  </div>
                </div>
                {isActive && (
                  <button className="eoBtnDanger" id="btn-close-period" onClick={() => setShowCloseConfirm(true)} disabled={saving}>
                    Clôturer la période
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="eoTabs">
                <button className={`eoTab ${tab === 'setup' ? 'eoTabActive' : ''}`} id="tab-setup" onClick={() => setTab('setup')}>
                  Objectifs ({objectives.length})
                </button>
                <button className={`eoTab ${tab === 'evaluate' ? 'eoTabActive' : ''}`} id="tab-evaluate" onClick={() => { setTab('evaluate'); setSelectedEmployee(null) }}>
                  Évaluer les employés
                </button>
              </div>

              {/* ── TAB : SETUP (objectives) ── */}
              {tab === 'setup' && (
                <div className="eoTabContent">
                  <div className="eoObjHeader">
                    <div className="eoSectionTitle">Questions / Objectifs d'évaluation</div>
                    {isActive && (
                      <button className="eoBtnPrimary" id="btn-add-objective" onClick={() => setShowObjModal(true)} disabled={saving}>
                        ＋ Ajouter un objectif
                      </button>
                    )}
                  </div>

                  {objectives.length === 0 ? (
                    <div className="eoObjEmpty">
                      <div>Aucun objectif défini pour cette période.</div>
                      {isActive && <button className="eoBtnPrimary" style={{ marginTop: 12 }} onClick={() => setShowObjModal(true)}>＋ Ajouter le premier objectif</button>}
                    </div>
                  ) : (
                    <div className="eoObjGrid">
                      {objectives.map((obj, idx) => (
                        <div key={obj.id} className="eoObjCard">
                          <div className="eoObjCardNum">{idx + 1}</div>
                          <div className="eoObjCardBody">
                            <div className="eoObjCardTitle">{obj.titre}</div>
                            {obj.descriptionDetail && <div className="eoObjCardDesc">{obj.descriptionDetail}</div>}
                          </div>
                          {isActive && (
                            <button className="eoObjCardDelete" onClick={() => handleDeleteObjective(obj.id)} title="Supprimer" aria-label="Supprimer l'objectif" disabled={saving}>✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!isActive && (
                    <div className="eoClosedNote">Cette période est clôturée — les objectifs ne peuvent plus être modifiés.</div>
                  )}
                </div>
              )}

              {/* ── TAB : EVALUATE ── */}
              {tab === 'evaluate' && (
                <div className="eoTabContent">
                  {objectives.length === 0 ? (
                    <div className="eoObjEmpty">
                      Définissez d'abord des objectifs dans l'onglet "Objectifs" avant d'évaluer.
                      <button className="eoBtnSecondary" style={{ marginTop: 12 }} onClick={() => setTab('setup')}>→ Aller aux objectifs</button>
                    </div>
                  ) : (
                    <div className="eoEvalLayout">
                      {/* Employee list */}
                      <div className="eoEmpList">
                        <div className="eoSectionTitle" style={{ marginBottom: 12 }}>Employés</div>
                        {apiEmployees.map(emp => {
                          const evaluated = isEmployeeEvaluated(emp.id)
                          return (
                            <button
                              key={emp.id}
                              id={`btn-emp-${emp.id}`}
                              className={`eoEmpCard ${selectedEmployee?.id === emp.id ? 'eoEmpCardActive' : ''}`}
                              onClick={() => setSelectedEmployee(emp)}
                            >
                              <div className="eoEmpAvatar">
                                {emp.photoProfil ? (
                                  <img src={getPhotoUrl(emp.photoProfil)} alt={emp.name} className="eoEmpAvatarImg" />
                                ) : (
                                  emp.initials
                                )}
                              </div>
                              <div className="eoEmpInfo">
                                <div className="eoEmpName">{emp.name}</div>
                                <div className="eoEmpPoste">{emp.poste}</div>
                              </div>
                              {evaluated && <span className="eoEmpDone" title="Évaluation soumise">✓</span>}
                            </button>
                          )
                        })}
                      </div>

                      {/* Score form */}
                      <div className="eoScorePanel">
                        {!selectedEmployee ? (
                          <div className="eoScorePlaceholder">
                            <div className="eoScorePlaceholderIcon" />
                            <div>Sélectionnez un employé pour l'évaluer</div>
                          </div>
                        ) : (
                          <>
                            <div className="eoScoreHeader">
                              <div className="eoEmpAvatar eoEmpAvatarLg">
                                {selectedEmployee.photoProfil ? (
                                  <img src={getPhotoUrl(selectedEmployee.photoProfil)} alt={selectedEmployee.name} className="eoEmpAvatarImg" />
                                ) : (
                                  selectedEmployee.initials
                                )}
                              </div>
                              <div>
                                <div className="eoScoreEmpName">{selectedEmployee.name}</div>
                                <div className="eoScoreEmpPoste">{selectedEmployee.poste} · {selectedEmployee.departement}</div>
                              </div>
                            </div>

                            <div className="eoObjectivesList">
                              {objectives.map((obj, i) => (
                                <div key={obj.id} className="eoObjRow">
                                  <div className="eoObjRowHead">
                                    <div>
                                      <div className="eoObjRowTitle">{obj.titre}</div>
                                      {obj.descriptionDetail && <div className="eoObjRowDesc">{obj.descriptionDetail}</div>}
                                    </div>
                                    <RatingDots
                                      value={getScore(selectedEmployee.id, i)}
                                      onChange={(v) => setScore(selectedEmployee.id, i, v)}
                                      readonly={!isActive}
                                    />
                                  </div>
                                  <textarea
                                    className="eoObjRowComment"
                                    placeholder={`Commentaires sur "${obj.titre}"…`}
                                    value={getComment(selectedEmployee.id, i)}
                                    onChange={e => setComment(selectedEmployee.id, i, e.target.value)}
                                    disabled={!isActive}
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="eoGlobalScore">
                              <div>
                                <div className="eoGlobalLabel">NOTE GLOBALE (manuelle)</div>
                                <RatingDots
                                  value={getNoteGlobale(selectedEmployee.id)}
                                  size={24}
                                  onChange={(v) => setNoteGlobale(prev => ({
                                    ...prev,
                                    [selectedEmployee.id]: v
                                  }))}
                                  readonly={!isActive}
                                />
                              </div>
                              {isActive && (
                                <button
                                  className="eoBtnPrimary"
                                  id={`btn-submit-eval-${selectedEmployee.id}`}
                                  onClick={handleSubmitEval}
                                  disabled={saving}
                                >
                                  {saving ? '…' : '▷'} Soumettre l'évaluation
                                </button>
                              )}
                            </div>

                            {!isActive && (
                              <div className="eoClosedNote">Période clôturée — lecture seule.</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── MODAL: Create Period ── */}
      {showPeriodModal && (
        <div className="eoOverlay" onClick={() => setShowPeriodModal(false)}>
          <div className="eoModal" onClick={e => e.stopPropagation()}>
            <div className="eoModalHeader">
              <div className="eoModalTitle">Nouvelle période d'évaluation</div>
              <button className="eoModalClose" onClick={() => setShowPeriodModal(false)}>✕</button>
            </div>
            <div className="eoModalBody">
              <label className="eoLabel">Libellé de la période *</label>
              <input
                id="input-period-label"
                className="eoInput"
                placeholder="ex: Évaluation Annuelle 2026"
                value={newPeriod.libelle}
                onChange={e => setNewPeriod(p => ({ ...p, libelle: e.target.value }))}
                autoFocus
              />
              <label className="eoLabel">Date de début *</label>
              <input
                id="input-period-start-date"
                type="date"
                className="eoInput"
                value={newPeriod.dateDebut}
                onChange={e => setNewPeriod(p => ({ ...p, dateDebut: e.target.value }))}
              />
              <label className="eoLabel">Date de fin *</label>
              <input
                id="input-period-end-date"
                type="date"
                className="eoInput"
                value={newPeriod.dateFin}
                onChange={e => setNewPeriod(p => ({ ...p, dateFin: e.target.value }))}
              />
            </div>
            <div className="eoModalFooter">
              <button className="eoBtnSecondary" onClick={() => setShowPeriodModal(false)}>Annuler</button>
              <button
                id="btn-confirm-period"
                className="eoBtnPrimary"
                onClick={handleCreatePeriod}
                disabled={!newPeriod.libelle.trim() || !newPeriod.dateDebut || saving}
              >
                {saving ? 'Création…' : 'Créer la période'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Add Objective ── */}
      {showObjModal && (
        <div className="eoOverlay" onClick={() => setShowObjModal(false)}>
          <div className="eoModal" onClick={e => e.stopPropagation()}>
            <div className="eoModalHeader">
              <div className="eoModalTitle">Ajouter un objectif</div>
              <button className="eoModalClose" onClick={() => setShowObjModal(false)}>✕</button>
            </div>
            <div className="eoModalBody">
              <label className="eoLabel">Titre / Question *</label>
              <input
                id="input-obj-title"
                className="eoInput"
                placeholder="ex: Qualité du code produit"
                value={newObj.titre}
                onChange={e => setNewObj(o => ({ ...o, titre: e.target.value }))}
                autoFocus
              />
              <label className="eoLabel">Description (optionnel)</label>
              <textarea
                id="input-obj-desc"
                className="eoInput eoTextarea"
                placeholder="Précisez les critères d'évaluation de cet objectif…"
                value={newObj.description}
                onChange={e => setNewObj(o => ({ ...o, description: e.target.value }))}
              />
            </div>
            <div className="eoModalFooter">
              <button className="eoBtnSecondary" onClick={() => setShowObjModal(false)}>Annuler</button>
              <button
                id="btn-confirm-objective"
                className="eoBtnPrimary"
                onClick={handleAddObjective}
                disabled={!newObj.titre.trim() || saving}
              >
                {saving ? 'Ajout…' : "Ajouter l'objectif"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Confirm Close Period ── */}
      {showCloseConfirm && (
        <div className="eoOverlay" onClick={() => setShowCloseConfirm(false)}>
          <div className="eoModal eoModalSm" onClick={e => e.stopPropagation()}>
            <div className="eoModalHeader">
              <div className="eoModalTitle">Clôturer la période ?</div>
              <button className="eoModalClose" onClick={() => setShowCloseConfirm(false)}>✕</button>
            </div>
            <div className="eoModalBody">
              <p className="eoModalWarning">
                Cette action est <strong>irréversible</strong>. La période <strong>"{activePeriod?.libelle}"</strong> sera clôturée et plus aucune évaluation ne pourra être modifiée.
              </p>
            </div>
            <div className="eoModalFooter">
              <button className="eoBtnSecondary" onClick={() => setShowCloseConfirm(false)}>Annuler</button>
              <button id="btn-confirm-close" className="eoBtnDanger" onClick={handleClosePeriod} disabled={saving}>
                {saving ? 'Clôture…' : 'Confirmer la clôture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
