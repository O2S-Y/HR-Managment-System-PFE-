import './attendancePage.css'
import '../AttendanceMyPage/attendanceMyPage.css'
import { AppShell } from '../../components/AppShell/AppShell'
import { TopBar } from '../../components/TopBar/TopBar'
import { useState, useEffect } from 'react'
import { attendanceApi } from '../../services/authApi'
import { useAuth } from '../../contexts/AuthContext'

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 11h-4v-2h3V7h2v6Z" />
    </svg>
  )
}

export function AttendancePage() {
  const todayStr = new Date().toISOString().split('T')[0]
  const today = todayStr
  const [selectedDate, setSelectedDate] = useState(today)
  const [search, setSearch] = useState('')
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const isRH = user?.role === 'RH'

  const [myHistory, setMyHistory] = useState([])
  const [clocking, setClocking] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    attendanceApi.getAll()
      .then((data) => setAttendance(data ?? []))
      .catch((err) => console.error('Failed to load attendance', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (isRH) {
      attendanceApi.getMyAttendance()
        .then((data) => setMyHistory(data ?? []))
        .catch((err) => console.error('Failed to load my attendance', err))
    }
  }, [isRH])

  const myTodayRecord = myHistory.find(r => r.datePointage === todayStr) ?? null
  const hasArrival = !!myTodayRecord?.heureArrivee
  const hasSortie = !!myTodayRecord?.heureSortie

  const handleClock = async (type) => {
    if (clocking) return
    setClocking(true)
    setErrorMsg(null)
    try {
      const updated = await attendanceApi.clock(type)
      setMyHistory((prev) => {
        const idx = prev.findIndex(r => r.datePointage === todayStr)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = updated
          return copy
        }
        return [updated, ...prev]
      })
      // Refresh global list so it shows in the table
      const globalData = await attendanceApi.getAll()
      setAttendance(globalData ?? [])
    } catch (err) {
      console.error('Clock failed', err)
      setErrorMsg(err.response?.data?.message || 'Erreur lors du pointage')
    } finally {
      setClocking(false)
    }
  }

  const filteredAttendance = attendance.filter((a) => {
    const date = a.datePointage || ''
    const name = a.employee?.nomComplet || a.name || ''
    const matchDate = date === selectedDate
    const matchSearch = name.toLowerCase().includes(search.toLowerCase())
    return matchDate && matchSearch
  })

  const formatTime = (t) => t ? String(t).substring(0, 5) : null
  const todayRecords = attendance.filter(a => a.datePointage === selectedDate)
  const presentCount = todayRecords.filter(a => a.heureArrivee).length
  const departedCount = todayRecords.filter(a => a.heureSortie).length

  return (
    <AppShell
      header={<TopBar title="Pointage — Présence" />}
    >
      <div className="attMain">
        {isRH && (
          <section className="myAttTodayCard" aria-label="Pointage du jour" style={{ marginBottom: '24px' }}>
            <div className="myAttTodayHeader">
              <IconClock className="myAttTodayIcon" />
              <div>
                <div className="myAttTodayTitle" style={{ fontSize: '15px' }}>Mon Pointage Personnel</div>
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
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" style={{ fill: 'currentColor' }}>
                  <path d="M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5Zm9 12H13v2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-7v2h7v14Z" />
                </svg>
                <div className="myAttActionBtnText">
                  {hasArrival ? (
                    <>
                      <span className="myAttActionLabel">Arrivée pointée</span>
                      <span className="myAttActionTime">{formatTime(myTodayRecord.heureArrivee)}</span>
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
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" style={{ fill: 'currentColor' }}>
                  <path d="M17 7l-1.4 1.4 2.6 2.6H8v2h10.2l-2.6 2.6L17 17l5-5-5-5ZM4 5h7V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7v-2H4V5Z" />
                </svg>
                <div className="myAttActionBtnText">
                  {hasSortie ? (
                    <>
                      <span className="myAttActionLabel">Sortie pointée</span>
                      <span className="myAttActionTime">{formatTime(myTodayRecord.heureSortie)}</span>
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
              <div className="myAttErrorMsg" role="alert" style={{ marginTop: '12px', marginBottom: '0px' }}>
                {errorMsg}
              </div>
            )}

            {hasArrival && hasSortie && (
              <div className="myAttCompleteMsg" style={{ marginTop: '12px', marginBottom: '0px' }}>
                ✓ Pointage complet — Bonne journée !
              </div>
            )}
          </section>
        )}
        {/* KPI row */}
        <section className="attKpiRow" aria-label="Résumé du jour">
          <div className="attKpiCard">
            <div className="attKpiDot attKpiDotGreen" />
            <div className="attKpiValue">{todayRecords.length}</div>
            <div className="attKpiLabel">Enregistrements</div>
          </div>
          <div className="attKpiCard">
            <div className="attKpiDot attKpiDotBlue" />
            <div className="attKpiValue">{presentCount}</div>
            <div className="attKpiLabel">Arrivées pointées</div>
          </div>
          <div className="attKpiCard">
            <div className="attKpiDot attKpiDotPurple" />
            <div className="attKpiValue">{departedCount}</div>
            <div className="attKpiLabel">Départs pointés</div>
          </div>
        </section>

        {/* Filters */}
        <section className="attFilters" aria-label="Filtres">
          <input
            type="date"
            className="attDatePicker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <input
            type="text"
            className="attSearch"
            placeholder="Rechercher un employé…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        {/* Attendance table */}
        <section className="attTableWrap" aria-label="Liste de pointage">
          <table className="attTable">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Date</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Commentaire</th>
                <th className="attThRight">Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="attEmpty">Chargement…</td></tr>
              ) : filteredAttendance.length === 0 ? (
                <tr><td colSpan="6" className="attEmpty">Aucun pointage trouvé pour cette date.</td></tr>
              ) : (
                filteredAttendance.map((row) => {
                  const name = row.employee?.nomComplet || row.name || '—'
                  const arrival = formatTime(row.heureArrivee)
                  const departure = formatTime(row.heureSortie)
                  return (
                    <tr key={row.id}>
                      <td className="attTdStrong">{name}</td>
                      <td className="attTdMono">{row.datePointage}</td>
                      <td>
                        {arrival ? (
                          <span className="attTimeBadge attTimeBadgeIn">{arrival}</span>
                        ) : (
                          <span className="attTimeBadge attTimeBadgeMissing">—</span>
                        )}
                      </td>
                      <td>
                        {departure ? (
                          <span className="attTimeBadge attTimeBadgeOut">{departure}</span>
                        ) : (
                          <span className="attTimeBadge attTimeBadgeMissing">—</span>
                        )}
                      </td>
                      <td className="attTdComment">{row.commentaire || '—'}</td>
                      <td className="attThRight">
                        {arrival && departure ? (
                          <span className="attStatusPill attStatusComplete">Complet</span>
                        ) : arrival ? (
                          <span className="attStatusPill attStatusPartial">En cours</span>
                        ) : (
                          <span className="attStatusPill attStatusMissing">Non pointé</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  )
}
