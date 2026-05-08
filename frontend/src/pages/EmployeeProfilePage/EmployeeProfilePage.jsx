import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import './employeeProfilePage.css'

function IconDoc(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm1 7V3.5L19.5 9H15Z"
      />
    </svg>
  )
}

const employee = {
  id: '1',
  initials: 'MA',
  name: 'Mohamed Alami',
  title: 'Senior Developer',
  dept: 'Engineering',
  status: 'ACTIF',
  email: 'm.alami@newdev.ma',
  phone: '+212 6 00 00 00 00',
  cin: 'AA123456',
  dob: '15/04/1990',
  address: '123 Rue de la Liberté, Casablanca, Maroc',
  contractType: 'CDI',
  hireDate: '01/09/2020',
  leave: { acquired: 21, used: 10, remaining: 11 },
  history: [
    { role: 'Senior Developer', dept: 'Engineering', period: 'Jan 2023 - Présent' },
    { role: 'Developer Mid-Level', dept: 'Engineering', period: 'Sep 2020 - Dec 2022' },
  ],
  documents: [
    { name: 'Contrat_Travail.pdf', date: '01/09/2020' },
    { name: 'RIB.pdf', date: '02/09/2020' },
    { name: 'Avenant_Promotion.pdf', date: '15/01/2023' },
  ],
}

export function EmployeeProfilePage() {
  const { employeeId } = useParams()
  const { user } = useAuth()
  const isRH = user?.role === 'RH'

  return (
    <AppShell
      header={
        <TopBar
          showSearch
          searchPlaceholder="Search directory..."
          center={
            <div className="tabs">
              <button className="tab tabActive" type="button">
                Directory
              </button>
              <button className="tab" type="button">
                Analytics
              </button>
              <button className="tab" type="button">
                Global Settings
              </button>
            </div>
          }
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'RH' }}
        />
      }
    >
      <div className="profilePage">
        <div className="crumbs">
          <Link className="crumbLink" to="/employees">
            Employés
          </Link>
          <span className="crumbSep">›</span>
          <span className="crumbCurrent">{employee.name}</span>
          <span className="crumbId">({employeeId})</span>
        </div>

        <section className="profileHeader">
          <div className="avatarBig" aria-hidden="true">
            {employee.initials}
          </div>
          <div className="headMeta">
            <div className="headRow">
              <h1 className="headName">{employee.name}</h1>
              <span className="badgeStatus">{employee.status}</span>
            </div>
            <div className="headTitle">{employee.title}</div>
            <div className="headDept">{employee.dept}</div>
          </div>

          {/* M1_UC3: Archiver + M1_UC1: Modifier — RH only */}
          {isRH && (
            <div className="headActions">
              <button className="linkBtn" type="button">
                Archiver
              </button>
              <button className="outlineBtn" type="button">
                Modifier
              </button>
            </div>
          )}
        </section>

        <section className="grid2">
          <div className="leftCol">
            <div className="block">
              <div className="blockTitle">INFORMATIONS PERSONNELLES</div>
              <div className="infoGrid">
                <div className="infoItem">
                  <div className="infoLabel">EMAIL</div>
                  <div className="infoValue">{employee.email}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">TÉLÉPHONE</div>
                  <div className="infoValue">{employee.phone}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">CIN</div>
                  <div className="infoValue">{employee.cin}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">DATE DE NAISSANCE</div>
                  <div className="infoValue">{employee.dob}</div>
                </div>
                <div className="infoItem infoWide">
                  <div className="infoLabel">ADRESSE</div>
                  <div className="infoValue">{employee.address}</div>
                </div>
              </div>
            </div>

            <div className="block">
              <div className="blockTitle">POSTE &amp; CONTRAT</div>
              <div className="infoGrid">
                <div className="infoItem">
                  <div className="infoLabel">POSTE</div>
                  <div className="infoValue">{employee.title}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">DÉPARTEMENT</div>
                  <div className="infoValue">{employee.dept}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">TYPE DE CONTRAT</div>
                  <div className="infoValue">{employee.contractType}</div>
                </div>
                <div className="infoItem">
                  <div className="infoLabel">{`DATE D'EMBAUCHE`}</div>
                  <div className="infoValue">{employee.hireDate}</div>
                </div>
              </div>
            </div>

            <div className="block">
              <div className="blockTitle">HISTORIQUE DES POSTES</div>
              <div className="timeline">
                {employee.history.map((h, idx) => (
                  <div key={idx} className="timeRow">
                    <span className="timeDot" />
                    <div className="timeMeta">
                      <div className="timeRole">{h.role}</div>
                      <div className="timeSub">
                        {h.dept} • {h.period}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rightCol">
            <div className="block">
              <div className="blockHead">
                <div className="blockTitle">DOCUMENTS RH</div>
                {/* M1_UC4: Gérer les documents RH — RH only */}
                {isRH && (
                  <button className="uploadBtn" type="button">
                    + Téléverser
                  </button>
                )}
              </div>
              <div className="docs">
                {employee.documents.map((d) => (
                  <div key={d.name} className="docRow">
                    <IconDoc className="docIcon" />
                    <div className="docMeta">
                      <div className="docName">{d.name}</div>
                      <div className="docDate">Ajouté le {d.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="block">
              <div className="blockTitle">SOLDE DE CONGÉS</div>
              <div className="leaveGrid">
                <div className="leaveItem">
                  <div className="leaveValue">{employee.leave.acquired}</div>
                  <div className="leaveLabel">ACQUIS</div>
                </div>
                <div className="leaveItem">
                  <div className="leaveValue">{employee.leave.used}</div>
                  <div className="leaveLabel">PRIS</div>
                </div>
                <div className="leaveItem">
                  <div className="leaveValue leaveValueAccent">{employee.leave.remaining}</div>
                  <div className="leaveLabel leaveLabelAccent">RESTANT</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

