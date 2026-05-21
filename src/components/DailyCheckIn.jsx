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
import { useI18n } from '../i18n/LanguageContext'
import ReflectionAttachments from './ReflectionAttachments'

export default function DailyCheckIn({ participantName, dateISO: dateProp }) {
  const { t, tOption, locale } = useI18n()
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
  const [reflectionFiles, setReflectionFiles] = useState(
    existing.reflectionFiles ?? []
  )
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const checkIn =
      getParticipant(participantName)?.dailyCheckIns?.[selectedDate] || {}
    setUsedAI(checkIn.usedAI ?? '')
    setHadIncident(checkIn.hadIncident ?? '')
    setNoIncidentReason(checkIn.noIncidentReason ?? '')
    setRelatedEvents(checkIn.relatedEvents ?? '')
    setDailyReflection(checkIn.dailyReflection ?? checkIn.notes ?? '')
    setReflectionFiles(checkIn.reflectionFiles ?? [])
    setErrors({})
    setSaved(false)
  }, [participantName, selectedDate])

  function validate() {
    const next = {}
    if (!usedAI) next.usedAI = t('checkIn.errUsedAI')
    if (!hadIncident) next.hadIncident = t('checkIn.errHadIncident')
    if (hadIncident === 'No' && !noIncidentReason) {
      next.noIncidentReason = t('checkIn.errNoReason')
    }
    if (!relatedEvents.trim()) next.relatedEvents = t('checkIn.errRelated')
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
      reflectionFiles,
      completedAt: existing.completedAt || now,
      updatedAt: now,
    }
    saveParticipant(participantName, {
      ...participantData,
      dailyCheckIns: {
        ...participantData.dailyCheckIns,
        [selectedDate]: checkIn,
      },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const incidentCount = (participant?.incidents?.[selectedDate] || []).length
  const dayLabel = isPastDay ? t('common.thisDay') : t('common.today')
  const displayDate = formatDisplayDate(selectedDate, locale)

  return (
    <div className="card">
      <div className="study-day-banner">
        <strong>
          {t('checkIn.studyDay', {
            day: Math.min(Math.max(studyDay, 1), STUDY_DAYS),
            total: STUDY_DAYS,
          })}
        </strong>
        <span>{displayDate}</span>
        {isPastDay && (
          <span className="progress-badge partial">{t('checkIn.editingPast')}</span>
        )}
      </div>

      <h2>{t('checkIn.title')}</h2>
      <p className="instructions">{t('checkIn.intro1')}</p>
      <p className="instructions">{t('checkIn.intro2')}</p>

      {saved && (
        <p className="success-message" role="status">
          {t('checkIn.saved', { date: displayDate })}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset className="form-group">
          <legend className="field-legend required">{t('checkIn.usedAI')}</legend>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="usedAI"
                value="Yes"
                checked={usedAI === 'Yes'}
                onChange={() => setUsedAI('Yes')}
              />
              {t('common.yes')}
            </label>
            <label>
              <input
                type="radio"
                name="usedAI"
                value="No"
                checked={usedAI === 'No'}
                onChange={() => setUsedAI('No')}
              />
              {t('common.no')}
            </label>
          </div>
          {errors.usedAI && <p className="error-message">{errors.usedAI}</p>}
        </fieldset>

        <fieldset className="form-group">
          <legend className="field-legend required">{t('checkIn.hadIncident')}</legend>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="hadIncident"
                value="Yes"
                checked={hadIncident === 'Yes'}
                onChange={() => setHadIncident('Yes')}
              />
              {t('common.yes')}
            </label>
            <label>
              <input
                type="radio"
                name="hadIncident"
                value="No"
                checked={hadIncident === 'No'}
                onChange={() => setHadIncident('No')}
              />
              {t('common.no')}
            </label>
          </div>
          {errors.hadIncident && (
            <p className="error-message">{errors.hadIncident}</p>
          )}
        </fieldset>

        {hadIncident === 'No' && (
          <div className="form-group">
            <label className="required" htmlFor="noIncidentReason">
              {t('checkIn.noIncidentReason')}
            </label>
            <select
              id="noIncidentReason"
              value={noIncidentReason}
              onChange={(e) => setNoIncidentReason(e.target.value)}
            >
              <option value="">{t('common.select')}</option>
              {NO_INCIDENT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {tOption('noIncident', r)}
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
            {t('checkIn.relatedEvents')}
          </label>
          <p className="hint">{t('checkIn.relatedEventsHint')}</p>
          <textarea
            id="relatedEvents"
            value={relatedEvents}
            onChange={(e) => setRelatedEvents(e.target.value)}
            placeholder={t('checkIn.relatedEventsPlaceholder')}
            rows={4}
          />
          {errors.relatedEvents && (
            <p className="error-message">{errors.relatedEvents}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dailyReflection">{t('checkIn.reflection')}</label>
          <p className="hint reflection-hint">{t('checkIn.reflectionHint')}</p>
          <textarea
            id="dailyReflection"
            className="large"
            value={dailyReflection}
            onChange={(e) => setDailyReflection(e.target.value)}
            placeholder={t('checkIn.reflectionPlaceholder')}
          />
        </div>

        <ReflectionAttachments
          participantName={participantName}
          dateISO={selectedDate}
          files={reflectionFiles}
          onChange={setReflectionFiles}
        />

        <div className="btn-group">
          <button type="submit" className="btn btn-primary">
            {t('checkIn.saveCheckIn')}
          </button>
          {hadIncident === 'Yes' && (
            <Link
              to={`/incidents/${selectedDate}/new`}
              className="btn btn-secondary"
            >
              {t('checkIn.addIncident')}
            </Link>
          )}
          <Link to="/progress" className="btn btn-secondary">
            {t('checkIn.backProgress')}
          </Link>
        </div>
      </form>

      {hadIncident === 'Yes' && incidentCount > 0 && (
        <p className="hint" style={{ marginTop: '1rem' }}>
          {t('checkIn.incidentCount', { count: incidentCount, day: dayLabel })}{' '}
          <Link to={`/incidents/${selectedDate}`}>{t('checkIn.viewIncidents')}</Link>
        </p>
      )}
    </div>
  )
}
