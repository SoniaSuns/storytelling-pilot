import { useState } from 'react'
import { getParticipant } from '../utils/storage'
import { exportParticipantData, exportAllData } from '../utils/export'
import { useI18n } from '../i18n/LanguageContext'

export default function ExportControls({ participantName }) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)

  async function handleExportMine() {
    const data = getParticipant(participantName)
    if (!data) return
    setBusy(true)
    try {
      await exportParticipantData(participantName, data)
    } finally {
      setBusy(false)
    }
  }

  async function handleExportAll() {
    setBusy(true)
    try {
      await exportAllData()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <h2>{t('export.title')}</h2>
      <p className="hint" style={{ marginBottom: '1rem' }}>
        {t('export.hint')}
      </p>
      <div className="btn-group">
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={handleExportMine}
        >
          {busy ? t('export.exporting') : t('export.exportMine')}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={busy}
          onClick={handleExportAll}
        >
          {busy ? t('export.exporting') : t('export.exportAll')}
        </button>
      </div>
    </div>
  )
}
