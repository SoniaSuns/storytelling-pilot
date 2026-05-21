import { Link } from 'react-router-dom'
import {
  getStudyDates,
  formatDisplayDate,
  formatDateISO,
} from '../utils/dates'
import { getParticipant } from '../utils/storage'
import { useI18n } from '../i18n/LanguageContext'

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
  const { t, locale } = useI18n()
  const participant = getParticipant(participantName)
  const studyStartDate = participant?.profile?.studyStartDate
  const today = formatDateISO()

  if (!studyStartDate) {
    return (
      <div className="card">
        <h2>{t('progress.title')}</h2>
        <p className="hint">{t('progress.noStart')}</p>
      </div>
    )
  }

  const studyDates = getStudyDates(studyStartDate)
  const checkIns = participant?.dailyCheckIns || {}
  const incidents = participant?.incidents || {}

  return (
    <div className="card">
      <h2>{t('progress.title')}</h2>
      <p className="instructions">{t('progress.intro')}</p>

      <div className="progress-table-wrap">
        <table className="progress-table">
          <thead>
            <tr>
              <th>{t('progress.day')}</th>
              <th>{t('progress.date')}</th>
              <th>{t('progress.checkInCol')}</th>
              <th>{t('progress.incidentsCol')}</th>
              <th>{t('progress.actions')}</th>
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
                    >
                      {formatDisplayDate(date, locale)}
                    </Link>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${checkInStatus === 'complete' ? 'complete' : 'missing'}`}
                    >
                      {checkInStatus === 'complete'
                        ? t('progress.completed')
                        : t('progress.notCompleted')}
                    </span>
                  </td>
                  <td>
                    {incidentStatus === 'reported' && (
                      <span className="status-badge complete">
                        {t('progress.incidentReported', {
                          count: dayIncidents.length,
                        })}
                      </span>
                    )}
                    {incidentStatus === 'none' && (
                      <span className="status-badge partial">
                        {t('progress.noIncident')}
                      </span>
                    )}
                    {incidentStatus === 'partial' && (
                      <span className="status-badge partial">
                        {t('progress.needsReport')}
                      </span>
                    )}
                    {incidentStatus === 'unknown' && (
                      <span className="status-badge missing">
                        {t('progress.unknown')}
                      </span>
                    )}
                  </td>
                  <td className="progress-actions">
                    <Link
                      to={`/check-in/${date}`}
                      className="btn btn-secondary btn-sm"
                    >
                      {t('progress.checkInBtn')}
                    </Link>
                    <Link
                      to={`/incidents/${date}`}
                      className="btn btn-secondary btn-sm"
                    >
                      {t('progress.incidentsBtn')}
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
            {t('progress.todayReminder')}{' '}
            <Link to={`/incidents/${today}/new`}>{t('progress.addReport')}</Link>
          </p>
        )}
    </div>
  )
}
