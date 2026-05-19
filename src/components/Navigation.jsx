import { NavLink, useLocation } from 'react-router-dom'
import { formatDateISO } from '../utils/dates'

export default function Navigation() {
  const location = useLocation()
  const today = formatDateISO()

  function tabClass(prefix) {
    return location.pathname.startsWith(prefix) ? 'active' : ''
  }

  return (
    <nav className="nav-tabs" aria-label="Main navigation">
      <NavLink
        to={`/check-in/${today}`}
        className={() => tabClass('/check-in')}
      >
        Daily Check-in
      </NavLink>
      <NavLink to="/progress" className={({ isActive }) => (isActive ? 'active' : '')}>
        Study Progress
      </NavLink>
      <NavLink
        to={`/incidents/${today}`}
        className={() => tabClass('/incidents')}
      >
        Incidents
      </NavLink>
      <NavLink to="/data" className={({ isActive }) => (isActive ? 'active' : '')}>
        Export & Data
      </NavLink>
    </nav>
  )
}
