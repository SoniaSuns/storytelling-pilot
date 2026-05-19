import { getParticipant } from '../utils/storage'
import { exportParticipantData, exportAllData } from '../utils/export'

export default function ExportControls({ participantName }) {
  function handleExportMine() {
    const data = getParticipant(participantName)
    if (data) {
      exportParticipantData(participantName, data)
    }
  }

  return (
    <div className="card">
      <h2>Export data</h2>
      <p className="hint" style={{ marginBottom: '1rem' }}>
        Download your diary entries as JSON files to share with the researcher.
      </p>
      <div className="btn-group">
        <button type="button" className="btn btn-primary" onClick={handleExportMine}>
          Export My Data
        </button>
        <button type="button" className="btn btn-secondary" onClick={exportAllData}>
          Export All Local Data
        </button>
      </div>
    </div>
  )
}
