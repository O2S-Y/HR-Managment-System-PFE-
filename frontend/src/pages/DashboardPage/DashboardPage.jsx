import './dashboardPage.css'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { dashboardApi } from '../../services/authApi'
import { leaveApi } from '../../services/authApi'
import toast from 'react-hot-toast'
import { getPhotoUrl } from '../../services/http'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return '—'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}


function IconGrid(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
      />
    </svg>
  )
}

function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M16 11a4 4 0 1 0-3.999-4A4 4 0 0 0 16 11ZM8 12a3 3 0 1 0-2.999-3A3 3 0 0 0 8 12Zm8 2c-3.33 0-6 1.34-6 3v2h12v-2c0-1.66-2.67-3-6-3Zm-8 1c-2.67 0-5 1.07-5 2.5V19h7v-1.5C10 16.07 9.33 15 8 15Z"
      />
    </svg>
  )
}

function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm13 8H6v10h14V10Z"
      />
    </svg>
  )
}

function IconClipboard(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M9 2h6a2 2 0 0 1 2 2h2v18H5V4h2a2 2 0 0 1 2-2Zm0 2v2h6V4H9Zm-2 4v12h10V8H7Z"
      />
    </svg>
  )
}

function IconLaptop(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M4 5h16v10H4V5Zm-2 12h20v2H2v-2Z"
      />
    </svg>
  )
}

function IconBell(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 1 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z"
      />
    </svg>
  )
}

function IconDownload(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M5 20h14v-2H5v2Zm7-18v10l4-4 1.41 1.41L12 16.83 6.59 9.41 8 8l4 4V2h0Z"
      />
    </svg>
  )
}

function RatingDots({ value = 4, max = 5 }) {
  return (
    <div className="rating" aria-label={`Note ${value} sur ${max}`}>
      {Array.from({ length: max }).map((_, idx) => {
        const filled = idx < value
        return <span key={idx} className={filled ? 'dot dotFilled' : 'dot dotEmpty'} />
      })}
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const isOwner = user?.role === 'OWNER'

  const [stats, setStats] = useState(null)
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  const leaveUsageData = stats?.leaveUsage || []

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, leavesData] = await Promise.all([
          dashboardApi.getStats(),
          leaveApi.getPending(),
        ])
        setStats(statsData)
        setPendingLeaves(leavesData || [])
      } catch (err) {
        console.error('Dashboard load error', err)
        toast.error("Erreur lors du chargement des données du tableau de bord")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Build KPI cards from real stats (matches DashboardStatsDto fields)
  const kpis = stats
    ? [
        { value: String(stats.totalEmployees ?? 0), label: 'Employés actifs' },
        { value: String(stats.pendingLeaves ?? 0), label: 'Congés en attente' },
        { value: String(stats.pendingProfileChanges ?? 0), label: 'Demandes de profil' },
        { value: String(stats.availableAssets ?? 0), label: 'Actifs disponibles' },
        { value: String(stats.assignedAssets ?? 0), label: 'Actifs affectés' },
      ]
    : []

  return (
    <AppShell
      header={
        <TopBar
          title="Tableau de Bord"
          right={
            <>
              {/* M4_UC1: Exporter tableau de bord en PDF — Owner only */}
              {isOwner && (
                <button className="exportBtn" type="button" onClick={() => window.print()}>
                  <IconDownload />
                  Export PDF
                </button>
              )}
              <span className="dateText">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </>
          }
        />
      }
    >
      <div className="dashMain">
        <section className="kpiGrid" aria-label="Indicateurs">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="kpiCard">
              <div className="kpiDot" />
              <div className="kpiValue">{kpi.value}</div>
              <div className="kpiLabel">{kpi.label}</div>
            </div>
          ))}
        </section>

        <section className="row2" aria-label="Congés en attente et usage des congés">
          <div className="panel">
            <div className="panelTitle">CONGÉS EN ATTENTE</div>
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Collaborateur</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th className="thRight">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: '#8a9bb0' }}>Chargement…</td></tr>
                  ) : pendingLeaves.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: '#8a9bb0' }}>Aucune demande en attente</td></tr>
                  ) : pendingLeaves.map((row, i) => (
                    <tr key={row.id ?? i}>
                      <td className="tdStrong">{row.employee?.nomComplet || '—'}</td>
                      <td>{row.typeConge?.nom ?? '—'}</td>
                      <td>{row.dateDebut} – {row.dateFin}</td>
                      <td className="tdRight">
                        <span className="statusPill">
                          {row.statut === 'EN_ATTENTE' ? 'En attente' :
                           row.statut === 'APPROUVE' ? 'Approuvé' :
                           row.statut === 'REFUSE' ? 'Refusé' :
                           row.statut === 'ANNULE' ? 'Annulé' :
                           row.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panelTitle">USAGE DES CONGÉS</div>
            <div className="chartCard">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={leaveUsageData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(193,199,207,0.25)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#50606e', fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'rgba(40,97,133,0.06)' }} />
                  <Bar dataKey="value" fill="#286185" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="row3" aria-label="Évaluations récentes">
          <div className="row3Title">ÉVALUATIONS RÉCENTES</div>
          <div className="evalGrid">
            {(stats?.recentEvaluations ?? []).map((e, i) => (
              <div key={e.id ?? i} className="evalCard">
                <div className="evalLeft">
                  <div className="evalAvatar" aria-hidden="true">
                    {e.employee?.photoProfil ? (
                      <img src={getPhotoUrl(e.employee.photoProfil)} alt={e.employee.nomComplet} className="evalAvatarImg" />
                    ) : (
                      initialsFromName(e.employee?.nomComplet || e.evaluateur?.courriel || '—')
                    )}
                  </div>
                  <div className="evalMeta">
                    <div className="evalName">{e.employee?.nomComplet || e.evaluateur?.courriel || '—'}</div>
                    <div className="evalPeriod">{e.periode}</div>
                  </div>
                </div>
                <RatingDots value={e.noteMoyenne ?? 0} />
              </div>
            ))}
            {!loading && (stats?.recentEvaluations ?? []).length === 0 && (
              <p style={{ color: '#8a9bb0', fontSize: '0.85rem' }}>Aucune évaluation récente</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

