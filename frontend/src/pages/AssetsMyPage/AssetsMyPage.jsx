import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import './assetsMyPage.css'

const myAssets = [
  {
    name: 'MacBook Pro 16" M2 Max',
    type: 'Ordinateur',
    serial: 'C02GXC87MD6M',
    assignedDate: '12 Oct 2023',
    status: 'En service',
  },
  {
    name: 'Dell UltraSharp 27" 4K',
    type: 'Écran',
    serial: 'CN-0P831G-74261',
    assignedDate: '12 Oct 2023',
    status: 'En service',
  },
  {
    name: 'Logitech MX Master 3S',
    type: 'Périphérique',
    serial: '2145LZQ8X1T8',
    assignedDate: '15 Oct 2023',
    status: 'En service',
  },
]

export function AssetsMyPage() {
  return (
    <AppShell
      header={
        <TopBar
          title="Mes Actifs IT"
          showSearch={false}
          user={{ name: 'Mohamed Alami', role: 'Employé' }}
        />
      }
    >
      <div className="ampPage">
        <section className="ampCard">
          <div className="ampCardHead">
            <div className="ampCardTitle">MES ÉQUIPEMENTS ASSIGNÉS</div>
            <div className="ampCount">{myAssets.length} actif{myAssets.length > 1 ? 's' : ''}</div>
          </div>
          <table className="ampTable">
            <thead>
              <tr>
                <th>NOM DE L'ACTIF</th>
                <th>TYPE</th>
                <th>NUMÉRO DE SÉRIE</th>
                <th>DATE D'ASSIGNATION</th>
                <th className="thRight">STATUT</th>
              </tr>
            </thead>
            <tbody>
              {myAssets.map((a) => (
                <tr key={a.serial}>
                  <td className="strong">{a.name}</td>
                  <td>{a.type}</td>
                  <td className="mono">{a.serial}</td>
                  <td>{a.assignedDate}</td>
                  <td className="tdRight">
                    <span className="ampBadge">{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  )
}
