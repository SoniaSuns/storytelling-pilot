import { NavLink, useLocation } from 'react-router-dom'
import { formatDateISO } from '../utils/dates'
import { useI18n } from '../i18n/LanguageContext'

export default function Navigation() {
  const location = useLocation()
  const today = formatDateISO()
  const { t } = useI18n()

  function tabClass(prefix) {
    return location.pathname.startsWith(prefix) ? 'active' : ''
  }

  return (
    <nav className="nav-tabs" aria-label={t('nav.checkIn')}>
      <NavLink to={`/check-in/${today}`} className={() => tabClass('/check-in')}>
        {t('nav.checkIn')}
      </NavLink>
      <NavLink to="/progress" className={({ isActive }) => (isActive ? 'active' : '')}>
        {t('nav.progress')}
      </NavLink>
      <NavLink to={`/incidents/${today}`} className={() => tabClass('/incidents')}>
        {t('nav.incidents')}
      </NavLink>
      <NavLink to="/data" className={({ isActive }) => (isActive ? 'active' : '')}>
        {t('nav.export')}
      </NavLink>
    </nav>
  )
}
