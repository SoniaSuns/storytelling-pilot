import { useI18n } from '../i18n/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()

  return (
    <div className="language-switcher" role="group" aria-label={t('lang.switch')}>
      <button
        type="button"
        className={lang === 'en' ? 'active' : ''}
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === 'zh' ? 'active' : ''}
        onClick={() => setLang('zh')}
      >
        中文
      </button>
    </div>
  )
}
