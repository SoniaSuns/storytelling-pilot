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
import { formatDateISO, isStudyDateISO } from './utils/dates'
import { useI18n } from './i18n/LanguageContext'
import LanguageSwitcher from './components/LanguageSwitcher'

function SetupPage({ onParticipantReady }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const names = getParticipantNames()
  const [mode, setMode] = useState(names.length > 0 ? 'select' : 'create')

  return (
    <>
      <header className="app-header">
        <div className="header-row">
          <div>
            <h1>{t('app.title')}</h1>
            <p className="subtitle">{t('app.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <PrivacyNotice />
      {mode === 'select' ? (
        <ParticipantSelector
          onSelect={(name) => {
            setActiveParticipantName(name)
            onParticipantReady(name)
            navigate(`/check-in/${formatDateISO()}`)
          }}
          onCreateNew={() => setMode('create')}
        />
      ) : (
        <ParticipantSetup
          onComplete={(name) => {
            onParticipantReady(name)
            navigate(`/check-in/${formatDateISO()}`)
          }}
        />
      )}
    </>
  )
}

function AppShell({ participantName, children }) {
  const { t } = useI18n()
  return (
    <>
      <header className="app-header">
        <div className="header-row">
          <div>
            <h1>{t('app.title')}</h1>
            <p className="subtitle">
              {t('app.subtitleParticipant', { name: participantName })}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
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

function StudyDateGuard({ participantName, dateISO, children }) {
  const participant = getParticipant(participantName)
  const studyStartDate = participant?.profile?.studyStartDate
  if (!isStudyDateISO(studyStartDate, dateISO)) {
    return <Navigate to="/progress" replace />
  }
  return children
}

function CheckInPage({ participantName }) {
  const { dateISO } = useParams()
  const resolved = dateISO || formatDateISO()
  return (
    <StudyDateGuard participantName={participantName} dateISO={resolved}>
      <DailyCheckIn participantName={participantName} dateISO={resolved} />
    </StudyDateGuard>
  )
}

function IncidentsPage({ participantName, onDelete }) {
  const { dateISO } = useParams()
  const resolved = dateISO || formatDateISO()
  return (
    <StudyDateGuard participantName={participantName} dateISO={resolved}>
      <IncidentList
        participantName={participantName}
        dateISO={resolved}
        onDelete={onDelete}
      />
    </StudyDateGuard>
  )
}

function IncidentNewPage({ participantName }) {
  const { dateISO } = useParams()
  return (
    <StudyDateGuard participantName={participantName} dateISO={dateISO}>
      <IncidentReportForm
        participantName={participantName}
        dateISO={dateISO}
      />
    </StudyDateGuard>
  )
}

function IncidentEditPage({ participantName }) {
  const { dateISO, incidentId } = useParams()
  return (
    <StudyDateGuard participantName={participantName} dateISO={dateISO}>
      <IncidentReportForm
        participantName={participantName}
        incidentId={incidentId}
        dateISO={dateISO}
      />
    </StudyDateGuard>
  )
}

function AppRoutes() {
  const { t } = useI18n()
  const [participantName, setParticipantName] = useState(() =>
    getActiveParticipantName()
  )
  const navigate = useNavigate()
  const today = formatDateISO()

  const handleDeleteIncident = useCallback(
    (incidentId, dateISO) => {
      if (!window.confirm(t('incidents.deleteConfirm'))) {
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
    [participantName, t]
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
          element={<Navigate to={`/check-in/${today}`} replace />}
        />
        <Route
          path="/check-in/:dateISO"
          element={
            <Guard participantName={participantName}>
              <CheckInPage participantName={participantName} />
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
          element={<Navigate to={`/incidents/${today}`} replace />}
        />
        <Route
          path="/incidents/:dateISO/edit/:incidentId"
          element={
            <Guard participantName={participantName}>
              <IncidentEditPage participantName={participantName} />
            </Guard>
          }
        />
        <Route
          path="/incidents/:dateISO/new"
          element={
            <Guard participantName={participantName}>
              <IncidentNewPage participantName={participantName} />
            </Guard>
          }
        />
        <Route
          path="/incidents/:dateISO"
          element={
            <Guard participantName={participantName}>
              <IncidentsPage
                participantName={participantName}
                onDelete={handleDeleteIncident}
              />
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
                  navigate(`/check-in/${today}`)
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
              <Navigate to={`/check-in/${today}`} replace />
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
