import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const METODOS_LABEL = {
  bcp: 'BCP',
  bbva: 'BBVA',
  scotiabank: 'Scotiabank',
  yape: 'Yape',
}

const COLORES = ['#00d4ff', '#a78bfa', '#22c55e', '#f59e0b']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span className="tooltip-label">{METODOS_LABEL[label] || label}</span>
      <span className="tooltip-value" style={{ color: '#00d4ff' }}>
        {payload[0].value} compras
      </span>
    </div>
  )
}

export default function MetodosPagoChart({ data = {} }) {
  const chartData = Object.entries(data).map(([metodo, cantidad]) => ({
    metodo,
    cantidad,
    label: METODOS_LABEL[metodo] || metodo,
  })).sort((a, b) => b.cantidad - a.cantidad)

  return (
    <div className="chart-card" style={{ flex: 1 }}>
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Métodos de Pago</h3>
          <p className="chart-subtitle">Distribución de compras por método</p>
        </div>
      </div>
      {chartData.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
          Sin datos aún
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
