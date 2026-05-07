import { useState, useEffect } from 'react'
import { estadisticasService } from '../services/api'
import KpiCards from '../components/estadisticas/KpiCards'
import TransaccionesChart from '../components/estadisticas/TransaccionesChart'
import CategoriasChart from '../components/estadisticas/CategoriasChart'
import VentasMensualesChart from '../components/estadisticas/VentasMensualesChart'
import MasVendidosChart from '../components/estadisticas/MasVendidosChart'
import MetodosPagoChart from '../components/estadisticas/MetodosPagoChart'
import CriticosTable from '../components/estadisticas/CriticosTable'
import './Estadisticas.css'

export default function Estadisticas({ userProfile }) {
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const esAdmin = (userProfile?.rol || 'usuario').toLowerCase() === 'admin'

  useEffect(() => {
    estadisticasService.getResumen()
      .then(setDatos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="estadisticas-page">
        <div className="estadisticas-header">
          <div>
            <h1>Análisis de Ventas</h1>
            <p>Panel de control con estadísticas y métricas clave</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px' }}>
          <div className="stats-spinner" />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="estadisticas-page">
        <div className="estadisticas-header">
          <div>
            <h1>Análisis de Ventas</h1>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" width="48" height="48">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ color: '#ef4444', fontWeight: 700 }}>Error al cargar estadísticas</p>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="estadisticas-page">
      <div className="estadisticas-header">
        <div>
          <h1>{esAdmin ? 'Análisis de Ventas' : 'Mis Estadísticas'}</h1>
          <p>{esAdmin ? 'Panel de control con estadísticas y métricas clave en tiempo real' : 'Resumen de tus compras y gastos'}</p>
        </div>
        <div className="stats-live-badge">
          <span className="stats-live-dot" />
          Datos en vivo
        </div>
      </div>

      <KpiCards inventario={datos.inventario} ventas={datos.ventas} esAdmin={esAdmin} />
      <TransaccionesChart data={datos.transaccionesSemanales} />

      <div className="stats-row-2">
        <VentasMensualesChart data={datos.ventasMensuales} />
        <MetodosPagoChart data={datos.metodosPago} />
      </div>

      <div className="stats-row-2">
        <CategoriasChart data={datos.categorias} />
        <MasVendidosChart data={datos.masVendidos} />
      </div>

      {esAdmin && <CriticosTable data={datos.productosCriticos} />}
    </div>
  )
}
