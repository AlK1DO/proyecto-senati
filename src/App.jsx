import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { authService } from './services/api'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import HeroCarousel from './components/HeroCarousel'
import Productos from './pages/Productos'
import Estadisticas from './pages/Estadisticas'
import Perfil from './pages/Perfil'
import Facturas from './pages/Facturas'
import Soporte from './pages/Soporte'
import Clientes from './pages/Clientes'
import GestionProductos from './pages/GestionProductos'
import './App.css'

function SectionPlaceholder({ name }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 60px)',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Inter, sans-serif',
        gap: '12px',
        background: '#0a0a0f',
      }}
    >
      <span style={{ fontSize: '48px' }}>🚧</span>
      <h2 style={{ color: '#fff', fontFamily: 'Orbitron, sans-serif', fontSize: '18px' }}>{name}</h2>
      <p style={{ fontSize: '14px' }}>Esta seccion esta en construccion.</p>
    </div>
  )
}

function Dashboard({ user, userProfile, onRefreshUser, photoURL }) {
  const [section, setSection] = useState('Inicio')
  const userRole = (userProfile?.rol || 'usuario').toLowerCase()

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
    }
  }

  const renderSection = () => {
    switch (section) {
      case 'Inicio':
        return <HeroCarousel onNavigate={setSection} />
      case 'Productos':
        return <Productos user={user} userProfile={userProfile} />
      case 'Facturas':
        return <Facturas user={user} userProfile={userProfile} />
      case 'Clientes':
        if (userRole !== 'admin') {
          return (
            <Perfil
              user={user}
              userProfile={userProfile}
              photoURL={photoURL}
              onProfileUpdate={onRefreshUser}
            />
          )
        }
        return <Clientes />
      case 'Perfil':
      case 'Mi Perfil':
        return (
          <Perfil
            user={user}
            userProfile={userProfile}
            photoURL={photoURL}
            onProfileUpdate={onRefreshUser}
          />
        )
      case 'Estadísticas':
        return <Estadisticas userProfile={userProfile} />
      case 'Soporte':
        return <Soporte user={user} />
      case 'GestionProductos':
        if (userRole !== 'admin') return <HeroCarousel onNavigate={setSection} />
        return <GestionProductos />
      default:
        return <HeroCarousel onNavigate={setSection} />
    }
  }

  return (
    <>
      <Navbar
        onLogout={handleLogout}
        activeSection={section}
        onNavigate={setSection}
        user={user}
        userProfile={userProfile}
        userRole={userRole}
        photoURL={photoURL}
      />
      <main>{renderSection()}</main>
    </>
  )
}

function App() {
  const [user, setUser] = useState(undefined)
  const [userProfile, setUserProfile] = useState(null)
  const [photoURL, setPhotoURL] = useState(null)

  const loadUserProfile = async () => {
    try {
      const profile = await authService.me()
      setUserProfile(profile)
      setPhotoURL(profile.photoURL || null)
    } catch {
      setUserProfile(null)
      setPhotoURL(null)
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ ...currentUser })
        loadUserProfile()
        return
      }

      setUser(null)
      setUserProfile(null)
      setPhotoURL(null)
    })

    return () => unsub()
  }, [])

  const handleRefreshUser = async () => {
    if (!auth.currentUser) return

    await auth.currentUser.reload()
    setUser({ ...auth.currentUser })
    await loadUserProfile(auth.currentUser.uid)
  }

  if (user === undefined) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0a0a0f',
          color: '#00d4ff',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '14px',
          letterSpacing: '2px',
        }}
      >
        Cargando...
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Dashboard
      user={user}
      userProfile={userProfile}
      onRefreshUser={handleRefreshUser}
      photoURL={photoURL}
    />
  )
}

export default App
