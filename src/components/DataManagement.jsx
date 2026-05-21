import { useNavigate } from 'react-router-dom'
import {
  clearAllData,
  setActiveParticipantName,
  getParticipantNames,
} from '../utils/storage'
import { useI18n } from '../i18n/LanguageContext'

export default function DataManagement({ onSwitchParticipant, onCreateNew }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const names = getParticipantNames()

  async function handleClear() {
    const confirmed = window.confirm(t('data.clearConfirm'))
    if (confirmed) {
      await clearAllData()
      navigate('/setup')
      window.location.reload()
    }
  }

  return (
    <div className="card">
      <h2>{t('data.title')}</h2>

      <h3>{t('data.switch')}</h3>
      {names.length === 0 ? (
        <p>{t('data.noOthers')}</p>
      ) : (
        <ul className="participant-list">
          {names.map((name) => (
            <li key={name}>
              <button type="button" onClick={() => onSwitchParticipant(name)}>
                {t('data.continueAs', { name })}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="btn-group">
        <button type="button" className="btn btn-secondary" onClick={onCreateNew}>
          {t('data.createNew')}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setActiveParticipantName('')
            navigate('/setup')
          }}
        >
          {t('data.backSetup')}
        </button>
      </div>

      <h3>{t('data.clearTitle')}</h3>
      <p className="hint">{t('data.clearHint')}</p>
      <button type="button" className="btn btn-danger" onClick={handleClear}>
        {t('data.clearBtn')}
      </button>
    </div>
  )
}
