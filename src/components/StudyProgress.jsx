import { getParticipant } from '../utils/storage'
import { getStudyDates, formatDisplayDate } from '../utils/dates'

function getIncidentStatus(checkIn, incidentsForDay) {
  if (incidentsForDay?.length > 0) return 'Incident reported'
  if (checkIn?.hadIncident === 'Yes') return 'No incident report yet'
  if (checkIn?.hadIncident === 'No') return 'No incident'
  return 'Unknown'
}

function statusBadge(status, type) {
  if (type === 'checkin') {
    if (status === 'Completed') return 'badge-completed'
    return 'badge-pending'
  }
  if (status === 'Incident reported') return 'badge-incident'
  if (status === 'No incident') return 'badge-none'
  return 'badge-pending'
}

export default function StudyProgress({ participantName }) {
  const participant = getParticipant(participantName)
  const profile = participant?.profile
  if (!profile) return null

  const studyDates = getStudyDates(profile.studyStartDate)

  return (
    <div className="card">
      <h2>7-day study progress</h2>
      <p className="hint" style={{ marginBottom: '1rem' }}>
        Study started: {formatDisplayDate(profile.studyStartDate)}
      </p>
      <table className="progress-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Date</th>
            <th>Check-in</th>
            <th>Incidents</th>
          </tr>
        </thead>
        <tbody>
          {studyDates.map(({ studyDay, date }) => {
            const checkIn = participant.dailyCheckIns?.[date]
            const incidents = participant.incidents?.[date]
            const checkInStatus = checkIn ? 'Completed' : 'Not completed'
            const incidentStatus = getIncidentStatus(checkIn, incidents)

            return (
              <tr key={date}>
                <td>Day {studyDay}</td>
                <td>{formatDisplayDate(date)}</td>
                <td>
                  <span
                    className={`progress-badge ${statusBadge(checkInStatus, 'checkin')}`}
                  >
                    {checkInStatus}
                  </span>
                </td>
                <td>
                  <span
                    className={`progress-badge ${statusBadge(incidentStatus, 'incident')}`}
                  >
                    {incidentStatus}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
