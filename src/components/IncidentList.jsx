import { Link } from 'react-router-dom'
import { formatDateISO, formatDisplayDate } from '../utils/dates'
import { getParticipant } from '../utils/storage'
import { useI18n } from '../i18n/LanguageContext'

export default function IncidentList({ participantName, dateISO, onDelete }) {
  const { t, locale } = useI18n()
  const selectedDate = dateISO || formatDateISO()
  const today = formatDateISO()
  const isPastDay = selectedDate !== today
  const participant = getParticipant(participantName)
  const incidents = participant?.incidents?.[selectedDate] || []
  const displayDate = formatDisplayDate(selectedDate, locale)

  return (
    <div className="card">
      <h2>{t('incidents.title', { date: displayDate })}</h2>
      {isPastDay && (
        <p className="hint">
          {t('incidents.pastHint')}{' '}
          <Link to="/progress">{t('incidents.backProgress')}</Link>
        </p>
      )}
      <div className="instructions">
        <p>{t('incidents.intro')}</p>
      </div>

      {incidents.length === 0 ? (
        <p>{t('incidents.empty')}</p>
      ) : (
        incidents.map((inc) => (
          <div key={inc.id} className="incident-item">
            <h4>{inc.title || t('incidents.untitled')}</h4>
            <p className="meta">
              {inc.agent} · {inc.location || '—'} · {inc.time || '—'}
            </p>
            <p>
              {inc.whatWentWrong?.slice(0, 150)}
              {inc.whatWentWrong?.length > 150 ? '…' : ''}
            </p>
            <div className="btn-group">
              <Link
                to={`/incidents/${selectedDate}/edit/${inc.id}`}
                className="btn btn-secondary"
              >
                {t('common.edit')}
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(inc.id, selectedDate)}
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        ))
      )}

      <div className="btn-group">
        <Link
          to={`/incidents/${selectedDate}/new`}
          className="btn btn-primary"
        >
          {t('incidents.add')}
        </Link>
        <Link to="/progress" className="btn btn-secondary">
          {t('incidents.studyProgress')}
        </Link>
      </div>
    </div>
  )
}
