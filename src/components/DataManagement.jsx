import { useNavigate } from 'react-router-dom'
import {
  clearAllData,
  setActiveParticipantName,
  getParticipantNames,
} from '../utils/storage'

export default function DataManagement({ onSwitchParticipant, onCreateNew }) {
  const navigate = useNavigate()
  const names = getParticipantNames()

  function handleClear() {
    const confirmed = window.confirm(
      'This will permanently remove all diary data stored in this browser.\n\nAre you sure you want to continue?'
    )
    if (confirmed) {
      clearAllData()
      navigate('/setup')
      window.location.reload()
    }
  }

  return (
    <div className="card">
      <h2>Participant & data management</h2>

      <h3>Switch participant</h3>
      {names.length === 0 ? (
        <p>No other participants stored.</p>
      ) : (
        <ul className="participant-list">
          {names.map((name) => (
            <li key={name}>
              <button type="button" onClick={() => onSwitchParticipant(name)}>
                Continue as {name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="btn-group">
        <button type="button" className="btn btn-secondary" onClick={onCreateNew}>
          Create new participant
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setActiveParticipantName('')
            navigate('/setup')
          }}
        >
          Back to setup
        </button>
      </div>

      <h3>Clear all data</h3>
      <p className="hint">
        This will permanently remove all diary data stored in this browser.
      </p>
      <button type="button" className="btn btn-danger" onClick={handleClear}>
        Clear Local Data
      </button>
    </div>
  )
}
