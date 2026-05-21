import { useI18n } from '../i18n/LanguageContext'

export default function PrivacyNotice() {
  const { t } = useI18n()
  return (
    <div className="privacy-notice" role="note">
      <p>
        <strong>{t('privacy.title')}</strong> {t('privacy.p1')}
      </p>
      <p>{t('privacy.p2')}</p>
    </div>
  )
}
