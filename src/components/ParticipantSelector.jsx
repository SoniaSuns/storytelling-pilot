import { getParticipantNames } from '../utils/storage'
import { useI18n } from '../i18n/LanguageContext'

export default function ParticipantSelector({ onSelect, onCreateNew }) {
  const { t } = useI18n()
  const names = getParticipantNames()

  return (
    <div className="card">
      <h2>{t('setup.continueTitle')}</h2>
      {names.length === 0 ? (
        <p>{t('setup.noParticipants')}</p>
      ) : (
        <ul className="participant-list">
          {names.map((name) => (
            <li key={name}>
              <button type="button" onClick={() => onSelect(name)}>
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="btn-group">
        <button type="button" className="btn btn-primary" onClick={onCreateNew}>
          {t('setup.createNew')}
        </button>
      </div>
    </div>
  )
}
