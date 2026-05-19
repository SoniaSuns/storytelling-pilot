import { getParticipantNames } from '../utils/storage'

export default function ParticipantSelector({ onSelect, onCreateNew }) {
  const names = getParticipantNames()

  return (
    <div className="card">
      <h2>Continue as existing participant</h2>
      {names.length === 0 ? (
        <p>No participants found. Please create a new profile.</p>
      ) : (
        <ul className="participant-list">
          {names.map((name) => (
            <li key={name}>
              <button type="button" onClick={() => onSelect(name)}>
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="btn-group">
        <button type="button" className="btn btn-primary" onClick={onCreateNew}>
          Create new participant
        </button>
      </div>
    </div>
  )
}
