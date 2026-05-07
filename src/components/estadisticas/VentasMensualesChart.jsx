import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span className="tooltip-label">{label}</span>
      <span className="tooltip-value" style={{ color: '#a78bfa' }}>
        S/ {payload[0].value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
      </span>
    </div>
  )
}

export default function VentasMensualesChart({ data = [] }) {
  const total = data.reduce((s, d) => s + d.ventas, 0)
  return (
    <div className="chart-card" style={{ flex: 1 }}>
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Ingresos Mensuales</h3>
          <p className="chart-subtitle">Evolución de ingresos en los últimos 12 meses</p>
        </div>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
          S/ {total.toLocaleString('es-PE', { maximumFractionDigits: 0 })} total
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="ventas" stroke="#a78bfa" strokeWidth={2.5}
            dot={{ r: 3, fill: '#a78bfa', stroke: '#07080f', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#a78bfa', stroke: '#07080f', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
