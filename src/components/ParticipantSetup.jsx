import { useState } from 'react'
import {
  AI_USAGE_FREQUENCIES,
  PROFILE_AGENTS,
  AGE_RANGES,
} from '../utils/constants'
import { formatDateISO } from '../utils/dates'
import {
  getParticipant,
  saveParticipant,
  setActiveParticipantName,
  createEmptyParticipant,
} from '../utils/storage'

export default function ParticipantSetup({ onComplete, existingName = null }) {
  const existing = existingName ? getParticipant(existingName) : null
  const profile = existing?.profile

  const [name, setName] = useState(profile?.name || '')
  const [participantId, setParticipantId] = useState(profile?.participantId || '')
  const [ageRange, setAgeRange] = useState(profile?.ageRange || '')
  const [occupation, setOccupation] = useState(profile?.occupation || '')
  const [aiUsageFrequency, setAiUsageFrequency] = useState(
    profile?.aiUsageFrequency || ''
  )
  const [commonlyUsedAgents, setCommonlyUsedAgents] = useState(
    profile?.commonlyUsedAgents || []
  )
  const [studyStartDate, setStudyStartDate] = useState(
    profile?.studyStartDate || formatDateISO()
  )
  const [errors, setErrors] = useState({})

  function toggleAgent(agent) {
    setCommonlyUsedAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent]
    )
  }

  function validate() {
    const next = {}
    if (!name.trim()) next.name = 'Participant name is required.'
    if (!aiUsageFrequency) next.aiUsageFrequency = 'Please select AI usage frequency.'
    if (!studyStartDate) next.studyStartDate = 'Study start date is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const trimmedName = name.trim()
    const newProfile = {
      name: trimmedName,
      participantId: participantId.trim(),
      ageRange,
      occupation: occupation.trim(),
      aiUsageFrequency,
      commonlyUsedAgents,
      studyStartDate,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const existingData = getParticipant(trimmedName)
    const participantData = existingData
      ? { ...existingData, profile: newProfile }
      : createEmptyParticipant(newProfile)

    saveParticipant(trimmedName, participantData)
    setActiveParticipantName(trimmedName)
    onComplete(trimmedName)
  }

  return (
    <div className="card">
      <h2>{existingName ? 'Edit participant profile' : 'Participant information'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="required" htmlFor="name">
            Participant name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!!existingName}
            autoComplete="name"
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="participantId">Participant ID (optional)</label>
          <input
            id="participantId"
            type="text"
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ageRange">Age range (optional)</label>
          <select
            id="ageRange"
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
          >
            <option value="">— Select —</option>
            {AGE_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="occupation">Occupation / role (optional)</label>
          <input
            id="occupation"
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="required">AI usage frequency</label>
          <div className="radio-group">
            {AI_USAGE_FREQUENCIES.map((freq) => (
              <label key={freq}>
                <input
                  type="radio"
                  name="aiUsageFrequency"
                  value={freq}
                  checked={aiUsageFrequency === freq}
                  onChange={() => setAiUsageFrequency(freq)}
                />
                {freq}
              </label>
            ))}
          </div>
          {errors.aiUsageFrequency && (
            <p className="error-message">{errors.aiUsageFrequency}</p>
          )}
        </div>

        <div className="form-group">
          <label>Commonly used AI agents / systems (optional)</label>
          <div className="checkbox-group">
            {PROFILE_AGENTS.map((agent) => (
              <label key={agent}>
                <input
                  type="checkbox"
                  checked={commonlyUsedAgents.includes(agent)}
                  onChange={() => toggleAgent(agent)}
                />
                {agent}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="required" htmlFor="studyStartDate">
            Study start date
          </label>
          <input
            id="studyStartDate"
            type="date"
            value={studyStartDate}
            onChange={(e) => setStudyStartDate(e.target.value)}
          />
          {errors.studyStartDate && (
            <p className="error-message">{errors.studyStartDate}</p>
          )}
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary">
            {existingName ? 'Save profile' : 'Start diary study'}
          </button>
        </div>
      </form>
    </div>
  )
}
