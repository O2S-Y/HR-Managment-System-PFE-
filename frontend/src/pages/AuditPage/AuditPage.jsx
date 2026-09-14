import './auditPage.css'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useState, useEffect } from 'react'
import { auditApi } from '../../services/authApi'

// Format action label helper to make it readable in French
const getActionLabel = (act) => {
  if (!act) return ''
  const clean = act.toUpperCase().replace(/[\s_-]/g, '')
  const map = {
    CREATE: 'Création',
    UPDATE: 'Modification',
    DELETE: 'Suppression',
    APPROVE: 'Approbation',
    REFUSE: 'Refus',
    ASSIGN: 'Affectation',
    RETURN: 'Restitution',
    SUBMIT: 'Soumission',
    CANCEL: 'Annulation',
    CREATEEMPLOYEE: 'Création d\'un collaborateur',
    UPDATEEMPLOYEE: 'Mise à jour d\'un collaborateur',
    ARCHIVEEMPLOYEE: 'Archivage d\'un collaborateur',
    UNARCHIVEEMPLOYEE: 'Désarchivage d\'un collaborateur',
    SUBMITLEAVE: 'Soumission d\'une demande de congé',
    APPROVELEAVE: 'Approbation d\'une demande de congé',
    REFUSELEAVE: 'Refus d\'une demande de congé',
    CREATEASSET: 'Ajout de matériel à l\'inventaire',
    ASSIGNASSET: 'Affectation d\'un actif IT',
    RETURNASSET: 'Restitution d\'un actif IT',
    SUBMITPROFILECHANGE: 'Soumission de modif. de profil',
    APPROVEPROFILECHANGE: 'Approbation de modif. de profil',
    REJECTPROFILECHANGE: 'Rejet de modif. de profil',
    CREATEPAYROLL: 'Génération d\'un brouillon de paie',
    VALIDATEPAYROLL: 'Validation d\'une fiche de paie'
  }
  return map[clean] || act
}

// Format target entity type helper to make it readable in French
const getEntityTypeLabel = (type) => {
  if (!type) return ''
  const clean = type.toUpperCase().replace(/[\s_-]/g, '')
  const map = {
    EMPLOYEE: 'Employé',
    LEAVE: 'Congé',
    LEAVEREQUEST: 'Demande de congé',
    ASSET: 'Actif IT',
    PAYROLL: 'Paie',
    USER: 'Utilisateur',
    AUDIT: 'Audit',
    PROFILECHANGE: 'Modification de profil',
    PROFILECHANGEREQUEST: 'Modification de profil',
    NOTIFICATION: 'Notification'
  }
  return map[clean] || type
}

export function AuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchActor, setSearchActor] = useState('')
  const [searchAction, setSearchAction] = useState('')
  const [searchEntity, setSearchEntity] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    auditApi.getAll()
      .then((data) => setLogs(data ?? []))
      .catch((err) => console.error('Failed to fetch audit logs', err))
      .finally(() => setLoading(false))
  }, [])

  // Filter logs based on inputs
  const filteredLogs = logs.filter((log) => {
    const actorEmail = log.acteur?.courriel || ''
    const action = log.action || ''
    const entityType = log.typeEntite || ''
    const entityTypeLabel = getEntityTypeLabel(log.typeEntite) || ''
    const actionLabel = getActionLabel(log.action) || ''

    return (
      actorEmail.toLowerCase().includes(searchActor.toLowerCase()) &&
      (action.toLowerCase().includes(searchAction.toLowerCase()) || actionLabel.toLowerCase().includes(searchAction.toLowerCase())) &&
      (entityType.toLowerCase().includes(searchEntity.toLowerCase()) || entityTypeLabel.toLowerCase().includes(searchEntity.toLowerCase()))
    )
  })

  // Format date-time helper
  const formatDateTime = (dtStr) => {
    if (!dtStr) return '—'
    try {
      const date = new Date(dtStr)
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return dtStr
    }
  }

  // Format JSON values for modal display
  const formatJson = (jsonStr) => {
    if (!jsonStr) return '—'
    try {
      const parsed = JSON.parse(jsonStr)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return jsonStr
    }
  }

  return (
    <AppShell header={<TopBar title="Journal d'Audit Système" />}>
      <div className="audMain">
        
        {/* Filters */}
        <section className="audFilters" aria-label="Filtres du journal">
          <input
            type="text"
            className="audInput"
            placeholder="Filtrer par acteur (courriel)…"
            value={searchActor}
            onChange={(e) => setSearchActor(e.target.value)}
          />
          <input
            type="text"
            className="audInput"
            placeholder="Filtrer par action…"
            value={searchAction}
            onChange={(e) => setSearchAction(e.target.value)}
          />
          <input
            type="text"
            className="audInput"
            placeholder="Filtrer par type d'entité…"
            value={searchEntity}
            onChange={(e) => setSearchEntity(e.target.value)}
          />
        </section>

        {/* Audit Logs Table */}
        <section className="audTableWrap" aria-label="Journal des actions">
          <table className="audTable">
            <thead>
              <tr>
                <th>Date &amp; Heure</th>
                <th>Acteur</th>
                <th>Action</th>
                <th>Entité Cible</th>
                <th>ID Cible</th>
                <th className="audThRight">Détails</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="audEmpty">Chargement…</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="6" className="audEmpty">Aucune action enregistrée ne correspond à vos filtres.</td></tr>
              ) : (
                filteredLogs.map((log) => {
                  const actorMail = log.acteur?.courriel || 'Système / Anonyme'
                  return (
                    <tr key={log.id}>
                      <td className="audTdMono">{formatDateTime(log.dateCreation)}</td>
                      <td className="audTdStrong">{actorMail}</td>
                      <td>
                        <span className="audActionBadge">{getActionLabel(log.action)}</span>
                      </td>
                      <td className="audTdMono">{getEntityTypeLabel(log.typeEntite)}</td>
                      <td className="audTdMono">{log.idEntite || '—'}</td>
                      <td className="audThRight">
                        <button
                          type="button"
                          className="audDetailBtn"
                          onClick={() => setSelectedLog(log)}
                        >
                          Visualiser
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </section>

        {/* Details Modal */}
        {selectedLog && (
          <div className="audModalOverlay" onClick={() => setSelectedLog(null)}>
            <div className="audModal" onClick={(e) => e.stopPropagation()}>
              <div className="audModalHeader">
                <h3>Détails de l'Action #{selectedLog.id}</h3>
                <button
                  type="button"
                  className="audCloseBtn"
                  onClick={() => setSelectedLog(null)}
                >
                  &times;
                </button>
              </div>

              <div className="audModalContent">
                <div className="audDetailInfo">
                  <div><strong>Acteur:</strong> {selectedLog.acteur?.courriel || 'Système'}</div>
                  <div><strong>Action:</strong> {getActionLabel(selectedLog.action)} ({selectedLog.action})</div>
                  <div><strong>Date:</strong> {formatDateTime(selectedLog.dateCreation)}</div>
                  <div><strong>Entité Cible:</strong> {getEntityTypeLabel(selectedLog.typeEntite)} (ID: {selectedLog.idEntite || '—'})</div>
                </div>

                <div className="audDiffContainer">
                  <div className="audDiffPanel">
                    <h4>Ancien État</h4>
                    <pre className="audJsonBlock">
                      {formatJson(selectedLog.ancienneValeurJson)}
                    </pre>
                  </div>
                  <div className="audDiffPanel">
                    <h4>Nouvel État</h4>
                    <pre className="audJsonBlock">
                      {formatJson(selectedLog.nouvelleValeurJson)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
