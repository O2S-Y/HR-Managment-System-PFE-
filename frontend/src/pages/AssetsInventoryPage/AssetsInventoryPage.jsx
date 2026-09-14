import { Fragment, useState, useRef, useEffect } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { CreateAssetModal } from './CreateAssetModal'
import { assetApi, employeeApi } from '../../services/authApi'
import './assetsInventoryPage.css'

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M10 2a8 8 0 1 0 5.293 14.293l4.207 4.207 1.414-1.414-4.207-4.207A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"
      />
    </svg>
  )
}

function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" />
    </svg>
  )
}

const tabs = ['VUE D’ENSEMBLE', 'INVENTAIRE', 'MAINTENANCE']
const chips = ['TOUS', 'DISPONIBLE', 'AFFECTÉ', 'EN MAINTENANCE']

export function AssetsInventoryPage() {
  const { user } = useAuth()
  const isRH = user?.role === 'RH'
  const isEmployee = user?.role === 'EMPLOYE'

  const [localAssets, setLocalAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeChip, setActiveChip] = useState('TOUS')
  const [expandedRows, setExpandedRows] = useState([])
  const [histories, setHistories] = useState({})
  const [openMenu, setOpenMenu] = useState(null)
  const menuRef = useRef(null)

  // Asset action modals
  const [assignModal, setAssignModal] = useState(null) // asset object or null
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [assignDate, setAssignDate] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null) // asset serial or null
  const [editModal, setEditModal] = useState(null) // asset object or null
  const [editName, setEditName] = useState('')
  const [editStatus, setEditStatus] = useState('')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch assets and employees from backend
  useEffect(() => {
    Promise.all([assetApi.getAll(), employeeApi.getAll()])
      .then(([assetsData, employeesData]) => {
        setEmployees(employeesData || [])
        const mapped = (assetsData ?? []).map(a => ({
          ...a,
          name: a.nom || a.name || '—',
          serial: a.reference || a.numeroSerie || a.serial || '—',
          type: a.categorie || a.type || '—',
          assignedTo: a.employeeAssigne?.nomComplet || 'Non affecté',
          status: (a.statut === 'AFFECTE' || a.statut === 'ASSIGNE') ? 'Affecté' : a.statut === 'EN_MAINTENANCE' ? 'En maintenance' : a.statut === 'HORS_SERVICE' ? 'Hors service' : 'Disponible',
          tone: (a.statut === 'AFFECTE' || a.statut === 'ASSIGNE') ? 'blue' : a.statut === 'EN_MAINTENANCE' ? 'orange' : a.statut === 'HORS_SERVICE' ? 'red' : 'green',
        }))
        setLocalAssets(mapped)
      })
      .catch((err) => console.error('Failed to load assets or employees', err))
      .finally(() => setLoading(false))
  }, [])

  const toggleExpand = async (asset) => {
    const isExpanding = !expandedRows.includes(asset.serial)
    setExpandedRows(prev =>
      prev.includes(asset.serial) ? prev.filter(s => s !== asset.serial) : [...prev, asset.serial]
    )

    if (isExpanding && !histories[asset.id]) {
      try {
        const historyData = await assetApi.getHistory(asset.id)
        setHistories(prev => ({
          ...prev,
          [asset.id]: historyData || []
        }))
      } catch (err) {
        console.error('Failed to load asset history', err)
      }
    }
  }

  const handleAssign = async () => {
    if (!selectedEmployeeId || !assignDate) return
    try {
      await assetApi.assign(assignModal.id, {
        idEmploye: Number(selectedEmployeeId),
        dateAffectation: assignDate,
      })
      const selectedEmp = employees.find(e => e.id === Number(selectedEmployeeId))
      const empName = selectedEmp ? selectedEmp.nomComplet : 'Affecté'
      
      setLocalAssets(prev => prev.map(a =>
        a.id === assignModal.id
          ? { ...a, assignedTo: empName, status: 'Affecté', tone: 'blue' }
          : a
      ))

      setHistories(prev => {
        const next = { ...prev }
        delete next[assignModal.id]
        return next
      })
    } catch (err) {
      console.error('Failed to assign asset', err)
    }
    setAssignModal(null)
    setSelectedEmployeeId('')
    setAssignDate('')
  }

  const handleUnassign = async (asset) => {
    try {
      await assetApi.returnAsset(asset.id, 'BON')
      setLocalAssets(prev => prev.map(a =>
        a.id === asset.id
          ? { ...a, assignedTo: 'Non affecté', status: 'Disponible', tone: 'green' }
          : a
      ))

      setHistories(prev => {
        const next = { ...prev }
        delete next[asset.id]
        return next
      })
    } catch (err) {
      console.error('Failed to unassign asset', err)
    }
    setOpenMenu(null)
  }

  const handleDelete = () => {
    setLocalAssets(prev => prev.filter(a => a.serial !== deleteConfirm))
    setDeleteConfirm(null)
  }

  const handleEditSubmit = () => {
    if (!editName.trim()) return
    const statusMap = { 'DISPONIBLE': { status: 'Disponible', tone: 'green' }, 'EN_MAINTENANCE': { status: 'En maintenance', tone: 'orange' }, 'HORS_SERVICE': { status: 'Hors service', tone: 'red' } }
    const mapped = statusMap[editStatus] || {}
    setLocalAssets(prev => prev.map(a =>
      a.serial === editModal.serial
        ? { ...a, name: editName.trim(), ...(a.status !== 'Affecté' ? mapped : {}) }
        : a
    ))
    setEditModal(null)
  }

  // UC: Employee only sees their own assigned/affected assets
  const displayAssets = localAssets.filter(a => {
    if (isEmployee && a.status !== 'Affecté') return false
    if (activeChip === 'TOUS') return true
    if (activeChip === 'DISPONIBLE' && a.status !== 'Disponible') return false
    if (activeChip === 'AFFECTÉ' && a.status !== 'Affecté') return false
    if (activeChip === 'EN MAINTENANCE' && a.status !== 'En maintenance') return false
    return true
  })

  return (
    <AppShell
      header={
        <TopBar
          title="Inventaire IT"
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }}
        />
      }
    >
      <div className="aiPage">
        <div className="aiToolbar" aria-label="Barre d’actions">
          <div className="aiSearchWrap">
            <IconSearch className="aiSearchIcon" />
            <input className="aiSearchInput" placeholder="Rechercher un actif..." />
          </div>
          {isRH && (
            <button className="aiAddBtn" type="button" onClick={() => setIsCreateModalOpen(true)}>
              <IconPlus />
              Ajouter un actif
            </button>
          )}
        </div>

        <div className="aiChips">
          {chips.map((c) => (
            <button
              key={c}
              className={c === activeChip ? 'aiChip aiChipActive' : 'aiChip'}
              type="button"
              onClick={() => setActiveChip(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <section className="aiTableCard">
          <table className="aiTable">
            <thead>
              <tr>
                <th>NOM DE L’ACTIF</th>
                <th>TYPE</th>
                <th>NUMÉRO DE SÉRIE</th>
                <th>AFFECTÉ À</th>
                <th>STATUT</th>
                {isRH && <th className="thRight">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {displayAssets.map((a) => (
                <Fragment key={a.serial}>
                  <tr
                    onClick={() => toggleExpand(a)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="strong">{a.name}</td>
                    <td>{a.type}</td>
                    <td className="mono">{a.serial}</td>
                    <td className="assignedCell">
                      <span className="miniAvatar" aria-hidden="true" />
                      {a.assignedTo}
                    </td>
                    <td>
                      <span className={`status ${a.tone}`}>{a.status}</span>
                    </td>
                    {isRH && (
                      <td className="tdRight" onClick={(e) => e.stopPropagation()}>
                        <div className="aiActionWrap" ref={openMenu === a.serial ? menuRef : undefined}>
                          <button className="aiActionBtn" type="button" onClick={() => setOpenMenu(openMenu === a.serial ? null : a.serial)}>
                            ⋮
                          </button>
                          {openMenu === a.serial && (
                            <div className="aiDropdown">
                              {a.status !== 'Affecté' ? (
                                <button className="aiDropItem" onClick={() => { setAssignModal(a); setOpenMenu(null); }}>
                                  Affecter
                                </button>
                              ) : (
                                <button className="aiDropItem" onClick={() => handleUnassign(a)}>
                                  Désaffecter
                                </button>
                              )}
                              <button className="aiDropItem" onClick={() => {
                                  setEditModal(a)
                                  setEditName(a.name)
                                  setEditStatus(a.status === 'Disponible' ? 'DISPONIBLE' : a.status === 'En maintenance' ? 'EN_MAINTENANCE' : 'HORS_SERVICE')
                                  setOpenMenu(null)
                                }}>
                                Modifier
                              </button>
                              <button className="aiDropItem aiDropDanger" onClick={() => { setDeleteConfirm(a.serial); setOpenMenu(null); }}>
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  {expandedRows.includes(a.serial) ? (
                    <tr className="expandRow">
                      <td colSpan={6}>
                        <div className="expandBox">
                          <div className="expandTitle">HISTORIQUE D’AFFECTATION</div>
                          <div className="timeline">
                            {!histories[a.id] ? (
                              <div className="tNoData">Chargement de l'historique...</div>
                            ) : histories[a.id].length === 0 ? (
                              <div className="tNoData">Aucun historique d'affectation</div>
                            ) : (
                              histories[a.id].map((h, idx) => (
                                <div className="tRow" key={h.id}>
                                  <span className={`tDot ${idx === 0 ? 'tDotOn' : ''}`} />
                                  <div className="tMeta">
                                    <div className="tTitle">
                                      {h.dateRetourEffective ? (
                                        <>
                                          Restitué par <strong>{h.employee?.nomComplet || '—'}</strong> (Retourné le {h.dateRetourEffective} en état {h.etatRetour || '—'})
                                        </>
                                      ) : (
                                        <>
                                          Actuellement affecté à <strong>{h.employee?.nomComplet || '—'}</strong> (Depuis le {h.dateAffectation} en état {h.etatSortie || '—'})
                                        </>
                                      )}
                                    </div>
                                    <div className="tSub">
                                      {h.dateRetourEffective ? `Affecté initialement du ${h.dateAffectation} au ${h.dateRetourEffective}` : `Affectation en cours`}
                                      {h.commentaire && ` — Commentaire: "${h.commentaire}"`}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <CreateAssetModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={async (newAsset) => {
          try {
            const created = await assetApi.create(newAsset._domain)
            const mapped = {
              ...newAsset,
              id: created.id,
              serial: created.reference || newAsset.serial,
              name: created.nom || newAsset.name,
              status: (created.statut === 'AFFECTE' || created.statut === 'ASSIGNE') ? 'Affecté' : created.statut === 'EN_MAINTENANCE' ? 'En maintenance' : created.statut === 'HORS_SERVICE' ? 'Hors service' : 'Disponible',
              tone: (created.statut === 'AFFECTE' || created.statut === 'ASSIGNE') ? 'blue' : created.statut === 'EN_MAINTENANCE' ? 'orange' : created.statut === 'HORS_SERVICE' ? 'red' : 'green',
            }
            setLocalAssets(prev => [mapped, ...prev])
          } catch (err) {
            console.error('Failed to create asset', err)
            setLocalAssets(prev => [newAsset, ...prev])
          }
        }}
      />

      {/* Modal: Affecter l'actif */}
      {assignModal && (
        <div className="aiOverlay" onClick={() => setAssignModal(null)}>
          <div className="aiModal" onClick={e => e.stopPropagation()}>
            <div className="aiModalHeader">
              <div className="aiModalTitle">Affecter l'actif</div>
              <button className="aiModalClose" type="button" onClick={() => setAssignModal(null)}>✕</button>
            </div>
            <div className="aiModalBody">
              <div className="aiModalAsset">{assignModal.name}</div>
              <label className="aiFieldGroup">
                <span className="aiLabel">Employé</span>
                <select 
                  className="aiInput" 
                  value={selectedEmployeeId} 
                  onChange={e => setSelectedEmployeeId(e.target.value)} 
                  autoFocus
                >
                  <option value="">-- Sélectionner un employé --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nomComplet} ({emp.departement})
                    </option>
                  ))}
                </select>
              </label>
              <label className="aiFieldGroup">
                <span className="aiLabel">Date d'affectation</span>
                <input className="aiInput" type="date" value={assignDate} onChange={e => setAssignDate(e.target.value)} />
              </label>
            </div>
            <div className="aiModalFooter">
              <button className="aiBtnSecondary" onClick={() => setAssignModal(null)}>Annuler</button>
              <button className="aiBtnPrimary" onClick={handleAssign} disabled={!selectedEmployeeId || !assignDate}>Affecter</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Modifier l'actif */}
      {editModal && (
        <div className="aiOverlay" onClick={() => setEditModal(null)}>
          <div className="aiModal" onClick={e => e.stopPropagation()}>
            <div className="aiModalHeader">
              <div className="aiModalTitle">Modifier l'actif</div>
              <button className="aiModalClose" type="button" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="aiModalBody">
              <label className="aiFieldGroup">
                <span className="aiLabel">Nom</span>
                <input className="aiInput" value={editName} onChange={e => setEditName(e.target.value)} />
              </label>
              {editModal.status !== 'Affecté' && (
                <label className="aiFieldGroup">
                  <span className="aiLabel">Statut</span>
                  <select className="aiInput" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="EN_MAINTENANCE">En maintenance</option>
                    <option value="HORS_SERVICE">Hors service</option>
                  </select>
                </label>
              )}
            </div>
            <div className="aiModalFooter">
              <button className="aiBtnSecondary" onClick={() => setEditModal(null)}>Annuler</button>
              <button className="aiBtnPrimary" onClick={handleEditSubmit}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirm */}
      {deleteConfirm && (
        <div className="aiOverlay" onClick={() => setDeleteConfirm(null)}>
          <div className="aiModal aiModalSm" onClick={e => e.stopPropagation()}>
            <div className="aiModalHeader">
              <div className="aiModalTitle">Supprimer l'actif ?</div>
              <button className="aiModalClose" type="button" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="aiModalBody">
              <p className="aiWarning">Cette action est <strong>irréversible</strong>. L'actif sera définitivement supprimé de l'inventaire.</p>
            </div>
            <div className="aiModalFooter">
              <button className="aiBtnSecondary" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="aiBtnDanger" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
