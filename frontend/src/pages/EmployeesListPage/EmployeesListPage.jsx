import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { CreateEmployeeModal } from './CreateEmployeeModal'
import { useAuth } from '../../contexts/AuthContext'
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

const initialEmployees = [
  { id: '1', initials: 'AL', name: 'Amelie Laurent', role: 'Senior Developer', dept: 'Engineering', hired: '12 Oct 2021', status: 'Actif' },
  { id: '2', initials: 'MB', name: 'Marc Dubois', role: 'Product Manager', dept: 'Product', hired: '05 Jan 2022', status: 'Actif' },
  { id: '3', initials: 'SL', name: 'Sophie Martin', role: 'HR Specialist', dept: 'People Ops', hired: '22 Mar 2023', status: 'Inactif' },
  { id: '4', initials: 'JP', name: 'Jean Petit', role: 'UI Designer', dept: 'Design', hired: '10 Nov 2022', status: 'Actif' },
  { id: '5', initials: 'CL', name: 'Claire Leroy', role: 'Data Analyst', dept: 'Data', hired: '15 Feb 2024', status: 'Actif' },
]

export function EmployeesListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isRH = user?.role === 'RH'
  const [createOpen, setCreateOpen] = useState(false)
  const [employees, setEmployees] = useState(initialEmployees)
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      // Filter by search term
      if (searchTerm && !e.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      // Filter by active pill
      if (activeFilter === 'Tous') return true
      if (activeFilter === 'Actif' && e.status !== 'Actif') return false
      if (activeFilter === 'Inactif' && e.status !== 'Inactif') return false
      if (activeFilter === 'En congé' && e.status !== 'En congé') return false
      return true
    })
  }, [employees, activeFilter, searchTerm])

  const addEmployee = useMemo(() => {
    return (empRow) => setEmployees((prev) => [empRow, ...prev])
  }, [])

  return (
    <AppShell
      header={
        <TopBar
          title="Gestion des Employés"
          showSearch={false}
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }}
        />
      }
    >
      <div className="empPage">
        {/* M1_UC1: Créer un profil — RH only */}
        {isRH && (
          <CreateEmployeeModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={addEmployee} />
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
          {/* M1_UC1: Créer un profil — RH only */}
          {isRH && (
            <button className="addBtn" type="button" onClick={() => setCreateOpen(true)}>
              <IconPlus />
              Ajouter un employé
            </button>
          )}
        </div>

        <div className="filterRow" aria-label="Filtres">
          {['Tous', 'Actif', 'Inactif', 'En congé'].map(f => (
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
              {filteredEmployees.map((e) => (
                <tr key={e.id} onClick={() => navigate(`/employees/${e.id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="empCell">
                      <div className="badge">{e.initials}</div>
                      <span className="empName">{e.name}</span>
                    </div>
                  </td>
                  <td>{e.role}</td>
                  <td>{e.dept}</td>
                  <td>{e.hired}</td>
                  <td>
                    <span className={e.status === 'Actif' ? 'statusGreen' : 'statusGray'}>
                      {e.status}
                    </span>
                  </td>
                  <td className="tdActions" onClick={(ev) => ev.stopPropagation()}>
                    {/* M1_UC5: Consulter les profils — RH + Owner */}
                    <Link className="actionIcon" to={`/employees/${e.id}`} aria-label="Voir">
                      <IconEye />
                    </Link>
                    {/* M1_UC1: Modifier un profil — RH only */}
                    {isRH && (
                      <button className="actionIcon" type="button" aria-label="Modifier">
                        <IconEdit />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="pagination" aria-label="Pagination">
          <button className="pageBtn pageMuted" type="button">
            ‹ Précédent
          </button>
          <button className="pageBtn pageActive" type="button">
            1
          </button>
          <button className="pageBtn" type="button">
            2
          </button>
          <button className="pageBtn" type="button">
            3
          </button>
          <span className="dots">…</span>
          <button className="pageBtn" type="button">
            12
          </button>
          <button className="pageBtn pageMuted" type="button">
            Suivant ›
          </button>
        </div>
      </div>
    </AppShell>
  )
}
