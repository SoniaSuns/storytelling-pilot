import { Link } from 'react-router-dom'
import { formatDateISO, formatDisplayDate } from '../utils/dates'
import { getParticipant } from '../utils/storage'

export default function IncidentList({
  participantName,
  dateISO = null,
  onDelete,
}) {
  const today = dateISO || formatDateISO()
  const participant = getParticipant(participantName)
  const incidents = participant?.incidents?.[today] || []

  return (
    <div className="card">
      <h2>Incident reports — {formatDisplayDate(today)}</h2>
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
          <div key={inc.id} className="incident-item">
            <h4>{inc.title || 'Untitled incident'}</h4>
            <p className="meta">
              {inc.agent} · {inc.location || 'Location not specified'} ·{' '}
              {inc.time || 'Time not specified'}
            </p>
            <p>{inc.whatWentWrong?.slice(0, 120)}
              {inc.whatWentWrong?.length > 120 ? '…' : ''}
            </p>
            <div className="btn-group">
              <Link
                to={`/incidents/edit/${inc.id}`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(inc.id, today)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      <div className="btn-group">
        <Link to="/incidents/new" className="btn btn-primary">
          Add incident report
        </Link>
      </div>
    </div>
  )
}
