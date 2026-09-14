import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { CreateEmployeeModal } from './CreateEmployeeModal'
import { useAuth } from '../../contexts/AuthContext'
import { employeeApi, profileChangeApi } from '../../services/authApi'
import { getPhotoUrl } from '../../services/http'
import './employeesListPage.css'

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

function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 5c-5 0-9 5-9 7s4 7 9 7 9-5 9-7-4-7-9-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
      />
    </svg>
  )
}

function IconEdit(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-1.34-1.34a1 1 0 0 0-1.41 0l-1.13 1.13 3.75 3.75L21 5.75Z"
      />
    </svg>
  )
}

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return '—'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const PAGE_SIZE = 5

export function EmployeesListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isRH = user?.role === 'RH'
  const [createOpen, setCreateOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pendingChanges, setPendingChanges] = useState([])
  const [loadingChanges, setLoadingChanges] = useState(false)

  // Fetch employees from backend on mount
  useEffect(() => {
    setError(null)
    employeeApi.getAll()
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error('Failed to load employees', err)
        setError('Impossible de charger les employés. Vérifiez que le backend est lancé.')
        setEmployees([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (isRH) {
      setLoadingChanges(true)
      profileChangeApi.getPendingRequests()
        .then((data) => {
          setPendingChanges(data ?? [])
        })
        .catch((err) => console.error('Failed to load pending profile changes', err))
        .finally(() => setLoadingChanges(false))
    }
  }, [isRH])

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const name = e.nomComplet || e.name || ''
      const poste = e.poste || e.role || ''
      const email = e.email || ''
      const statut = e.statut || e.status || ''

      if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())
                      && !poste.toLowerCase().includes(searchTerm.toLowerCase())
                      && !email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (activeFilter === 'Tous') return true
      if (activeFilter === 'Actif' && statut !== 'ACTIF' && statut !== 'Actif') return false
      if (activeFilter === 'Inactif' && statut !== 'ARCHIVE' && statut !== 'Inactif') return false
      return true
    })
  }, [employees, activeFilter, searchTerm])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [activeFilter, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE))
  const paginated = filteredEmployees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const addEmployee = (emp) => setEmployees((prev) => [emp, ...prev])

  const updateEmployee = (updatedEmp) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e))
  }

  const handleEdit = (emp) => {
    setEditingEmployee(emp)
    setCreateOpen(true)
  }

  const handleModalClose = () => {
    setCreateOpen(false)
    setEditingEmployee(null)
  }

  const handleCreated = async () => {
    // Refresh the list after create
    try {
      const data = await employeeApi.getAll()
      setEmployees(data ?? [])
    } catch (err) {
      console.error('Refresh failed', err)
    }
  }

  return (
    <AppShell
      header={
        <TopBar
          title="Gestion des Employés"
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }}
        />
      }
    >
      <div className="empPage">
        {isRH && (
          <CreateEmployeeModal
            open={createOpen}
            onClose={handleModalClose}
            onCreate={(emp) => { addEmployee(emp); handleCreated() }}
            editingEmployee={editingEmployee}
            onUpdate={updateEmployee}
          />
        )}

        {isRH && pendingChanges.length > 0 && (
          <section className="tableCard" style={{ marginBottom: '2rem', border: '1px solid #f39c12' }} aria-label="Demandes de modification de profil en attente">
            <div style={{ padding: '16px 20px', background: 'rgba(243, 156, 18, 0.05)', borderBottom: '1px solid rgba(243, 156, 18, 0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f39c12' }} />
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#d35400', margin: 0 }}>
                Demandes de modification de profil en attente ({pendingChanges.length})
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="empTable">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Date soumission</th>
                    <th>Changements demandés</th>
                    <th>Commentaire RH (Obligatoire en cas de refus)</th>
                    <th className="thActions" style={{ width: '220px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingChanges.map((req) => {
                    let parsedFields = {}
                    try {
                      parsedFields = JSON.parse(req.champsModifies)
                    } catch (e) {
                      console.error("Failed to parse request JSON", e)
                    }
                    const fieldLines = Object.entries(parsedFields).map(([key, val]) => {
                      const labelMap = {
                        email: 'Email',
                        telephone: 'Téléphone',
                        cin: 'CIN',
                        dateNaissance: 'Date de naissance',
                        adresse: 'Adresse'
                      }
                      return `${labelMap[key] || key} : ${val}`
                    }).join(', ')

                    return (
                      <tr key={req.id}>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                            {req.employee?.nomComplet || '—'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {req.employee?.poste || ''}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>
                          {req.dateSoumission ? req.dateSoumission.split('T')[0] : '—'}
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                            {fieldLines || req.champsModifies}
                          </div>
                        </td>
                        <td onClick={(ev) => ev.stopPropagation()}>
                          <input 
                            type="text" 
                            id={`global-comment-rh-${req.id}`}
                            placeholder="ex: Justificatif vérifié..." 
                            style={{ 
                              width: '100%', 
                              padding: '6px 12px', 
                              borderRadius: '6px', 
                              border: '1px solid var(--border-mid)', 
                              fontSize: '13px',
                              background: 'var(--surface)',
                              color: 'var(--text)'
                            }}
                          />
                        </td>
                        <td className="tdActions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', padding: '12px 20px' }} onClick={(ev) => ev.stopPropagation()}>
                          <button 
                            className="addBtn"
                            type="button"
                            style={{ padding: '6px 12px', fontSize: '12px', background: '#27ae60', borderColor: '#27ae60', height: '32px' }}
                            onClick={async () => {
                              const comment = document.getElementById(`global-comment-rh-${req.id}`)?.value || ''
                              try {
                                await profileChangeApi.processRequest(req.id, true, comment)
                                alert("✅ Demande approuvée avec succès !")
                                setPendingChanges(prev => prev.filter(r => r.id !== req.id))
                              } catch (err) {
                                console.error(err)
                                alert("Erreur lors de l'approbation : " + (err.response?.data?.message || err.message))
                              }
                            }}
                          >
                            Approuver
                          </button>
                          <button 
                            className="btnGhost"
                            type="button"
                            style={{ padding: '6px 12px', fontSize: '12px', height: '32px', borderColor: '#dc2626', color: '#dc2626' }}
                            onClick={async () => {
                              const comment = document.getElementById(`global-comment-rh-${req.id}`)?.value || ''
                              if (!comment.trim()) {
                                alert("Un commentaire est obligatoire en cas de refus.")
                                return
                              }
                              try {
                                await profileChangeApi.processRequest(req.id, false, comment)
                                alert("❌ Demande refusée.")
                                setPendingChanges(prev => prev.filter(r => r.id !== req.id))
                              } catch (err) {
                                console.error(err)
                                alert("Erreur lors du refus : " + (err.response?.data?.message || err.message))
                              }
                            }}
                          >
                            Refuser
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="empToolbar" aria-label="Barre d'actions">
          <div className="empSearchWrap">
            <IconSearch className="empSearchIcon" />
            <input
              className="empSearchInput"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isRH && (
            <button className="addBtn" type="button" onClick={() => { setEditingEmployee(null); setCreateOpen(true); }}>
              <IconPlus />
              Ajouter un employé
            </button>
          )}
        </div>

        <div className="filterRow" aria-label="Filtres">
          {['Tous', 'Actif', 'Inactif'].map(f => (
            <button
              key={f}
              className={f === activeFilter ? 'pill pillActive' : 'pill'}
              type="button"
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <section className="tableCard" aria-label="Liste des employés">
          <table className="empTable">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Poste</th>
                <th>Département</th>
                <th>{`Date d'embauche`}</th>
                <th>Statut</th>
                <th className="thActions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#8a9bb0' }}>Chargement…</td></tr>
              ) : error ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>{error}</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#8a9bb0' }}>Aucun employé trouvé</td></tr>
              ) : paginated.map((e) => {
                const name = e.nomComplet || e.name || '—'
                const initials = initialsFromName(name)
                const poste = e.poste || e.role || '—'
                const dept = e.departement || e.dept || '—'
                const hired = e.dateEmbauche || e.hired || '—'
                const status = e.statut || e.status || '—'
                const isActive = status === 'ACTIF' || status === 'Actif'

                return (
                  <tr key={e.id} onClick={() => navigate(`/employees/${e.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="empCell">
                        <div className="badge">
                          {e.photoProfil ? (
                            <img src={getPhotoUrl(e.photoProfil)} alt={name} className="empBadgeImg" />
                          ) : (
                            initials
                          )}
                        </div>
                        <span className="empName">{name}</span>
                      </div>
                    </td>
                    <td>{poste}</td>
                    <td>{dept}</td>
                    <td>{hired}</td>
                    <td>
                      <span className={isActive ? 'statusGreen' : 'statusGray'}>
                        {isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="tdActions" onClick={(ev) => ev.stopPropagation()}>
                      <Link className="actionIcon" to={`/employees/${e.id}`} aria-label="Voir">
                        <IconEye />
                      </Link>
                      {isRH && (
                        <button className="actionIcon" type="button" aria-label="Modifier" onClick={() => handleEdit(e)}>
                          <IconEdit />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* Working Pagination */}
        {totalPages > 1 && (
          <div className="pagination" aria-label="Pagination">
            <button
              className="pageBtn pageMuted"
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹ Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pageBtn ${p === page ? 'pageActive' : ''}`}
                type="button"
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="pageBtn pageMuted"
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant ›
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
