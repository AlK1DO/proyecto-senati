import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import './Soporte.css'

// ── EmailJS config ──────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'TU_SERVICE_ID'   // reemplaza
const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID'  // reemplaza
const EMAILJS_PUBLIC_KEY  = 'TU_PUBLIC_KEY'   // reemplaza
// ────────────────────────────────────────────────────────────

const FAQ_CATEGORIAS = [
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'pagos',   label: 'Pagos' },
  { id: 'cuenta',  label: 'Cuenta' },
  { id: 'envios',  label: 'Envíos' },
]

const FAQS = [
  { id: 1, cat: 'pedidos', pregunta: '¿Cómo puedo rastrear mi pedido?',
    respuesta: 'Una vez confirmado tu pedido, recibirás un correo con el número de seguimiento. Puedes rastrearlo en la sección "Mis Pedidos" de tu perfil o contactarnos directamente.' },
  { id: 2, cat: 'pedidos', pregunta: '¿Cuál es la política de devoluciones?',
    respuesta: 'Aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar en su estado original, sin uso y con todos sus accesorios.' },
  { id: 3, cat: 'pedidos', pregunta: '¿Los productos son originales?',
    respuesta: 'Absolutamente. Todos nuestros productos son 100% originales y provienen directamente de distribuidores autorizados.' },
  { id: 4, cat: 'envios', pregunta: '¿Cuánto tarda el envío?',
    respuesta: 'Los envíos dentro de Lima tardan 1-2 días hábiles. Para provincias el tiempo es de 3 a 5 días hábiles. Todos los pedidos incluyen envío gratuito.' },
  { id: 5, cat: 'envios', pregunta: '¿Ofrecen garantía en los productos?',
    respuesta: 'Sí, todos nuestros productos cuentan con garantía oficial del fabricante. Laptops y PCs tienen 1 año, periféricos 6 meses y componentes 1 año.' },
  { id: 6, cat: 'pagos', pregunta: '¿Qué métodos de pago aceptan?',
    respuesta: 'Aceptamos efectivo, tarjetas de crédito/débito (Visa, Mastercard), transferencias bancarias, Yape y Plin.' },
  { id: 7, cat: 'pagos', pregunta: '¿Emiten facturas electrónicas?',
    respuesta: 'Sí, emitimos facturas electrónicas y boletas de venta. Las facturas se envían automáticamente a tu correo registrado.' },
  { id: 8, cat: 'cuenta', pregunta: '¿Cómo cambio mi contraseña?',
    respuesta: 'Puedes cambiar tu contraseña desde "Mi Perfil" → "Cuenta y acceso" → "Enviar correo de recuperación".' },
]

