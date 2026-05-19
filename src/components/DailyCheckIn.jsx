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

const REFLECTION_HINT =
  'Click Share in ChatGPT and paste the link here. If that is inconvenient, summarize using: event, time, cause, what you wanted the AI to do, prompt given, agent response, why the answer was unsatisfying, and what information you think the AI was missing.'

export default function DailyCheckIn({ participantName, dateISO: dateProp }) {
  const today = formatDateISO()
  const selectedDate = dateProp || today
  const isPastDay = selectedDate !== today
  const participant = getParticipant(participantName)
  const studyStartDate = participant?.profile?.studyStartDate || today
  const studyDay = getStudyDayNumber(studyStartDate, selectedDate)
  const existing = participant?.dailyCheckIns?.[selectedDate] || {}

  const [usedAI, setUsedAI] = useState(existing.usedAI ?? '')
  const [hadIncident, setHadIncident] = useState(existing.hadIncident ?? '')
  const [noIncidentReason, setNoIncidentReason] = useState(
    existing.noIncidentReason ?? ''
  )
  const [relatedEvents, setRelatedEvents] = useState(
    existing.relatedEvents ?? ''
  )
  const [dailyReflection, setDailyReflection] = useState(
    existing.dailyReflection ?? existing.notes ?? ''
  )
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const checkIn = participant?.dailyCheckIns?.[selectedDate] || {}
    setUsedAI(checkIn.usedAI ?? '')
    setHadIncident(checkIn.hadIncident ?? '')
    setNoIncidentReason(checkIn.noIncidentReason ?? '')
    setRelatedEvents(checkIn.relatedEvents ?? '')
    setDailyReflection(checkIn.dailyReflection ?? checkIn.notes ?? '')
    setSaved(false)
  }, [participantName, selectedDate, participant])

  function validate() {
    const next = {}
    if (!usedAI) {
      next.usedAI = 'Please indicate whether you used AI on this day.'
    }
    if (!hadIncident) {
      next.hadIncident =
        'Please indicate whether you had an incident on this day.'
    }
    if (hadIncident === 'No' && !noIncidentReason) {
      next.noIncidentReason =
        'Please select a reason when you had no incident.'
    }
    if (!relatedEvents.trim()) {
      next.relatedEvents =
        'Please briefly describe related events, or enter 无 / None if there were none.'
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
      date: selectedDate,
      studyDay,
      usedAI,
      hadIncident,
      noIncidentReason: hadIncident === 'No' ? noIncidentReason : '',
      relatedEvents: relatedEvents.trim(),
      dailyReflection: dailyReflection.trim(),
      completedAt: existing.completedAt || now,
      updatedAt: now,
    }
    const updated = {
      ...participantData,
      dailyCheckIns: {
        ...participantData.dailyCheckIns,
        [selectedDate]: checkIn,
      },
    }
    saveParticipant(participantName, updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const incidentCount = (participant?.incidents?.[selectedDate] || []).length
  const dayLabel = isPastDay ? 'this day' : 'today'

  return (
    <div className="card">
      <div className="study-day-banner">
        <strong>Study day {Math.min(Math.max(studyDay, 1), STUDY_DAYS)} of {STUDY_DAYS}</strong>
        <span>{formatDisplayDate(selectedDate)}</span>
        {isPastDay && <span className="progress-badge partial">Editing past day</span>}
      </div>

      <h2>Daily check-in</h2>
      <p className="instructions">
        Over the next 7 days, please record your everyday interactions with AI
        agents or intelligent systems. We are especially interested in moments
        when an AI agent misunderstood your task, lacked important context, made
        an uncomfortable assumption, acted unexpectedly, or failed to meet your
        expectations.
      </p>
      <p className="instructions">
        If nothing notable happened, that is still useful. Please complete the
        daily check-in and mark that no incident occurred.
      </p>

      {saved && (
        <p className="success-message" role="status">
          Check-in saved for {formatDisplayDate(selectedDate)}.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="required">
            Did you use any AI agent or intelligent system on this day?
          </label>
          <div className="radio-group">
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
          </div>
          {errors.usedAI && <p className="error-message">{errors.usedAI}</p>}
        </div>

        <div className="form-group">
          <label className="required">
            Did you encounter any AI misunderstanding, failure, discomfort,
            boundary issue, or situation where the agent did not meet your
            expectation?
          </label>
          <div className="radio-group">
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
          </div>
          {errors.hadIncident && (
            <p className="error-message">{errors.hadIncident}</p>
          )}
        </div>

        {hadIncident === 'No' && (
          <div className="form-group">
            <label className="required" htmlFor="noIncidentReason">
              If no incident happened on this day, what was the reason?
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
          </div>
        )}

        <div className="form-group">
          <label className="required" htmlFor="relatedEvents">
            Brief description of related events on this day
          </label>
          <p className="hint">
            Summarize any AI-related events for this day. If there were none,
            enter <strong>None</strong> or <strong>无</strong>.
          </p>
          <textarea
            id="relatedEvents"
            value={relatedEvents}
            onChange={(e) => setRelatedEvents(e.target.value)}
            placeholder="e.g. Used ChatGPT for email drafting; asked Siri for directions… or: None"
            rows={4}
          />
          {errors.relatedEvents && (
            <p className="error-message">{errors.relatedEvents}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dailyReflection">Brief daily reflection (optional)</label>
          <p className="hint reflection-hint">{REFLECTION_HINT}</p>
          <textarea
            id="dailyReflection"
            className="large"
            value={dailyReflection}
            onChange={(e) => setDailyReflection(e.target.value)}
            placeholder="Paste a ChatGPT share link, or use the summary format described above."
          />
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary">
            Save check-in
          </button>
          {hadIncident === 'Yes' && (
            <Link
              to={`/incidents/${selectedDate}/new`}
              className="btn btn-secondary"
            >
              Add incident report
            </Link>
          )}
          <Link to="/progress" className="btn btn-secondary">
            Back to progress
          </Link>
        </div>
      </form>

      {hadIncident === 'Yes' && incidentCount > 0 && (
        <p className="hint" style={{ marginTop: '1rem' }}>
          You have {incidentCount} incident report
          {incidentCount !== 1 ? 's' : ''} for {dayLabel}.{' '}
          <Link to={`/incidents/${selectedDate}`}>View incidents</Link>
        </p>
      )}
    </div>
  )
}
