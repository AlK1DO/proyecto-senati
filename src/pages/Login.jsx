import { useState } from 'react'
import './Login.css'
import bgVideo from '../assets/videos/videoAsus.mp4'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { authService } from '../services/api'

function TermsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Términos y Condiciones</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="modal-body">
          <p><strong>1. Aceptación</strong><br />Al registrarte en TechLedger aceptas estos términos en su totalidad. Si no estás de acuerdo, no uses el servicio.</p>
          <p><strong>2. Uso del servicio</strong><br />TechLedger es una plataforma de gestión de facturación para negocios de tecnología y componentes gaming. El uso está restringido a fines comerciales legítimos.</p>
          <p><strong>3. Cuenta de usuario</strong><br />Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas bajo tu cuenta.</p>
          <p><strong>4. Datos personales</strong><br />Recopilamos y procesamos tus datos conforme a nuestra Política de Privacidad. No compartimos tu información con terceros sin tu consentimiento.</p>
          <p><strong>5. Propiedad intelectual</strong><br />Todo el contenido de TechLedger, incluyendo diseño, código y marca, es propiedad exclusiva de TechLedger y está protegido por las leyes de propiedad intelectual.</p>
          <p><strong>6. Limitación de responsabilidad</strong><br />TechLedger no se hace responsable por pérdidas de datos, interrupciones del servicio o daños indirectos derivados del uso de la plataforma.</p>
          <p><strong>7. Modificaciones</strong><br />Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados por correo electrónico.</p>
          <p><strong>8. Contacto</strong><br />Para consultas sobre estos términos escríbenos a: soporte@techledger.com</p>
        </div>
        <div className="modal-footer">
          <button className="btn-modal-close" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  )
}

function LoginForm({ onGoRegister, onGoRecovery }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Correo o contraseña incorrectos.')
          break
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Intenta más tarde.')
          break
        default:
          setError('No pudimos iniciar sesión. Intenta nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="brand">
        <span className="brand-icon">⬡</span>
        <span className="brand-name">TechLedger</span>
      </div>
      <h2 className="card-title">Iniciar sesión</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="usuario@techledger.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Recuérdame</span>
          </label>
          <button type="button" className="forgot-link" onClick={onGoRecovery}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? 'Iniciando...' : 'Iniciar sesión ahora'}
        </button>
        {error && <span className="field-error">{error}</span>}
      </form>

      <div className="card-footer">
        <p>¿No tienes cuenta?</p>
        <button className="register-link" onClick={onGoRegister}>
          Crear nueva cuenta
        </button>
      </div>
    </>
  )
}

function RecoveryForm({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handleRecovery = async (e) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email.trim())
      setMsg({
        type: 'success',
        text: 'Te enviamos instrucciones para recuperar tu contraseña.',
      })
    } catch (err) {
      let text = 'No pudimos enviar el correo de recuperación.'

      if (err.code === 'auth/invalid-email') {
        text = 'Ingresa un correo válido.'
      } else if (err.code === 'auth/user-not-found') {
        text = 'No encontramos una cuenta con ese correo.'
      }

      setMsg({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recovery-shell">
      <div className="brand recovery-brand">
        <span className="brand-icon">⬡</span>
        <span className="brand-name">TechLedger</span>
      </div>

      <div className="recovery-header">
        <div className="recovery-badge">Recuperación</div>
        <h2 className="card-title recovery-title">Recuperar Contraseña</h2>
        <p className="recovery-copy">Ingresa tu email y te enviaremos instrucciones para restaurar el acceso.</p>
      </div>

      <form onSubmit={handleRecovery} className="login-form recovery-form">
        <div className="form-group">
          <label htmlFor="recovery-email">Email</label>
          <input
            id="recovery-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <button type="submit" className="btn-login recovery-submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar instrucciones'}
        </button>

        {msg && <span className={`recovery-message ${msg.type}`}>{msg.text}</span>}
      </form>

      <button type="button" className="recovery-back" onClick={onBackToLogin}>
        Volver al inicio de sesión
      </button>
    </div>
  )
}

function RegisterForm({ onGoLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [firebaseError, setFirebaseError] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'El nombre es requerido'
    if (!email.trim()) newErrors.email = 'El correo es requerido'
    if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden'
    if (!acceptTerms) newErrors.terms = 'Debes aceptar los términos y condiciones'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setFirebaseError('')
    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, {
        displayName: name.trim(),
      })

      await authService.register({
        uid: user.uid,
        nombre: name.trim(),
        email: email.trim(),
      })

      onGoLogin()
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setFirebaseError('Este correo ya está registrado.')
          break
        case 'auth/invalid-email':
          setFirebaseError('El correo no es válido.')
          break
        case 'auth/weak-password':
          setFirebaseError('La contraseña es muy débil.')
          break
        default:
          setFirebaseError('Error al registrarse. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const EyeOpen = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const EyeClosed = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <div className="brand">
        <span className="brand-icon">⬡</span>
        <span className="brand-name">TechLedger</span>
      </div>
      <h2 className="card-title">Crear cuenta</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="reg-name">Nombre completo</label>
          <input
            id="reg-name"
            type="text"
            placeholder="Jordan García"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Correo electrónico</label>
          <input
            id="reg-email"
            type="email"
            placeholder="usuario@techledger.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Contraseña</label>
          <div className="password-wrapper">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
            >
              {showPassword ? <EyeOpen /> : <EyeClosed />}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-confirm">Confirmar contraseña</label>
          <div className="password-wrapper">
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
            >
              {showConfirm ? <EyeOpen /> : <EyeClosed />}
            </button>
          </div>
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </div>

        <div className="terms-row">
          <label className="terms-check">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <span>Acepto los</span>
          </label>
          <button type="button" className="terms-link" onClick={() => setShowTerms(true)}>
            Términos y Condiciones
          </button>
        </div>
        {errors.terms && <span className="field-error">{errors.terms}</span>}

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        {firebaseError && <span className="field-error">{firebaseError}</span>}
      </form>

      <div className="card-footer">
        <p>¿Ya tienes cuenta?</p>
        <button className="register-link" onClick={onGoLogin}>
          Iniciar sesión
        </button>
      </div>
    </>
  )
}

function Login() {
  const [view, setView] = useState('login')

  return (
    <div className="login-wrapper">
      <div className="video-bg">
        <video autoPlay muted loop playsInline>
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>

      <div className="login-left">
        <div className="welcome-text">
          <h1>
            Bienvenido a
            <br />
            <span className="highlight">TechLedger</span>
          </h1>
          <p>
            TechLedger es tu plataforma de gestión para negocios de tecnología y componentes gaming.
            Administra ventas, productos y clientes desde un solo lugar, rápido y sin complicaciones.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className={`login-card ${view === 'recovery' ? 'login-card-recovery' : ''}`}>
          {view === 'login' && (
            <LoginForm
              onGoRegister={() => setView('register')}
              onGoRecovery={() => setView('recovery')}
            />
          )}
          {view === 'register' && <RegisterForm onGoLogin={() => setView('login')} />}
          {view === 'recovery' && <RecoveryForm onBackToLogin={() => setView('login')} />}
        </div>
      </div>
    </div>
  )
}

export default Login
