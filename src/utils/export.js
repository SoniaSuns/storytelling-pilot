import JSZip from 'jszip'
import { formatDateISO } from './dates'
import { getStudyData } from './storage'
import { collectReflectionFiles, collectAllReflectionFiles } from './fileStore'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function safePathSegment(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_')
}

async function addFilesToZip(zip, reflectionFiles) {
  for (const { participantName, dateISO, meta, blob } of reflectionFiles) {
    const folder = `attachments/${safePathSegment(participantName)}/${dateISO}`
    zip.file(`${folder}/${safePathSegment(meta.fileName)}`, blob)
  }
}

async function buildZip(payload, reflectionFiles, filename) {
  const zip = new JSZip()
  zip.file('data.json', JSON.stringify(payload, null, 2))
  if (reflectionFiles.length > 0) {
    await addFilesToZip(zip, reflectionFiles)
    zip.file(
      'attachments/README.txt',
      'Reflection attachments are organized as attachments/<participant>/<date>/<filename>\n'
    )
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, filename)
}

export async function exportParticipantData(participantName, participantData) {
  const today = formatDateISO()
  const safeName = safePathSegment(participantName)
  const filename = `diary-study-${safeName}-${today}.zip`
  const reflectionFiles = await collectReflectionFiles(
    participantName,
    participantData.dailyCheckIns || {}
  )
  await buildZip(
    {
      exportedAt: new Date().toISOString(),
      participant: participantName,
      data: participantData,
      attachmentCount: reflectionFiles.length,
    },
    reflectionFiles,
    filename
  )
}

export async function exportAllData() {
  const today = formatDateISO()
  const data = getStudyData()
  const filename = `diary-study-all-data-${today}.zip`
  const reflectionFiles = await collectAllReflectionFiles(data)
  await buildZip(
    {
      exportedAt: new Date().toISOString(),
      attachmentCount: reflectionFiles.length,
      ...data,
    },
    reflectionFiles,
    filename
  )
}
