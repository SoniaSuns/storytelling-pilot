import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  INCIDENT_AGENTS,
  LOCATIONS,
  KNOWLEDGE_SOURCES,
  REPAIR_ACTIONS,
  DESIRED_BEHAVIORS,
  FEELINGS,
} from '../utils/constants'
import { formatDateISO } from '../utils/dates'
import { getParticipant, saveParticipant } from '../utils/storage'

const emptyForm = () => ({
  title: '',
  time: '',
  location: '',
  agent: '',
  task: '',
  wantedAgentToDo: '',
  userInput: '',
  agentResponse: '',
  whatWentWrong: '',
  failedToUnderstand: '',
  shouldHaveKnown: '',
  whyShouldKnow: '',
  knowledgeSources: [],
  humanWouldUnderstand: '',
  comfortableWithUse: '',
  repairActions: [],
  repairDifficulty: '',
  desiredBehaviors: [],
  idealResponse: '',
  seriousness: '',
  feelings: [],
  futureUseImpact: '',
  willingToDiscuss: '',
  rawNotes: '',
})

export default function IncidentReportForm({
  participantName,
  incidentId = null,
  dateISO = null,
}) {
  const navigate = useNavigate()
  const today = dateISO || formatDateISO()
  const participant = getParticipant(participantName)
  const existingList = participant?.incidents?.[today] || []
  const existing = incidentId
    ? existingList.find((i) => i.id === incidentId)
    : null

  const [form, setForm] = useState(() =>
    existing ? { ...emptyForm(), ...existing } : emptyForm()
  )
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleArray(field, value) {
    setForm((prev) => {
      const arr = prev[field]
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      }
    })
  }

  function validate() {
    const next = {}
    if (!form.agent) next.agent = 'Required.'
    if (!form.task.trim()) next.task = 'Required.'
    if (!form.wantedAgentToDo.trim()) next.wantedAgentToDo = 'Required.'
    if (!form.agentResponse.trim()) next.agentResponse = 'Required.'
    if (!form.whatWentWrong.trim()) next.whatWentWrong = 'Required.'
    if (!form.failedToUnderstand.trim()) next.failedToUnderstand = 'Required.'
    if (!form.shouldHaveKnown.trim()) next.shouldHaveKnown = 'Required.'
    if (form.desiredBehaviors.length === 0) {
      next.desiredBehaviors = 'Select at least one.'
    }
    if (!form.seriousness) next.seriousness = 'Required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const now = new Date().toISOString()
    const id = existing?.id || `incident_${Date.now()}`
    const incident = {
      ...form,
      id,
      repairDifficulty: form.repairDifficulty ? Number(form.repairDifficulty) : null,
      seriousness: Number(form.seriousness),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    const list = [...existingList]
    const idx = list.findIndex((i) => i.id === id)
    if (idx >= 0) list[idx] = incident
    else list.push(incident)

    saveParticipant(participantName, {
      ...participant,
      incidents: { ...participant.incidents, [today]: list },
    })
    navigate(`/incidents/${today}`)
  }

  return (
    <div className="card">
      <h2>{existing ? 'Edit incident report' : 'New incident report'}</h2>
      <p className="hint">Date: {today}</p>
      <div className="instructions">
        <p>
          You do not need to write perfect sentences. Short notes, copied chat logs,
          or rough descriptions are fine. Please focus on what you wanted the agent
          to do, what the agent did, what it failed to understand, and what you wish
          it had done instead.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <h3>Section A: Basic information</h3>
        <div className="form-group">
          <label htmlFor="title">Incident title (optional)</label>
          <input id="title" type="text" value={form.title} onChange={(e) => setField('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="time">Approximate time (optional)</label>
          <input id="time" type="text" value={form.time} onChange={(e) => setField('time', e.target.value)} placeholder="e.g. Morning" />
        </div>
        <div className="form-group">
          <label>Location / situation (optional)</label>
          <select value={form.location} onChange={(e) => setField('location', e.target.value)}>
            <option value="">— Select —</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="required">AI agent / system used</label>
          <select value={form.agent} onChange={(e) => setField('agent', e.target.value)}>
            <option value="">— Select —</option>
            {INCIDENT_AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          {errors.agent && <p className="error-message">{errors.agent}</p>}
        </div>
        <div className="form-group">
          <label className="required" htmlFor="task">What task were you trying to complete?</label>
          <textarea id="task" value={form.task} onChange={(e) => setField('task', e.target.value)} />
          {errors.task && <p className="error-message">{errors.task}</p>}
        </div>

        <h3>Section B: What happened?</h3>
        <div className="form-group">
          <label className="required" htmlFor="wantedAgentToDo">What did you want the AI agent to do?</label>
          <textarea id="wantedAgentToDo" value={form.wantedAgentToDo} onChange={(e) => setField('wantedAgentToDo', e.target.value)} />
          {errors.wantedAgentToDo && <p className="error-message">{errors.wantedAgentToDo}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="userInput">What did you say, type, show, or input?</label>
          <textarea id="userInput" value={form.userInput} onChange={(e) => setField('userInput', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="required" htmlFor="agentResponse">What did the AI agent do or respond?</label>
          <textarea id="agentResponse" value={form.agentResponse} onChange={(e) => setField('agentResponse', e.target.value)} />
          {errors.agentResponse && <p className="error-message">{errors.agentResponse}</p>}
        </div>
        <div className="form-group">
          <label className="required" htmlFor="whatWentWrong">What felt wrong, unexpected, uncomfortable, or incorrect?</label>
          <textarea id="whatWentWrong" value={form.whatWentWrong} onChange={(e) => setField('whatWentWrong', e.target.value)} />
          {errors.whatWentWrong && <p className="error-message">{errors.whatWentWrong}</p>}
        </div>

        <h3>Section C: Expected contextual knowledge</h3>
        <div className="form-group">
          <label className="required" htmlFor="failedToUnderstand">What do you think the AI agent failed to understand?</label>
          <textarea id="failedToUnderstand" value={form.failedToUnderstand} onChange={(e) => setField('failedToUnderstand', e.target.value)} />
          {errors.failedToUnderstand && <p className="error-message">{errors.failedToUnderstand}</p>}
        </div>
        <div className="form-group">
          <label className="required" htmlFor="shouldHaveKnown">What information should the agent have known?</label>
          <textarea id="shouldHaveKnown" value={form.shouldHaveKnown} onChange={(e) => setField('shouldHaveKnown', e.target.value)} />
          {errors.shouldHaveKnown && <p className="error-message">{errors.shouldHaveKnown}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="whyShouldKnow">Why should the agent have known this?</label>
          <textarea id="whyShouldKnow" value={form.whyShouldKnow} onChange={(e) => setField('whyShouldKnow', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Where should this information have come from?</label>
          <div className="checkbox-group">
            {KNOWLEDGE_SOURCES.map((s) => (
              <label key={s}>
                <input type="checkbox" checked={form.knowledgeSources.includes(s)} onChange={() => toggleArray('knowledgeSources', s)} />
                {s}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Would a human nearby have understood the situation?</label>
          <div className="inline-options">
            {['Yes', 'No', 'Not sure'].map((v) => (
              <label key={v}>
                <input type="radio" name="humanWouldUnderstand" value={v} checked={form.humanWouldUnderstand === v} onChange={() => setField('humanWouldUnderstand', v)} />
                {v}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Comfortable with the agent using this information?</label>
          <div className="inline-options">
            {['Yes', 'No', 'It depends'].map((v) => (
              <label key={v}>
                <input type="radio" name="comfortableWithUse" value={v} checked={form.comfortableWithUse === v} onChange={() => setField('comfortableWithUse', v)} />
                {v}
              </label>
            ))}
          </div>
        </div>

        <h3>Section D: Repair and desired behavior</h3>
        <div className="form-group">
          <label>How did you respond or fix the problem?</label>
          <div className="checkbox-group">
            {REPAIR_ACTIONS.map((a) => (
              <label key={a}>
                <input type="checkbox" checked={form.repairActions.includes(a)} onChange={() => toggleArray('repairActions', a)} />
                {a}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Repair difficulty (1 = not difficult, 5 = very difficult)</label>
          <div className="scale-group">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n}>
                <input type="radio" name="repairDifficulty" value={n} checked={String(form.repairDifficulty) === String(n)} onChange={() => setField('repairDifficulty', n)} />
                {n}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="required">What should the agent have done instead?</label>
          <div className="checkbox-group">
            {DESIRED_BEHAVIORS.map((b) => (
              <label key={b}>
                <input type="checkbox" checked={form.desiredBehaviors.includes(b)} onChange={() => toggleArray('desiredBehaviors', b)} />
                {b}
              </label>
            ))}
          </div>
          {errors.desiredBehaviors && <p className="error-message">{errors.desiredBehaviors}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="idealResponse">Ideal response the agent should have said</label>
          <textarea id="idealResponse" value={form.idealResponse} onChange={(e) => setField('idealResponse', e.target.value)} />
        </div>

        <h3>Section E: Impact</h3>
        <div className="form-group">
          <label className="required">How serious was this incident? (1 = very minor, 5 = very serious)</label>
          <div className="scale-group">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n}>
                <input type="radio" name="seriousness" value={n} checked={String(form.seriousness) === String(n)} onChange={() => setField('seriousness', n)} />
                {n}
              </label>
            ))}
          </div>
          {errors.seriousness && <p className="error-message">{errors.seriousness}</p>}
        </div>
        <div className="form-group">
          <label>How did it make you feel?</label>
          <div className="checkbox-group">
            {FEELINGS.map((f) => (
              <label key={f}>
                <input type="checkbox" checked={form.feelings.includes(f)} onChange={() => toggleArray('feelings', f)} />
                {f}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Affected willingness to use this agent again?</label>
          <div className="radio-group">
            {['No', 'Slightly', 'Moderately', 'Strongly'].map((v) => (
              <label key={v}>
                <input type="radio" name="futureUseImpact" value={v} checked={form.futureUseImpact === v} onChange={() => setField('futureUseImpact', v)} />
                {v}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Willing to discuss in follow-up interview?</label>
          <div className="inline-options">
            {['Yes', 'No'].map((v) => (
              <label key={v}>
                <input type="radio" name="willingToDiscuss" value={v} checked={form.willingToDiscuss === v} onChange={() => setField('willingToDiscuss', v)} />
                {v}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="rawNotes">Optional raw material</label>
          <textarea id="rawNotes" className="large" value={form.rawNotes} onChange={(e) => setField('rawNotes', e.target.value)} placeholder="Paste notes, chat logs, screenshot descriptions, links..." />
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary">{existing ? 'Save changes' : 'Save incident report'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/incidents')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
