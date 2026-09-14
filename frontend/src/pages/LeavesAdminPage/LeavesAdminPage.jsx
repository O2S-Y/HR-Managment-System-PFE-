import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { CreateLeaveTypeModal } from './CreateLeaveTypeModal'
import { leaveAdminApi, employeeApi, leaveApi } from '../../services/authApi'
import './leavesAdminPage.css'
import '../LeavesEmployeePage/leavesEmployeePage.css'

const CATEGORIE_LABELS = {
  ANNUEL: 'Congé annuel',
  MALADIE: 'Maladie',
  MATERNITE: 'Maternité',
  PATERNITE: 'Paternité',
  SANS_SOLDE: 'Sans solde',
  AUTRE: 'Autre',
}

function IconPaperPlane(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M2 21 23 12 2 3v7l15 2-15 2v7Z" />
    </svg>
  )
}

export function LeavesAdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [localLeaveTypes, setLocalLeaveTypes] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false)

  // Edit leave type (by id)
  const [editingTypeId, setEditingTypeId] = useState(null)
  const [editQuota, setEditQuota] = useState('')
  const [editActif, setEditActif] = useState(true)

  // Submit leave request form state
  const [typeId, setTypeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [comment, setComment] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      leaveAdminApi.getTypes(),
      employeeApi.getMe(),
      leaveApi.getMyLeaves(),
    ])
      .then(([types, profileData, leavesData]) => {
        setLocalLeaveTypes(types || [])
        setProfile(profileData)
        setMyRequests(leavesData || [])
        if (types && types.length > 0) {
          setTypeId(String(types[0].id))
        }
      })
      .catch(err => console.error('Error loading leave admin data', err))
      .finally(() => setLoading(false))
  }, [])

  const handleEditType = (lt) => {
    setEditingTypeId(lt.id)
    setEditQuota(String(lt.quotaAnnuelJours ?? 0))
    setEditActif(!!lt.actif)
  }

  const handleSaveEdit = async () => {
    try {
      const updated = await leaveAdminApi.updateType({
        id: editingTypeId,
        quotaAnnuelJours: Number(editQuota),
        actif: editActif,
      })
      setLocalLeaveTypes(prev => prev.map(lt => (lt.id === editingTypeId ? updated : lt)))
      setEditingTypeId(null)
    } catch (err) {
      console.error('Failed to update leave type', err)
    }
  }

  const handleCancelEdit = () => setEditingTypeId(null)

  const handleCreateType = async (newType) => {
    try {
      const added = await leaveAdminApi.addType(newType)
      setLocalLeaveTypes([added, ...localLeaveTypes])
    } catch (err) {
      console.error(err)
    }
  }

  const selectedType = localLeaveTypes.find((t) => String(t.id) === String(typeId)) || null

  const joursAcquis = profile?.leaveAcquired ?? 0
  const joursPris = profile?.leaveUsed ?? 0
  const joursRestants = profile?.leaveRemaining ?? 0

  let duration = 0
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      const diffTime = Math.abs(end - start)
      duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    }
  }

  const handleSubmitRequest = async (e) => {
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
      if (localLeaveTypes.length > 0) setTypeId(String(localLeaveTypes[0].id))

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
        <TopBar
          title="Configuration Congés"
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }}
          right={
            <button
              className="submitBtn"
              type="button"
              onClick={() => navigate('/leaves/owner')}
              style={{ height: '36px', display: 'inline-flex', alignItems: 'center', background: 'var(--brand-navy)' }}
            >
              ← Retour aux demandes
            </button>
          }
        />
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#8a9bb0' }}>Chargement...</div>
      ) : (
      <div className="laPage">
        {/* RH's Own Leave Balance KPIs */}
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

        {/* RH Leave Request Submission Form & Own Requests List */}
        <div className="laGridContainer" style={{ marginBottom: '2rem' }}>
          <section className="card" aria-label="Nouvelle demande">
            <h2 className="cardTitle">Nouvelle demande</h2>

            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="field">
                <div className="label">TYPE DE CONGÉ</div>
                <select className="select" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
                  {localLeaveTypes.length === 0 && <option value="">Aucun type disponible</option>}
                  {localLeaveTypes.map((t) => (
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
              <div className="field">
                <div className="label">MOTIF</div>
                <textarea className="textarea" placeholder="Indiquez le motif..." value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>

              <div className="cardFooter">
                <div className="duration">
                  Durée : {duration > 0 ? `${duration} jour${duration > 1 ? 's' : ''}` : '-'}
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
                {myRequests.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: '#8a9bb0' }}>Aucune demande</td></tr>
                ) : (
                  myRequests.map((r, idx) => (
                    <tr key={r.id ?? idx}>
                      <td className="strong">{r.typeConge?.nom ?? '—'}</td>
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
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>

        {/* Existing: Types de congés & quotas */}
        <section className="laSection">
          <div className="laSectionHead">
            <div className="laSectionTitle">TYPES DE CONGÉS & QUOTAS</div>
            <button className="laAddBtn" type="button" onClick={() => setIsCreateTypeModalOpen(true)}>+ Ajouter un type</button>
          </div>
          <table className="laTable">
            <thead>
              <tr>
                <th>TYPE</th>
                <th>CATÉGORIE</th>
                <th>QUOTA (jours/an)</th>
                <th>STATUT</th>
                <th className="thRight">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {localLeaveTypes.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center', color:'#8a9bb0', padding: '1rem'}}>Aucun type configuré</td></tr>
              ) : (
                localLeaveTypes.map((lt) => (
                  <tr key={lt.id}>
                    <td className="strong">{lt.nom}</td>
                    <td>{CATEGORIE_LABELS[lt.categorie] || lt.categorie}</td>
                    <td>
                      {editingTypeId === lt.id ? (
                        <input className="laInlineInput" type="number" min="0" value={editQuota} onChange={e => setEditQuota(e.target.value)} />
                      ) : lt.quotaAnnuelJours}
                    </td>
                    <td>
                      {editingTypeId === lt.id ? (
                        <select className="laInlineInput" value={editActif ? 'true' : 'false'} onChange={e => setEditActif(e.target.value === 'true')}>
                          <option value="true">Actif</option>
                          <option value="false">Inactif</option>
                        </select>
                      ) : (
                        <span className="laBadge">{lt.actif ? 'Actif' : 'Inactif'}</span>
                      )}
                    </td>
                    <td className="tdRight">
                      {editingTypeId === lt.id ? (
                        <>
                          <button className="laEditBtn laSaveBtn" type="button" onClick={handleSaveEdit}>Enregistrer</button>
                          <button className="laEditBtn" type="button" onClick={handleCancelEdit}>Annuler</button>
                        </>
                      ) : (
                        <button className="laEditBtn" type="button" onClick={() => handleEditType(lt)}>Modifier</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
      )}

      <CreateLeaveTypeModal
        open={isCreateTypeModalOpen}
        onClose={() => setIsCreateTypeModalOpen(false)}
        onCreate={handleCreateType}
      />
    </AppShell>
  )
}
