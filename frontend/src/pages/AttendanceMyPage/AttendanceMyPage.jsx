import './attendanceMyPage.css'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useState, useEffect } from 'react'
import { attendanceApi } from '../../services/authApi'

const todayStr = new Date().toISOString().split('T')[0]

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 11h-4v-2h3V7h2v6Z" />
    </svg>
  )
}

function IconLogin(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5Zm9 12H13v2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-7v2h7v14Z" />
    </svg>
  )
}

function IconExit(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M17 7l-1.4 1.4 2.6 2.6H8v2h10.2l-2.6 2.6L17 17l5-5-5-5ZM4 5h7V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7v-2H4V5Z" />
    </svg>
  )
}

export function AttendanceMyPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [clocking, setClocking] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  // Load my attendance history on mount
  useEffect(() => {
    attendanceApi.getMyAttendance()
      .then((data) => setHistory(data ?? []))
      .catch((err) => console.error('Failed to load attendance', err))
      .finally(() => setLoading(false))
  }, [])

  // Find today's record from history
  const todayRecord = history.find(r => r.datePointage === todayStr) ?? null
  const hasArrival = !!todayRecord?.heureArrivee
  const hasSortie = !!todayRecord?.heureSortie

  const handleClock = async (type) => {
    if (clocking) return
    setClocking(true)
    setErrorMsg(null)
    try {
      // type: 'ARRIVEE' or 'SORTIE'
      const updated = await attendanceApi.clock(type)
      // Replace or add today's record
      setHistory((prev) => {
        const idx = prev.findIndex(r => r.datePointage === todayStr)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = updated
          return copy
        }
        return [updated, ...prev]
      })
    } catch (err) {
      console.error('Clock failed', err)
      setErrorMsg(err.response?.data?.message || 'Erreur lors du pointage')
    } finally {
      setClocking(false)
    }
  }

  const formatTime = (t) => t ? String(t).substring(0, 5) : null

  return (
    <AppShell header={<TopBar title="Mon Pointage" />}>
      <div className="myAttMain">
        {/* Today's card — the main action area */}
        <section className="myAttTodayCard" aria-label="Pointage du jour">
          <div className="myAttTodayHeader">
            <IconClock className="myAttTodayIcon" />
            <div>
              <div className="myAttTodayTitle">Pointage du jour</div>
              <div className="myAttTodayDate">{todayStr}</div>
            </div>
          </div>

          <div className="myAttButtonRow">
            {/* Arrivée Button */}
            <button
              className={`myAttActionBtn myAttArrivalBtn ${hasArrival ? 'myAttActionBtnDone' : ''}`}
              onClick={() => handleClock('ARRIVEE')}
              disabled={hasArrival || clocking}
              type="button"
            >
              <IconLogin />
              <div className="myAttActionBtnText">
                {hasArrival ? (
                  <>
                    <span className="myAttActionLabel">Arrivée pointée</span>
                    <span className="myAttActionTime">{formatTime(todayRecord.heureArrivee)}</span>
                  </>
                ) : (
                  <>
                    <span className="myAttActionLabel">Pointer mon arrivée</span>
                    <span className="myAttActionHint">{clocking ? 'Enregistrement…' : 'Cliquez pour enregistrer'}</span>
                  </>
                )}
              </div>
            </button>

            {/* Sortie Button */}
            <button
              className={`myAttActionBtn myAttDepartBtn ${hasSortie ? 'myAttActionBtnDone' : ''} ${!hasArrival ? 'myAttActionBtnLocked' : ''}`}
              onClick={() => handleClock('SORTIE')}
              disabled={!hasArrival || hasSortie || clocking}
              type="button"
            >
              <IconExit />
              <div className="myAttActionBtnText">
                {hasSortie ? (
                  <>
                    <span className="myAttActionLabel">Sortie pointée</span>
                    <span className="myAttActionTime">{formatTime(todayRecord.heureSortie)}</span>
                  </>
                ) : !hasArrival ? (
                  <>
                    <span className="myAttActionLabel">Pointer ma sortie</span>
                    <span className="myAttActionHint">Pointez d'abord votre arrivée</span>
                  </>
                ) : (
                  <>
                    <span className="myAttActionLabel">Pointer ma sortie</span>
                    <span className="myAttActionHint">{clocking ? 'Enregistrement…' : 'Cliquez quand vous quittez'}</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {errorMsg && (
            <div className="myAttErrorMsg" role="alert">
              {errorMsg}
            </div>
          )}

          {hasArrival && hasSortie && (
            <div className="myAttCompleteMsg">
              ✓ Pointage complet — Bonne journée !
            </div>
          )}
        </section>

        {/* History */}
        <section className="myAttHistorySection" aria-label="Historique de pointage">
          <div className="myAttHistoryTitle">Historique récent</div>
          <div className="myAttTableWrap">
            <table className="myAttTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Arrivée</th>
                  <th>Sortie</th>
                  <th className="myAttThRight">Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: '#8a9bb0' }}>Chargement…</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: '#8a9bb0' }}>Aucun pointage enregistré</td></tr>
                ) : history.map((row) => (
                  <tr key={row.id}>
                    <td className="myAttTdMono">{row.datePointage}</td>
                    <td>
                      <span className="myAttTimeBadge myAttTimeBadgeIn">{formatTime(row.heureArrivee) ?? '—'}</span>
                    </td>
                    <td>
                      {row.heureSortie ? (
                        <span className="myAttTimeBadge myAttTimeBadgeOut">{formatTime(row.heureSortie)}</span>
                      ) : (
                        <span className="myAttTimeBadge myAttTimeBadgeMissing">—</span>
                      )}
                    </td>
                    <td className="myAttThRight">
                      {row.heureArrivee && row.heureSortie ? (
                        <span className="myAttStatusPill myAttStatusComplete">Complet</span>
                      ) : (
                        <span className="myAttStatusPill myAttStatusPartial">En cours</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
