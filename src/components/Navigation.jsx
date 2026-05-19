import { NavLink } from 'react-router-dom'

export default function Navigation() {
  return (
    <nav className="nav-tabs" aria-label="Main navigation">
      <NavLink to="/check-in" className={({ isActive }) => (isActive ? 'active' : '')}>
        Daily Check-in
      </NavLink>
      <NavLink to="/progress" className={({ isActive }) => (isActive ? 'active' : '')}>
        Study Progress
      </NavLink>
      <NavLink to="/incidents" className={({ isActive }) => (isActive ? 'active' : '')}>
        Incidents
      </NavLink>
      <NavLink to="/data" className={({ isActive }) => (isActive ? 'active' : '')}>
        Export & Data
      </NavLink>
    </nav>
  )
}
