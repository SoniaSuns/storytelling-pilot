import { formatDateISO } from './dates'
import { getStudyData } from './storage'

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportParticipantData(participantName, participantData) {
  const today = formatDateISO()
  const safeName = participantName.replace(/[^a-zA-Z0-9_-]/g, '_')
  const filename = `diary-study-${safeName}-${today}.json`
  downloadJSON(
    {
      exportedAt: new Date().toISOString(),
      participant: participantName,
      data: participantData,
    },
    filename
  )
}

export function exportAllData() {
  const today = formatDateISO()
  const data = getStudyData()
  const filename = `diary-study-all-data-${today}.json`
  downloadJSON(
    {
      exportedAt: new Date().toISOString(),
      ...data,
    },
    filename
  )
}
