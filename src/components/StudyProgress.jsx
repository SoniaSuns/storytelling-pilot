import { Link } from 'react-router-dom'
import {
  getStudyDates,
  formatDisplayDate,
  formatDateISO,
} from '../utils/dates'
import { getParticipant } from '../utils/storage'

function getCheckInStatus(checkIn) {
  if (!checkIn || !checkIn.completedAt) return 'missing'
  return 'complete'
}

function getIncidentStatus(checkIn, incidentsForDay) {
  if (!checkIn) return 'unknown'
  if (checkIn.hadIncident === 'Yes') {
    return incidentsForDay.length > 0 ? 'reported' : 'partial'
  }
  if (checkIn.hadIncident === 'No') return 'none'
  return 'unknown'
}

export default function StudyProgress({ participantName }) {
  const participant = getParticipant(participantName)
  const studyStartDate = participant?.profile?.studyStartDate
  const today = formatDateISO()

  if (!studyStartDate) {
    return (
      <div className="card">
        <h2>Study progress</h2>
        <p className="hint">Study start date is not set in your profile.</p>
      </div>
    )
  }

  const studyDates = getStudyDates(studyStartDate)
  const checkIns = participant?.dailyCheckIns || {}
  const incidents = participant?.incidents || {}

  return (
    <div className="card">
      <h2>Study progress</h2>
      <p className="instructions">
        Track your 7-day diary study at a glance. Click a day below to fill in or
        edit that day&apos;s daily check-in or incident reports (including past
        days).
      </p>

      <div className="progress-table-wrap">
        <table className="progress-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Date</th>
              <th>Check-in</th>
              <th>Incidents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {studyDates.map(({ studyDay, date }) => {
              const checkIn = checkIns[date]
              const dayIncidents = incidents[date] || []
              const checkInStatus = getCheckInStatus(checkIn)
              const incidentStatus = getIncidentStatus(checkIn, dayIncidents)
              const isToday = date === today

              return (
                <tr key={date} className={isToday ? 'today' : ''}>
                  <td>{studyDay}</td>
                  <td>
                    <Link
                      to={`/check-in/${date}`}
                      className="progress-date-link"
                      title="Open daily check-in for this day"
                    >
                      {formatDisplayDate(date)}
                    </Link>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${checkInStatus === 'complete' ? 'complete' : 'missing'}`}
                    >
                      {checkInStatus === 'complete' ? 'Completed' : 'Not completed'}
                    </span>
                  </td>
                  <td>
                    {incidentStatus === 'reported' && (
                      <span className="status-badge complete">
                        Incident reported ({dayIncidents.length})
                      </span>
                    )}
                    {incidentStatus === 'none' && (
                      <span className="status-badge partial">No incident</span>
                    )}
                    {incidentStatus === 'partial' && (
                      <span className="status-badge partial">
                        Check-in says yes — add report
                      </span>
                    )}
                    {incidentStatus === 'unknown' && (
                      <span className="status-badge missing">Unknown</span>
                    )}
                  </td>
                  <td className="progress-actions">
                    <Link
                      to={`/check-in/${date}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Check-in
                    </Link>
                    <Link
                      to={`/incidents/${date}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Incidents
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {checkIns[today]?.hadIncident === 'Yes' &&
        (incidents[today] || []).length === 0 && (
          <p className="hint" style={{ marginTop: '1rem' }}>
            You marked an incident for today but have not added a report yet.{' '}
            <Link to={`/incidents/${today}/new`}>Add incident report</Link>
          </p>
        )}
    </div>
  )
}
