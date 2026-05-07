import { useMemo, useState } from 'react'
import './Navbar.css'

const NAV_LINKS = [
  {
    label: 'Inicio',
    section: 'Inicio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Productos',
    section: 'Productos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Facturas',
    section: 'Facturas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: 'Clientes',
    section: 'Clientes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Estadísticas',
    section: 'Estadísticas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Soporte',
    section: 'Soporte',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

export default function Navbar({
  onLogout,
  activeSection,
  onNavigate,
  user,
  userProfile,
  userRole,
  photoURL,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = userRole === 'admin'

  const links = useMemo(
    () =>
      NAV_LINKS.map((link) => {
        if (link.section !== 'Clientes') return link
        if (isAdmin) return link

        return {
          ...link,
          label: 'Perfil',
          section: 'Mi Perfil',
        }
      }).concat(
        isAdmin
          ? [{
              label: 'Productos Admin',
              section: 'GestionProductos',
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
              ),
            }]
          : []
      ),
    [isAdmin]
  )

  const handleNav = (section) => {
    if (onNavigate) onNavigate(section)
  }

  const getInitials = () => {
    const sourceName = userProfile?.nombre || user?.displayName
    if (sourceName) {
      return sourceName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }

    return user?.email?.[0]?.toUpperCase() || '?'
  }

  const getUserName = () => {
    return userProfile?.nombre || user?.displayName || user?.email?.split('@')[0] || 'Usuario'
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-brand-icon">⬡</span>
        <div className="navbar-brand-text">
          <span className="navbar-brand-name">TechLedger</span>
          <span className="navbar-brand-sub">Sistema de Facturación</span>
        </div>
      </div>

      <ul className="navbar-links">
        {links.map(({ label, section, icon }) => (
          <li key={section}>
            <button
              className={`navbar-link${activeSection === section ? ' active' : ''}`}
              onClick={() => handleNav(section)}
            >
              <span className="navbar-link-icon">{icon}</span>
              {label}
            </button>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <button
          className="navbar-avatar-btn"
          onClick={() => handleNav('Mi Perfil')}
          aria-label="Ir a mi perfil"
        >
          {photoURL ? (
            <img src={photoURL} alt="avatar" className="navbar-avatar-img" />
          ) : (
            <span className="navbar-avatar-initials">{getInitials()}</span>
          )}
          <span className="navbar-avatar-name">{getUserName()}</span>
        </button>

        <button className="navbar-logout" onClick={onLogout} aria-label="Cerrar sesión">
          <svg
            className="logout-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar sesión</span>
        </button>

        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`ham-line${menuOpen ? ' open' : ''}`} />
          <span className={`ham-line${menuOpen ? ' open' : ''}`} />
          <span className={`ham-line${menuOpen ? ' open' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          <ul>
            {links.map(({ label, section, icon }) => (
              <li key={`mobile-${section}`}>
                <button
                  className={`navbar-mobile-link${activeSection === section ? ' active' : ''}`}
                  onClick={() => {
                    handleNav(section)
                    setMenuOpen(false)
                  }}
                >
                  <span className="navbar-link-icon">{icon}</span>
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <button
            className="navbar-mobile-link"
            onClick={() => {
              handleNav('Mi Perfil')
              setMenuOpen(false)
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Mi Perfil
          </button>
          <button className="navbar-mobile-logout" onClick={onLogout}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  )
}
