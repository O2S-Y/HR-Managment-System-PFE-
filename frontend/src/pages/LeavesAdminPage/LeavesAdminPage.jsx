import { useState } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { CreateLeaveTypeModal } from './CreateLeaveTypeModal'
import { CreateLeaveAdjustmentModal } from './CreateLeaveAdjustmentModal'
import './leavesAdminPage.css'

const leaveTypes = [
  { name: 'Congé Annuel', quota: '26 jours', status: 'Actif' },
  { name: 'RTT', quota: '10 jours', status: 'Actif' },
  { name: 'Maladie', quota: 'Illimité', status: 'Actif' },
  { name: 'Congé sans solde', quota: 'Sur demande', status: 'Actif' },
]

const adjustments = [
  { employee: 'Alice Lemaire', type: 'Congé Annuel', adjustment: '+3 jours', reason: 'Report année précédente', date: '15 Jan 2024' },
  { employee: 'Marc Dubois', type: 'RTT', adjustment: '-1 jour', reason: 'Correction erreur saisie', date: '10 Jan 2024' },
]

export function LeavesAdminPage() {
  const [localLeaveTypes, setLocalLeaveTypes] = useState(leaveTypes)
  const [localAdjustments, setLocalAdjustments] = useState(adjustments)
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false)
  const [isCreateAdjustmentModalOpen, setIsCreateAdjustmentModalOpen] = useState(false)

  return (
    <AppShell
      header={
        <TopBar
          title="Configuration Congés"
          showSearch
          searchPlaceholder="Rechercher..."
          user={{ name: 'Admin RH', role: 'RH' }}
        />
      }
    >
      <div className="laPage">
        <section className="laSection">
          <div className="laSectionHead">
            <div className="laSectionTitle">AJUSTEMENTS MANUELS RÉCENTS</div>
            <button className="laAddBtn" type="button" onClick={() => setIsCreateAdjustmentModalOpen(true)}>+ Nouvel ajustement</button>
          </div>
          <table className="laTable">
            <thead>
              <tr>
                <th>EMPLOYÉ</th>
                <th>TYPE</th>
                <th>AJUSTEMENT</th>
                <th>MOTIF</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {localAdjustments.map((a, idx) => (
                <tr key={idx}>
                  <td className="strong">{a.employee}</td>
                  <td>{a.type}</td>
                  <td>{a.adjustment}</td>
                  <td>{a.reason}</td>
                  <td className="mono">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="laSection">
          <div className="laSectionHead">
            <div className="laSectionTitle">TYPES DE CONGÉS & QUOTAS</div>
            <button className="laAddBtn" type="button" onClick={() => setIsCreateTypeModalOpen(true)}>+ Ajouter un type</button>
          </div>
          <table className="laTable">
            <thead>
              <tr>
                <th>TYPE</th>
                <th>QUOTA</th>
                <th>STATUT</th>
                <th className="thRight">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {localLeaveTypes.map((lt) => (
                <tr key={lt.name}>
                  <td className="strong">{lt.name}</td>
                  <td>{lt.quota}</td>
                  <td><span className="laBadge">{lt.status}</span></td>
                  <td className="tdRight">
                    <button className="laEditBtn" type="button">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <CreateLeaveTypeModal
        open={isCreateTypeModalOpen}
        onClose={() => setIsCreateTypeModalOpen(false)}
        onCreate={(newType) => setLocalLeaveTypes([newType, ...localLeaveTypes])}
      />

      <CreateLeaveAdjustmentModal
        open={isCreateAdjustmentModalOpen}
        onClose={() => setIsCreateAdjustmentModalOpen(false)}
        onCreate={(newAdj) => setLocalAdjustments([newAdj, ...localAdjustments])}
      />
    </AppShell>
  )
}
