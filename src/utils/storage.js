const STORAGE_KEY = 'hciDiaryStudyData'
const ACTIVE_PARTICIPANT_KEY = 'hciDiaryStudyActiveParticipant'

export function getStudyData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { participants: {} }
    return JSON.parse(raw)
  } catch {
    return { participants: {} }
  }
}

export function saveStudyData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getActiveParticipantName() {
  return localStorage.getItem(ACTIVE_PARTICIPANT_KEY) || ''
}

export function setActiveParticipantName(name) {
  if (name) {
    localStorage.setItem(ACTIVE_PARTICIPANT_KEY, name)
  } else {
    localStorage.removeItem(ACTIVE_PARTICIPANT_KEY)
  }
}

export function getParticipantNames() {
  const data = getStudyData()
  return Object.keys(data.participants || {}).sort()
}

export function getParticipant(name) {
  const data = getStudyData()
  return data.participants?.[name] || null
}

export function saveParticipant(name, participantData) {
  const data = getStudyData()
  if (!data.participants) data.participants = {}
  data.participants[name] = participantData
  saveStudyData(data)
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ACTIVE_PARTICIPANT_KEY)
}

export function createEmptyParticipant(profile) {
  return {
    profile,
    dailyCheckIns: {},
    incidents: {},
  }
}
