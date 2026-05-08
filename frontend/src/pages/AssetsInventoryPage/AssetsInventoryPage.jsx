import { Fragment } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
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
const chips = ['TOUS', 'DISPONIBLE', 'ASSIGNÉ', 'EN MAINTENANCE']

const assets = [
  {
    name: 'MacBook Pro 16" M2 Max',
    type: 'Ordinateur',
    serial: 'C02GXC87MD6M',
    assignedTo: 'Sophie Martin',
    status: 'Assigné',
    tone: 'blue',
  },
  {
    name: 'Dell UltraSharp 32" 4K',
    type: 'Écran',
    serial: 'CN-0P831G-74261',
    assignedTo: 'Thomas Dubois',
    status: 'Assigné',
    tone: 'blue',
    expanded: true,
  },
  {
    name: 'Logitech MX Master 3S',
    type: 'Périphérique',
    serial: '2145LZQ8X1T8',
    assignedTo: 'Non assigné',
    status: 'Disponible',
    tone: 'green',
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    type: 'Ordinateur',
    serial: 'PF3NX8Q2',
    assignedTo: 'Atelier IT',
    status: 'En maintenance',
    tone: 'orange',
  },
]

const assignmentHistory = [
  { dot: 'on', title: 'Assigné à Thomas Dubois', sub: 'Par Admin RH', date: '12 Oct 2023' },
  { dot: 'off', title: 'Retourné par Julie Blanc', sub: 'Motif: Fin de contrat', date: '10 Oct 2023' },
  { dot: 'off', title: 'Assigné à Julie Blanc', sub: 'Par Admin RH', date: '05 Jan 2022' },
]

export function AssetsInventoryPage() {
  const { user } = useAuth()
  const isRH = user?.role === 'RH'
  const isEmployee = user?.role === 'EMPLOYE'

  // M5_UC4: Employee only sees their own assigned assets
  const displayAssets = isEmployee
    ? assets.filter(a => a.status === 'Assigné')
    : assets

  return (
    <AppShell
      header={
        <TopBar
          title="Inventaire IT"
          showSearch={false}
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
          {/* M5_UC1: Gérer l'inventaire (CRUD) — RH only */}
          {isRH && (
            <button className="aiAddBtn" type="button">
              <IconPlus />
              Ajouter un actif
            </button>
          )}
        </div>

        <div className="aiChips">
          {chips.map((c, idx) => (
            <button key={c} className={idx === 0 ? 'aiChip aiChipActive' : 'aiChip'} type="button">
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
                <th>ASSIGNÉ À</th>
                <th>STATUT</th>
                {/* M5_UC1/M5_UC2: Actions column — RH only */}
                {isRH && <th className="thRight">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {displayAssets.map((a) => (
                <Fragment key={a.name}>
                  <tr>
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
                    {/* M5_UC2: Assigner/Désassigner — RH only */}
                    {isRH && <td className="tdRight">…</td>}
                  </tr>
                  {a.expanded ? (
                    <tr className="expandRow">
                      <td colSpan={6}>
                        <div className="expandBox">
                          <div className="expandTitle">HISTORIQUE D’ASSIGNATION</div>
                          <div className="timeline">
                            {assignmentHistory.map((h, idx) => (
                              <div key={idx} className="tRow">
                                <span className={h.dot === 'on' ? 'tDot tDotOn' : 'tDot tDotOff'} />
                                <div className="tMeta">
                                  <div className="tTitle">{h.title}</div>
                                  <div className="tSub">{h.sub}</div>
                                </div>
                                <div className="tDate">{h.date}</div>
                              </div>
                            ))}
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
    </AppShell>
  )
}

