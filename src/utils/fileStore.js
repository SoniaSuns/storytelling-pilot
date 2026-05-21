const DB_NAME = 'hciDiaryStudyFiles'
const DB_VERSION = 1
const STORE = 'attachments'
export const MAX_FILE_BYTES = 5 * 1024 * 1024

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
  })
}

export function attachmentKey(participantName, dateISO, fileId) {
  return `${participantName}__${dateISO}__${fileId}`
}

export async function saveAttachmentBlob(participantName, dateISO, file) {
  const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const key = attachmentKey(participantName, dateISO, id)
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).put(file, key)
  })
  db.close()
  return {
    id,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }
}

export async function getAttachmentBlob(participantName, dateISO, fileId) {
  const db = await openDb()
  const blob = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(attachmentKey(participantName, dateISO, fileId))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return blob || null
}

export async function deleteAttachmentBlob(participantName, dateISO, fileId) {
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).delete(attachmentKey(participantName, dateISO, fileId))
  })
  db.close()
}

export async function clearAllAttachmentBlobs() {
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).clear()
  })
  db.close()
}

/** Collect all reflection files for export */
export async function collectReflectionFiles(participantName, dailyCheckIns = {}) {
  const files = []
  for (const [dateISO, checkIn] of Object.entries(dailyCheckIns)) {
    const meta = checkIn?.reflectionFiles || []
    for (const m of meta) {
      const blob = await getAttachmentBlob(participantName, dateISO, m.id)
      if (blob) {
        files.push({
          participantName,
          dateISO,
          meta: m,
          blob,
        })
      }
    }
  }
  return files
}

export async function collectAllReflectionFiles(studyData) {
  const all = []
  const participants = studyData?.participants || {}
  for (const [name, data] of Object.entries(participants)) {
    const partFiles = await collectReflectionFiles(name, data.dailyCheckIns || {})
    all.push(...partFiles)
  }
  return all
}
