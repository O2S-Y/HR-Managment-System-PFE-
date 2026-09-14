import { useState, useEffect } from 'react'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { assetApi } from '../../services/authApi'
import './assetsMyPage.css'

export function AssetsMyPage() {
  const { user } = useAuth()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    assetApi.getMyAssets()
      .then((data) => setAssets(data ?? []))
      .catch((err) => console.error('Failed to load my assets', err))
      .finally(() => setLoading(false))
  }, [])

  const activeAssignments = assets.filter(a => !a.dateRetourEffective)

  return (
    <AppShell
      header={
        <TopBar
          title="Mes Actifs IT"
          user={{ name: user?.email || 'Utilisateur', role: user?.role || 'Employé' }}
        />
      }
    >
      <div className="ampPage">
        <section className="ampCard">
          <div className="ampCardHead">
            <div className="ampCardTitle">MES ÉQUIPEMENTS AFFECTÉS</div>
            <div className="ampCount">{activeAssignments.length} actif{activeAssignments.length > 1 ? 's' : ''}</div>
          </div>
          <table className="ampTable">
            <thead>
              <tr>
                <th>NOM DE L'ACTIF</th>
                <th>TYPE</th>
                <th>NUMÉRO DE SÉRIE</th>
                <th>DATE D'AFFECTATION</th>
                <th className="thRight">STATUT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#8a9bb0' }}>Chargement…</td></tr>
              ) : activeAssignments.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#8a9bb0' }}>Aucun actif affecté</td></tr>
              ) : activeAssignments.map((a) => (
                <tr key={a.id || a.asset?.reference}>
                  <td className="strong">{a.asset?.nom || '—'}</td>
                  <td>{a.asset?.categorie || '—'}</td>
                  <td className="mono">{a.asset?.reference || '—'}</td>
                  <td>{a.dateAffectation || '—'}</td>
                  <td className="tdRight">
                    <span className="ampBadge">En service</span>
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
