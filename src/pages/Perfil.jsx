import { useEffect, useMemo, useRef, useState } from 'react'
import { sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import { clientesService } from '../services/api'
import './Perfil.css'

export default function Perfil({ user, userProfile, photoURL: initialPhoto, onProfileUpdate }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [preview, setPreview] = useState(initialPhoto || null)
  const [fotoFile, setFotoFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [accessLoading, setAccessLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [accessMsg, setAccessMsg] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    setNombre(userProfile?.nombre || user?.displayName || '')
    setTelefono(userProfile?.telefono || '')
    setPreview(initialPhoto || userProfile?.photoURL || null)
  }, [initialPhoto, user, userProfile])

  const memberSince = useMemo(() => {
    if (!user?.metadata?.creationTime) return '--'
    const createdAt = new Date(user.metadata.creationTime)
    return createdAt.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
  }, [user])

  const accessMethod = 'Correo y contraseña'
  const accountState = 'Activa'

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

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'La imagen no debe superar 2MB.' })
      return
    }

    setFotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)

    try {
      const nextName = nombre.trim() || userProfile?.nombre || user?.displayName || 'Usuario'
      let photoURL = userProfile?.photoURL || user?.photoURL || null

      if (fotoFile) {
        photoURL = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(fotoFile)
        })
      }

      await updateProfile(auth.currentUser, {
        displayName: nextName,
      })

      await clientesService.update(user.uid, {
        nombre: nextName,
        telefono: telefono.trim(),
        photoURL: photoURL || '',
      })

      setPreview(photoURL)
      setFotoFile(null)
      setMsg({ type: 'success', text: 'Perfil actualizado correctamente.' })

      if (onProfileUpdate) onProfileUpdate()
    } catch (err) {
      console.error(err)
      setMsg({ type: 'error', text: 'Error al actualizar el perfil.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRecoveryEmail = async () => {
    setAccessMsg(null)
    setAccessLoading(true)

    try {
      await sendPasswordResetEmail(auth, user.email)
      setAccessMsg({
        type: 'success',
        text: 'Enviamos un correo de recuperación a tu email principal.',
      })
    } catch (err) {
      console.error(err)
      setAccessMsg({
        type: 'error',
        text: 'No pudimos enviar el correo de recuperación.',
      })
    } finally {
      setAccessLoading(false)
    }
  }

  return (
    <div className="perfil-page">
      <div className="perfil-header">
        <h1 className="perfil-title">Mi Perfil</h1>
        <p className="perfil-sub">Administra tu información personal</p>
      </div>

      <div className="perfil-layout">
        <div className="perfil-sidebar">
          <div className="perfil-avatar-wrap">
            <div className="perfil-avatar" onClick={() => fileRef.current?.click()}>
              {preview ? <img src={preview} alt="avatar" /> : <span>{getInitials()}</span>}
              <div className="perfil-avatar-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
            <div className="perfil-camera-btn" onClick={() => fileRef.current?.click()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFotoChange}
            />
          </div>

          <p className="perfil-sidebar-name">{getUserName()}</p>
          <p className="perfil-sidebar-email">{user?.email}</p>

          <div className="perfil-stats">
            <div className="perfil-stat">
              <span className="perfil-stat-label">Miembro desde</span>
              <span className="perfil-stat-value">{memberSince}</span>
            </div>
            <div className="perfil-stat">
              <span className="perfil-stat-label">Estado</span>
              <span className="perfil-stat-badge">{accountState}</span>
            </div>
          </div>
        </div>

        <div className="perfil-content">
          <div className="perfil-card">
            <h2 className="perfil-card-title">Información Personal</h2>
            {msg && <div className={`perfil-msg ${msg.type}`}>{msg.type === 'success' ? '✓' : '✕'} {msg.text}</div>}
            <form onSubmit={handleGuardar}>
              <div className="perfil-fields-grid">
                <div className="perfil-field">
                  <label>Nombre completo</label>
                  <div className="perfil-input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                <div className="perfil-field">
                  <label>Correo electrónico</label>
                  <div className="perfil-input-wrap perfil-input-disabled">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input type="email" value={user?.email || ''} disabled />
                  </div>
                  <span className="perfil-hint">El correo no se puede cambiar</span>
                </div>

                <div className="perfil-field">
                  <label>Teléfono</label>
                  <div className="perfil-input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                </div>

                <div className="perfil-field">
                  <label>Nombre de usuario</label>
                  <div className="perfil-input-wrap perfil-input-disabled">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input type="text" value={user?.email?.split('@')[0] || ''} disabled />
                  </div>
                </div>
              </div>

              <div className="perfil-card-footer">
                <button type="submit" className="perfil-btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>

          <div className="perfil-card perfil-access-card">
            <div className="perfil-access-head">
              <div>
                <h2 className="perfil-card-title">Cuenta y acceso</h2>
                <p className="perfil-card-sub">Gestiona tu acceso con acciones rápidas y seguras.</p>
              </div>
              <div className="perfil-access-chip">Firebase Auth</div>
            </div>

            {accessMsg && (
              <div className={`perfil-msg ${accessMsg.type}`}>
                {accessMsg.type === 'success' ? '✓' : '✕'} {accessMsg.text}
              </div>
            )}

            <div className="perfil-access-grid">
              <div className="perfil-access-item">
                <span className="perfil-access-label">Correo de acceso</span>
                <strong>{user?.email}</strong>
                <p>Tu cuenta principal para iniciar sesión y recuperar el acceso.</p>
              </div>

              <div className="perfil-access-item">
                <span className="perfil-access-label">Método de acceso</span>
                <strong>{accessMethod}</strong>
                <p>Actualmente usas autenticación clásica con email y contraseña.</p>
              </div>

              <div className="perfil-access-item">
                <span className="perfil-access-label">Recuperación de cuenta</span>
                <strong>Enlace de recuperación</strong>
                <p>Recibe un correo para restablecer tu contraseña de forma segura.</p>
              </div>

              <div className="perfil-access-item">
                <span className="perfil-access-label">Estado de la cuenta</span>
                <strong>{accountState}</strong>
                <p>Tu usuario está habilitado y listo para operar dentro del sistema.</p>
              </div>
            </div>

            <div className="perfil-access-actions">
              <button
                type="button"
                className="perfil-btn-secondary"
                onClick={handleRecoveryEmail}
                disabled={accessLoading}
              >
                {accessLoading ? 'Enviando...' : 'Enviar correo de recuperación'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
