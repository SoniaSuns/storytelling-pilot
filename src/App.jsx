import { useState, useCallback } from 'react'
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom'
import PrivacyNotice from './components/PrivacyNotice'
import Navigation from './components/Navigation'
import ParticipantSelector from './components/ParticipantSelector'
import ParticipantSetup from './components/ParticipantSetup'
import DailyCheckIn from './components/DailyCheckIn'
import StudyProgress from './components/StudyProgress'
import IncidentList from './components/IncidentList'
import IncidentReportForm from './components/IncidentReportForm'
import ExportControls from './components/ExportControls'
import DataManagement from './components/DataManagement'
import {
  getActiveParticipantName,
  setActiveParticipantName,
  getParticipant,
  getParticipantNames,
  saveParticipant,
} from './utils/storage'
import { formatDateISO } from './utils/dates'

function SetupPage({ onParticipantReady }) {
  const navigate = useNavigate()
  const names = getParticipantNames()
  const [mode, setMode] = useState(names.length > 0 ? 'select' : 'create')

  function handleSelect(name) {
    setActiveParticipantName(name)
    onParticipantReady(name)
    navigate('/check-in')
  }

  function handleComplete(name) {
    onParticipantReady(name)
    navigate('/check-in')
  }

  return (
    <>
      <header className="app-header">
        <h1>HCI Diary Study</h1>
        <p className="subtitle">
          Everyday AI-agent failures &amp; contextual intelligence (7 days)
        </p>
      </header>
      <PrivacyNotice />
      {mode === 'select' ? (
        <ParticipantSelector
          onSelect={handleSelect}
          onCreateNew={() => setMode('create')}
        />
      ) : (
        <ParticipantSetup onComplete={handleComplete} />
      )}
    </>
  )
}

function IncidentEditPage({ participantName }) {
  const { incidentId } = useParams()
  return (
    <IncidentReportForm
      participantName={participantName}
      incidentId={incidentId}
      dateISO={formatDateISO()}
    />
  )
}

function MainLayout({ participantName, onParticipantChange }) {
  const navigate = useNavigate()
  const today = formatDateISO()

  const handleDeleteIncident = useCallback(
    (incidentId, dateISO) => {
      if (
        !window.confirm(
          'Delete this incident report? This cannot be undone.'
        )
      ) {
        return
      }
      const participant = getParticipant(participantName)
      const list = participant.incidents?.[dateISO] || []
      const filtered = list.filter((i) => i.id !== incidentId)
      const updated = {
        ...participant,
        incidents: { ...participant.incidents },
      }
      if (filtered.length === 0) {
        delete updated.incidents[dateISO]
      } else {
        updated.incidents[dateISO] = filtered
      }
      saveParticipant(participantName, updated)
      onParticipantChange()
    },
    [participantName, onParticipantChange]
  )

  return (
    <>
      <header className="app-header">
        <h1>HCI Diary Study</h1>
        <p className="subtitle">Participant: {participantName}</p>
      </header>
      <PrivacyNotice />
      <Navigation />
      <Routes>
        <Route
          path="/check-in"
          element={<DailyCheckIn participantName={participantName} />}
        />
        <Route
          path="/progress"
          element={<StudyProgress participantName={participantName} />}
        />
        <Route
          path="/incidents"
          element={
            <IncidentList
              participantName={participantName}
              dateISO={today}
              onDelete={handleDeleteIncident}
            />
          }
        />
        <Route
          path="/incidents/new"
          element={
            <IncidentReportForm
              participantName={participantName}
              dateISO={today}
            />
          }
        />
        <Route
          path="/incidents/edit/:incidentId"
          element={<IncidentEditPage participantName={participantName} />}
        />
        <Route
          path="/data"
          element={
            <>
              <ExportControls participantName={participantName} />
              <DataManagement
                onSwitchParticipant={(name) => {
                  setActiveParticipantName(name)
                  onParticipantChange(name)
                  navigate('/check-in')
                }}
                onCreateNew={() => navigate('/setup')}
              />
            </>
          }
        />
        <Route path="*" element={<Navigate to="/check-in" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  const [participantName, setParticipantName] = useState(() =>
    getActiveParticipantName()
  )

  const participant = participantName
    ? getParticipant(participantName)
    : null
  const isReady = Boolean(participantName && participant)

  return (
    <HashRouter>
      <div className="app-shell">
        <Routes>
          <Route
            path="/setup"
            element={
              <SetupPage
                onParticipantReady={(name) => setParticipantName(name)}
              />
            }
          />
          <Route
            path="/*"
            element={
              isReady ? (
                <MainLayout
                  participantName={participantName}
                  onParticipantChange={setParticipantName}
                />
              ) : (
                <Navigate to="/setup" replace />
              )
            }
          />
        </Routes>
      </div>
    </HashRouter>
  )
}
