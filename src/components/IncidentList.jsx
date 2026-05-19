import { Link } from 'react-router-dom'
import { formatDateISO, formatDisplayDate } from '../utils/dates'
import { getParticipant } from '../utils/storage'

export default function IncidentList({ participantName, dateISO, onDelete }) {
  const selectedDate = dateISO || formatDateISO()
  const today = formatDateISO()
  const isPastDay = selectedDate !== today
  const participant = getParticipant(participantName)
  const incidents = participant?.incidents?.[selectedDate] || []

  return (
    <div className="card">
      <h2>Incident reports — {formatDisplayDate(selectedDate)}</h2>
      {isPastDay && (
        <p className="hint">
          Viewing incidents for a past study day.{' '}
          <Link to="/progress">Back to study progress</Link>
        </p>
      )}
      <div className="instructions">
        <p>
          You do not need to write perfect sentences. Short notes, copied chat
          logs, or rough descriptions are fine. Please focus on what you wanted
          the agent to do, what the agent did, what it failed to understand, and
          what you wish it had done instead.
        </p>
      </div>

      {incidents.length === 0 ? (
        <p>No incident reports for this day yet.</p>
      ) : (
        incidents.map((inc) => (
          <div   key={inc.id} className="incident-item">
            <h4>{inc.title || 'Untitled incident'}</h4>
            <p className="meta">
              {inc.agent} · {inc.location || '—'} · {inc.time || '—'}
            </p>
            <p>
              {inc.whatWentWrong?.slice(0, 150)}
              {inc.whatWentWrong?.length > 150 ? '…' : ''}
            </p>
            <div className="btn-group">
              <Link
                to={`/incidents/${selectedDate}/edit/${inc.id}`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(inc.id, selectedDate)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      <div className="btn-group">
        <Link
          to={`/incidents/${selectedDate}/new`}
          className="btn btn-primary"
        >
          Add incident report
        </Link>
        <Link to="/progress" className="btn btn-secondary">
          Study progress
        </Link>
      </div>
    </div>
  )
}
