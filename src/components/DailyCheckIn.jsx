import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NO_INCIDENT_REASONS } from '../utils/constants'
import {
  formatDateISO,
  formatDisplayDate,
  getStudyDayNumber,
  STUDY_DAYS,
  isDateInStudyRange,
} from '../utils/dates'
import { getParticipant, saveParticipant } from '../utils/storage'

export default function DailyCheckIn({ participantName }) {
  const today = formatDateISO()
  const participant = getParticipant(participantName)
  const profile = participant?.profile
  const studyStartDate = profile?.studyStartDate || today
  const studyDay = getStudyDayNumber(studyStartDate, today)
  const inRange = isDateInStudyRange(studyStartDate, today)
  const existing = participant?.dailyCheckIns?.[today]

  const [usedAI, setUsedAI] = useState(existing?.usedAI || '')
  const [hadIncident, setHadIncident] = useState(existing?.hadIncident || '')
  const [noIncidentReason, setNoIncidentReason] = useState(
    existing?.noIncidentReason || ''
  )
  const [dailyReflection, setDailyReflection] = useState(
    existing?.dailyReflection || ''
  )
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (existing) {
      setUsedAI(existing.usedAI || '')
      setHadIncident(existing.hadIncident || '')
      setNoIncidentReason(existing.noIncidentReason || '')
      setDailyReflection(existing.dailyReflection || '')
    }
  }, [participantName, today])

  function validate() {
    const next = {}
    if (!usedAI) next.usedAI = 'Please answer whether you used AI today.'
    if (!hadIncident) next.hadIncident = 'Please answer whether an incident occurred.'
    if (hadIncident === 'No' && !noIncidentReason) {
      next.noIncidentReason = 'Please select a reason.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const now = new Date().toISOString()
    const checkIn = {
      date: today,
      studyDay: inRange ? studyDay : studyDay,
      usedAI,
      hadIncident,
      noIncidentReason: hadIncident === 'No' ? noIncidentReason : '',
      dailyReflection: dailyReflection.trim(),
      completedAt: existing?.completedAt || now,
      updatedAt: now,
    }

    const updated = {
      ...participant,
      dailyCheckIns: {
        ...participant.dailyCheckIns,
        [today]: checkIn,
      },
    }
    saveParticipant(participantName, updated)
    setSaved(true)
  }

  if (!profile) return null

  return (
    <>
      <div className="progress-banner">
        <span>
          <strong>{participantName}</strong>
        </span>
        <span>{formatDisplayDate(today)}</span>
        {inRange ? (
          <span className="progress-badge badge-completed">
            Day {studyDay} of {STUDY_DAYS}
          </span>
        ) : (
          <span className="progress-badge badge-pending">Outside 7-day window</span>
        )}
      </div>

      <div className="instructions">
        <p>
          Over the next 7 days, please record your everyday interactions with AI
          agents or intelligent systems. We are especially interested in moments
          when an AI agent misunderstood your task, lacked important context, made
          an uncomfortable assumption, acted unexpectedly, or failed to meet your
          expectations.
        </p>
        <p>
          If nothing notable happened today, that is still useful. Please complete
          the daily check-in and mark that no incident occurred.
        </p>
      </div>

      <div className="card">
        <h2>Daily check-in {existing ? '(editing)' : ''}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="required">
              Did you use any AI agent or intelligent system today?
            </label>
            <div className="radio-group">
              {['Yes', 'No'].map((v) => (
                <label key={v}>
                  <input
                    type="radio"
                    name="usedAI"
                    value={v}
                    checked={usedAI === v}
                    onChange={() => setUsedAI(v)}
                  />
                  {v}
                </label>
              ))}
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
              {['Yes', 'No'].map((v) => (
                <label key={v}>
                  <input
                    type="radio"
                    name="hadIncident"
                    value={v}
                    checked={hadIncident === v}
                    onChange={() => setHadIncident(v)}
                  />
                  {v}
                </label>
              ))}
            </div>
            {errors.hadIncident && (
              <p className="error-message">{errors.hadIncident}</p>
            )}
          </div>

          {hadIncident === 'No' && (
            <div className="form-group">
              <label className="required">
                If no incident happened today, what was the reason?
              </label>
              <div className="radio-group">
                {NO_INCIDENT_REASONS.map((r) => (
                  <label key={r}>
                    <input
                      type="radio"
                      name="noIncidentReason"
                      value={r}
                      checked={noIncidentReason === r}
                      onChange={() => setNoIncidentReason(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>
              {errors.noIncidentReason && (
                <p className="error-message">{errors.noIncidentReason}</p>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="dailyReflection">
              Brief daily reflection (optional)
            </label>
            <p className="hint">
              Is there anything you want to add about today&apos;s AI interactions?
            </p>
            <textarea
              id="dailyReflection"
              value={dailyReflection}
              onChange={(e) => setDailyReflection(e.target.value)}
            />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary">
              {existing ? 'Update check-in' : 'Complete today\'s check-in'}
            </button>
            {saved && hadIncident === 'Yes' && (
              <Link to="/incidents/new" className="btn btn-secondary">
                Add incident report
              </Link>
            )}
            {existing && hadIncident === 'Yes' && !saved && (
              <Link to="/incidents/new" className="btn btn-secondary">
                Add incident report
              </Link>
            )}
          </div>
          {saved && (
            <p className="success-message">
              Check-in saved. Today is marked as completed.
              {hadIncident === 'Yes' && ' You can add one or more incident reports.'}
            </p>
          )}
        </form>
      </div>
    </>
  )
}
