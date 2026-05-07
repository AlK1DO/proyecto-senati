import { useState, useEffect } from 'react'
import './HeroCarousel.css'

const SLIDES = [
  {
    url: 'https://virtualbackgrounds.site/wp-content/uploads/2020/12/bright-gaming-room-setup.jpg',
    title: 'Gestión de Tecnología',
    subtitle: 'Administra laptops, PCs y componentes gaming desde un solo lugar.',
  },
  {
    url: 'https://www.numerama.com/wp-content/uploads/2024/10/config-pc-gamer.jpg',
    title: 'Control Total de Inventario',
    subtitle: 'Registra entradas, salidas y stock de tus productos en tiempo real.',
  },
  {
    url: 'https://setupgamer.es/wp-content/uploads/2023/12/setup-gaming.png',
    title: 'Facturación Inteligente',
    subtitle: 'Genera facturas profesionales en segundos y lleva el historial completo.',
  },
  {
    url: 'https://content.pearl.fr/media/cache/default/article_ultralarge_high_nocrop/shared/images/articles/P/PC1/pc-gamer-intel-i5-14400-rtx-5070-32-go-ddr5-rgb-1-to-windows-11-pro-ref_PC1576_4.jpg',
    title: 'Estadísticas en Tiempo Real',
    subtitle: 'Visualiza ventas, ingresos y tendencias con gráficas detalladas.',
  },
  {
    url: 'https://static.vecteezy.com/system/resources/thumbnails/070/716/172/small_2x/modern-gaming-setup-in-room-with-rgb-lighting-and-multiple-monitors-photo.jpg',
    title: 'Clientes y Reportes',
    subtitle: 'Gestiona tu cartera de clientes y exporta reportes cuando los necesites.',
  },
]

export default function HeroCarousel({ onNavigate }) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  // Avance automático cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [current])

  const goTo = (index) => {
    if (animating || index === current) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setAnimating(false)
    }, 400)
  }

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length)
  const next = () => goTo((current + 1) % SLIDES.length)

  return (
    <div className="hero-carousel">
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide ${i === current ? 'active' : ''} ${animating && i === current ? 'fade-out' : ''}`}
          aria-hidden={i !== current}
        >
          <img src={slide.url} alt={slide.title} className="hero-slide-img" />
          <div className="hero-slide-overlay" />
        </div>
      ))}

      {/* Contenido sobre el carrusel */}
      <div className={`hero-content hero-carousel-content ${animating ? 'content-fade' : ''}`}>
        <h1 className="hero-title">{SLIDES[current].title}</h1>
        <p className="hero-subtitle">{SLIDES[current].subtitle}</p>

        <div className="hero-cta">
          <button className="hero-btn-primary" onClick={() => onNavigate?.('Productos')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
            Ver Catálogo
          </button>
          <button className="hero-btn-secondary" onClick={() => onNavigate?.('Estadísticas')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Ver Estadísticas
          </button>
        </div>
      </div>

      {/* Controles de navegación */}
      <button className="hero-arrow hero-arrow-left" onClick={prev} aria-label="Anterior">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button className="hero-arrow hero-arrow-right" onClick={next} aria-label="Siguiente">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* Dots indicadores */}
      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
