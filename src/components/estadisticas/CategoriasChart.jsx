import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORES = ['#00d4ff', '#a78bfa', '#22c55e', '#f59e0b', '#f87171', '#34d399', '#60a5fa']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span className="tooltip-label">{payload[0].name}</span>
      <span className="tooltip-value" style={{ color: payload[0].payload.fill }}>
        S/ {payload[0].value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
      </span>
    </div>
  )
}

export default function CategoriasChart({ data = [] }) {
  const [activo, setActivo] = useState(null)
  const total = data.reduce((s, d) => s + d.total, 0)

  if (data.length === 0) {
    return (
      <div className="chart-card" style={{ flex: 1 }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Ventas por Categoría</h3>
            <p className="chart-subtitle">Ingresos distribuidos por categoría de producto</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
          Sin ventas registradas aún
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card" style={{ flex: 1 }}>
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Ventas por Categoría</h3>
          <p className="chart-subtitle">Ingresos distribuidos por categoría de producto</p>
        </div>
      </div>
      <div className="categorias-body">
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="nombre"
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                paddingAngle={3}
                onMouseEnter={(_, i) => setActivo(i)}
                onMouseLeave={() => setActivo(null)}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORES[i % COLORES.length]}
                    opacity={activo === null || activo === i ? 1 : 0.4}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="donut-legend">
          {data.map((item, i) => (
            <div
              key={item.nombre}
              className={`legend-item ${activo === i ? 'legend-item-active' : ''}`}
              onMouseEnter={() => setActivo(i)}
              onMouseLeave={() => setActivo(null)}
            >
              <span className="legend-dot" style={{ background: COLORES[i % COLORES.length], color: COLORES[i % COLORES.length] }} />
              <span className="legend-name">{item.nombre}</span>
              <span className="legend-count" style={{ color: COLORES[i % COLORES.length] }}>
                S/ {item.total.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
              </span>
              <span className="legend-pct" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {total > 0 ? ((item.total / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
