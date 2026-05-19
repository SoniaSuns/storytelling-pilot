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
          onSelect={(name) => {
            setActiveParticipantName(name)
            onParticipantReady(name)
            navigate('/check-in')
          }}
          onCreateNew={() => setMode('create')}
        />
      ) : (
        <ParticipantSetup
          onComplete={(name) => {
            onParticipantReady(name)
            navigate('/check-in')
          }}
        />
      )}
    </>
  )
}

function AppShell({ participantName, children }) {
  return (
    <>
      <header className="app-header">
        <h1>HCI Diary Study</h1>
        <p className="subtitle">Participant: {participantName}</p>
      </header>
      <PrivacyNotice />
      <Navigation />
      {children}
    </>
  )
}

function Guard({ participantName, children }) {
  if (!participantName || !getParticipant(participantName)) {
    return <Navigate to="/setup" replace />
  }
  return <AppShell participantName={participantName}>{children}</AppShell>
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

function AppRoutes() {
  const [participantName, setParticipantName] = useState(() =>
    getActiveParticipantName()
  )
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
      setParticipantName(getActiveParticipantName())
    },
    [participantName]
  )

  return (
    <div className="app-shell">
      <Routes>
        <Route
          path="/setup"
          element={
            <SetupPage onParticipantReady={setParticipantName} />
          }
        />
        <Route
          path="/check-in"
          element={
            <Guard participantName={participantName}>
              <DailyCheckIn participantName={participantName} />
            </Guard>
          }
        />
        <Route
          path="/progress"
          element={
            <Guard participantName={participantName}>
              <StudyProgress participantName={participantName} />
            </Guard>
          }
        />
        <Route
          path="/incidents"
          element={
            <Guard participantName={participantName}>
              <IncidentList
                participantName={participantName}
                dateISO={today}
                onDelete={handleDeleteIncident}
              />
            </Guard>
          }
        />
        <Route
          path="/incidents/new"
          element={
            <Guard participantName={participantName}>
              <IncidentReportForm
                participantName={participantName}
                dateISO={today}
              />
            </Guard>
          }
        />
        <Route
          path="/incidents/edit/:incidentId"
          element={
            <Guard participantName={participantName}>
              <IncidentEditPage participantName={participantName} />
            </Guard>
          }
        />
        <Route
          path="/data"
          element={
            <Guard participantName={participantName}>
              <ExportControls participantName={participantName} />
              <DataManagement
                onSwitchParticipant={(name) => {
                  setActiveParticipantName(name)
                  setParticipantName(name)
                  navigate('/check-in')
                }}
                onCreateNew={() => navigate('/setup')}
              />
            </Guard>
          }
        />
        <Route
          path="/"
          element={
            participantName && getParticipant(participantName) ? (
              <Navigate to="/check-in" replace />
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