export default function Soporte({ user }) {
  const [faqAbierta, setFaqAbierta]   = useState(null)
  const [catActiva, setCatActiva]     = useState('pedidos')
  const [nombre, setNombre]           = useState(user?.displayName || '')
  const [email, setEmail]             = useState(user?.email || '')
  const [asunto, setAsunto]           = useState('')
  const [mensaje, setMensaje]         = useState('')
  const [enviando, setEnviando]       = useState(false)
  const [enviado, setEnviado]         = useState(false)
  const [errorEnvio, setErrorEnvio]   = useState('')
  const [hoveredContact, setHoveredContact] = useState(null)

  const faqsFiltradas = FAQS.filter(f => f.cat === catActiva)

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim() || !asunto.trim() || !mensaje.trim()) {
      setErrorEnvio('Por favor completa todos los campos.')
      return
    }
    setErrorEnvio('')
    setEnviando(true)
    try {
      // 1️⃣ Guardar en Firestore
      await addDoc(collection(db, 'mensajes_soporte'), {
        nombre:   nombre.trim(),
        email:    email.trim(),
        asunto:   asunto.trim(),
        mensaje:  mensaje.trim(),
        leido:    false,
        creadoEn: serverTimestamp(),
      })

      // 2️⃣ Enviar correo via Web3Forms
      const ahora = new Date()
      const fecha = ahora.toLocaleDateString('es-PE') + ', ' + ahora.toLocaleTimeString('es-PE')

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: 'c939dcbe-88c0-47f8-bc9b-deffdc03c062',
          name:        nombre.trim(),
          email:       email.trim(),
          subject:     `[TechLedger Soporte] ${asunto.trim()}`,
          message:
            `NUEVO MENSAJE DE SOPORTE - TECHLEDGER\n` +
            `${'='.repeat(40)}\n` +
            `CLIENTE : ${nombre.trim()}\n` +
            `EMAIL   : ${email.trim()}\n` +
            `ASUNTO  : ${asunto.trim()}\n\n` +
            `MENSAJE :\n${mensaje.trim()}\n\n` +
            `FECHA   : ${fecha}`,
        }),
      })

      if (res.ok) {
        setEnviado(true)
        setAsunto('')
        setMensaje('')
        setTimeout(() => setEnviado(false), 6000)
      } else {
        // Firestore ya guardó, igual mostramos éxito
        setEnviado(true)
        setAsunto('')
        setMensaje('')
        setTimeout(() => setEnviado(false), 6000)
      }
    } catch (err) {
      console.error(err)
      setErrorEnvio('Error al enviar. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="sp-page">
      {/* ── Hero Banner ── */}
      <div className="sp-hero">
        <div className="sp-hero-glow" />
        <div className="sp-hero-content">
          <h1 className="sp-hero-title">Centro de Soporte</h1>
          <p className="sp-hero-sub">Estamos aquí para ayudarte en cada paso</p>

        </div>
      </div>

      <div className="sp-layout">
        {/* ── Columna izquierda ── */}
        <div className="sp-left">
          {/* Canales de contacto */}
          <div className="sp-card">
            <h2 className="sp-card-title">Contáctanos</h2>
            <div className="sp-contact-list">
              {[
                { key: 'chat', icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  ), name: 'Chat en vivo', sub: 'Disponible 24/7', color: '#00d4ff', badge: 'Online' },
                { key: 'tel', icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  ), name: 'Teléfono', sub: '+51 900 123 456', color: '#a78bfa', badge: 'Lun–Vie' },
                { key: 'mail', icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  ), name: 'Email', sub: 'practicante.1600952@gmail.com', color: '#34d399', badge: '< 2h' },
              ].map(c => (
                <div
                  key={c.key}
                  className={`sp-contact-item ${hoveredContact === c.key ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredContact(c.key)}
                  onMouseLeave={() => setHoveredContact(null)}
                  style={{ '--accent': c.color }}
                >
                  <div className="sp-contact-icon" style={{ background: `${c.color}18`, border: `1px solid ${c.color}40` }}>
                    <span style={{ color: c.color }}>{c.icon}</span>
                  </div>
                  <div className="sp-contact-info">
                    <span className="sp-contact-name">{c.name}</span>
                    <span className="sp-contact-sub">{c.sub}</span>
                  </div>
                  <span className="sp-contact-badge" style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}30` }}>
                    {c.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Horario */}
          <div className="sp-card sp-horario-card">
            <div className="sp-horario-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Horario de Atención
            </div>
            <div className="sp-horario-rows">
              {[
                { dia: 'Lun – Vie', hora: '9:00 – 21:00', open: true },
                { dia: 'Sábados',   hora: '10:00 – 18:00', open: true },
                { dia: 'Domingos',  hora: 'Cerrado', open: false },
              ].map(h => (
                <div key={h.dia} className="sp-horario-row">
                  <span className="sp-horario-dia">{h.dia}</span>
                  <span className={`sp-horario-hora ${!h.open ? 'cerrado' : ''}`}>{h.hora}</span>
                  <span className={`sp-horario-dot ${h.open ? 'open' : 'closed'}`} />
                </div>
              ))}
            </div>
          </div>


        </div>

        {/* ── Columna derecha ── */}
        <div className="sp-right">
          {/* FAQ con tabs */}
          <div className="sp-card">
            <div className="sp-faq-top">
              <div className="sp-faq-heading">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h2 className="sp-card-title">Preguntas Frecuentes</h2>
              </div>
              <span className="sp-faq-count">{faqsFiltradas.length} preguntas</span>
            </div>

            {/* Tabs de categoría */}
            <div className="sp-tabs">
              {FAQ_CATEGORIAS.map(cat => (
                <button
                  key={cat.id}
                  className={`sp-tab ${catActiva === cat.id ? 'active' : ''}`}
                  onClick={() => { setCatActiva(cat.id); setFaqAbierta(null) }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="sp-faq-list">
              {faqsFiltradas.map((faq, i) => (
                <div
                  key={faq.id}
                  className={`sp-faq-item ${faqAbierta === faq.id ? 'open' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <button
                    className="sp-faq-btn"
                    onClick={() => setFaqAbierta(faqAbierta === faq.id ? null : faq.id)}
                  >
                    <span className="sp-faq-num" />
                    <span className="sp-faq-q">{faq.pregunta}</span>
                    <svg
                      className={`sp-faq-chevron ${faqAbierta === faq.id ? 'open' : ''}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  <div className={`sp-faq-body ${faqAbierta === faq.id ? 'visible' : ''}`}>
                    <p className="sp-faq-respuesta">{faq.respuesta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <div className="sp-card sp-form-card">
            <div className="sp-form-header">
              <div>
                <h2 className="sp-card-title">Envíanos un Mensaje</h2>
                <p className="sp-form-sub">Respuesta garantizada en menos de 2 horas</p>
              </div>
            </div>

            {enviado ? (
              <div className="sp-enviado">
                <div className="sp-enviado-ring">
                  <div className="sp-enviado-icon">✓</div>
                </div>
                <h3>¡Mensaje enviado!</h3>
                <p>Te responderemos a <strong>{email}</strong> a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleEnviar} className="sp-form">
                <div className="sp-form-row">
                  <div className="sp-field">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Nombre
                    </label>
                    <input type="text" placeholder="Tu nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required />
                  </div>
                  <div className="sp-field">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Email
                    </label>
                    <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="sp-field">
                  <label>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    Asunto
                  </label>
                  <input type="text" placeholder="¿En qué podemos ayudarte?" value={asunto} onChange={e => setAsunto(e.target.value)} required />
                </div>

                <div className="sp-field">
                  <label>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Mensaje
                    <span className="sp-char-count">{mensaje.length}/500</span>
                  </label>
                  <textarea
                    placeholder="Describe tu consulta con detalle..."
                    value={mensaje}
                    onChange={e => setMensaje(e.target.value.slice(0, 500))}
                    rows={5}
                    required
                  />
                </div>

                {errorEnvio && (
                  <div className="sp-error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errorEnvio}
                  </div>
                )}

                <button type="submit" className="sp-btn-enviar" disabled={enviando}>
                  {enviando ? (
                    <><span className="sp-spinner" /> Enviando...</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
