import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NO_INCIDENT_REASONS } from '../utils/constants'
import {
  formatDateISO,
  getStudyDayNumber,
  formatDisplayDate,
  STUDY_DAYS,
} from '../utils/dates'
import { getParticipant, saveParticipant } from '../utils/storage'

export default function DailyCheckIn({ participantName }) {
  const today = formatDateISO()
  const participant = getParticipant(participantName)
  const studyStartDate = participant?.profile?.studyStartDate || today
  const studyDay = getStudyDayNumber(studyStartDate, today)
  const existing = participant?.dailyCheckIns?.[today] || {}

  const [usedAI, setUsedAI] = useState(existing.usedAI ?? '')
  const [hadIncident, setHadIncident] = useState(existing.hadIncident ?? '')
  const [noIncidentReason, setNoIncidentReason] = useState(
    existing.noIncidentReason ?? ''
  )
  const [dailyReflection, setDailyReflection] = useState(
    existing.dailyReflection ?? existing.notes ?? ''
  )
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const checkIn = participant?.dailyCheckIns?.[today] || {}
    setUsedAI(checkIn.usedAI ?? '')
    setHadIncident(checkIn.hadIncident ?? '')
    setNoIncidentReason(checkIn.noIncidentReason ?? '')
    setDailyReflection(checkIn.dailyReflection ?? checkIn.notes ?? '')
  }, [participantName, today, participant])

  function validate() {
    const next = {}
    if (!usedAI) {
      next.usedAI = 'Please indicate whether you used AI today.'
    }
    if (!hadIncident) {
      next.hadIncident =
        'Please indicate whether you had an incident today.'
    }
    if (hadIncident === 'No' && !noIncidentReason) {
      next.noIncidentReason =
        'Please select a reason when you had no incident.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const participantData = getParticipant(participantName)
    const now = new Date().toISOString()
    const checkIn = {
      date: today,
      studyDay,
      usedAI,
      hadIncident,
      noIncidentReason: hadIncident === 'No' ? noIncidentReason : '',
      dailyReflection: dailyReflection.trim(),
      completedAt: existing.completedAt || now,
      updatedAt: now,
    }
    const updated = {
      ...participantData,
      dailyCheckIns: {
        ...participantData.dailyCheckIns,
        [today]: checkIn,
      },
    }
    saveParticipant(participantName, updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const incidentCount = (participant?.incidents?.[today] || []).length

  return (
    <motion className="card">
      <motion className="study-day-banner">
        <strong>Study day {Math.min(studyDay, STUDY_DAYS)} of {STUDY_DAYS}</strong>
        <span>{formatDisplayDate(today)}</span>
      </motion>

      <h2>Daily check-in</h2>
      <p className="instructions">
        Over the next 7 days, please record your everyday interactions with AI
        agents or intelligent systems. We are especially interested in moments
        when an AI agent misunderstood your task, lacked important context, made
        an uncomfortable assumption, acted unexpectedly, or failed to meet your
        expectations.
      </p>
      <p className="instructions">
        If nothing notable happened today, that is still useful. Please complete
        the daily check-in and mark that no incident occurred.
      </p>

      {saved && (
        <p className="success-message" role="status">
          Today&apos;s check-in saved.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <motion className="form-group">
          <label className="required">
            Did you use any AI agent or intelligent system today?
          </label>
          <motion className="radio-group">
            <label>
              <input
                type="radio"
                name="usedAI"
                value="Yes"
                checked={usedAI === 'Yes'}
                onChange={() => setUsedAI('Yes')}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="usedAI"
                value="No"
                checked={usedAI === 'No'}
                onChange={() => setUsedAI('No')}
              />
              No
            </label>
          </motion>
          {errors.usedAI && <p className="error-message">{errors.usedAI}</p>}
        </motion>

        <motion className="form-group">
          <label className="required">
            Did you encounter any AI misunderstanding, failure, discomfort,
            boundary issue, or situation where the agent did not meet your
            expectation?
          </label>
          <motion className="radio-group">
            <label>
              <input
                type="radio"
                name="hadIncident"
                value="Yes"
                checked={hadIncident === 'Yes'}
                onChange={() => setHadIncident('Yes')}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="hadIncident"
                value="No"
                checked={hadIncident === 'No'}
                onChange={() => setHadIncident('No')}
              />
              No
            </label>
          </motion>
          {errors.hadIncident && (
            <p className="error-message">{errors.hadIncident}</p>
          )}
        </motion>

        {hadIncident === 'No' && (
          <motion className="form-group">
            <label className="required" htmlFor="noIncidentReason">
              If no incident happened today, what was the reason?
            </label>
            <select
              id="noIncidentReason"
              value={noIncidentReason}
              onChange={(e) => setNoIncidentReason(e.target.value)}
            >
              <option value="">— Select —</option>
              {NO_INCIDENT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.noIncidentReason && (
              <p className="error-message">{errors.noIncidentReason}</p>
            )}
          </motion>
        )}

        <motion className="form-group">
          <label htmlFor="dailyReflection">
            Brief daily reflection (optional)
          </label>
          <textarea
            id="dailyReflection"
            value={dailyReflection}
            onChange={(e) => setDailyReflection(e.target.value)}
            placeholder="Is there anything you want to add about today's AI interactions?"
          />
        </motion>

        <motion className="btn-group">
          <button type="submit" className="btn btn-primary">
            Save check-in
          </button>
          {hadIncident === 'Yes' && (
            <Link to="/incidents/new" className="btn btn-secondary">
              Add incident report
            </Link>
          )}
        </motion>
      </form>

      {hadIncident === 'Yes' && incidentCount > 0 && (
        <p className="hint" style={{ marginTop: '1rem' }}>
          You have {incidentCount} incident report
          {incidentCount !== 1 ? 's' : ''} for today.{' '}
          <Link to="/incidents">View incidents</Link>
        </p>
      )}
    </motion>
  )
}
