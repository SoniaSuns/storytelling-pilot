import { useRef, useState } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import {
  saveAttachmentBlob,
  deleteAttachmentBlob,
  MAX_FILE_BYTES,
} from '../utils/fileStore'

const ACCEPT =
  '.md,.txt,.json,.pdf,.doc,.docx,.html,.csv,.log,text/*,application/json,application/pdf'

export default function ReflectionAttachments({
  participantName,
  dateISO,
  files,
  onChange,
}) {
  const { t } = useI18n()
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const maxMb = MAX_FILE_BYTES / (1024 * 1024)

  async function handleFiles(fileList) {
    if (!fileList?.length) return
    setError('')
    setBusy(true)
    const next = [...files]
    try {
      for (const file of fileList) {
        if (file.size > MAX_FILE_BYTES) {
          setError(t('checkIn.fileTooLarge', { maxMb, name: file.name }))
          continue
        }
        const meta = await saveAttachmentBlob(participantName, dateISO, file)
        next.push(meta)
      }
      onChange(next)
    } catch {
      setError(t('checkIn.uploadFailed'))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove(fileId) {
    await deleteAttachmentBlob(participantName, dateISO, fileId)
    onChange(files.filter((f) => f.id !== fileId))
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="form-group reflection-attachments">
      <label>{t('checkIn.attachments')}</label>
      <p className="hint">{t('checkIn.attachmentsHint', { maxMb })}</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="file-input"
        disabled={busy}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        className="btn btn-secondary"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {t('checkIn.chooseFiles')}
      </button>
      {error && <p className="error-message">{error}</p>}
      {files.length > 0 && (
        <ul className="attachment-list">
          {files.map((f) => (
            <li key={f.id}>
              <span className="attachment-name">{f.fileName}</span>
              <span className="attachment-meta">{formatSize(f.size)}</span>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleRemove(f.id)}
              >
                {t('checkIn.removeFile')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
