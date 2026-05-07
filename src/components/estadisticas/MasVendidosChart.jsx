import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span className="tooltip-label" style={{ maxWidth: '160px', whiteSpace: 'normal' }}>{label}</span>
      <span className="tooltip-value" style={{ color: '#34d399' }}>
        {payload[0].value} unidades
      </span>
      {payload[1] && (
        <span className="tooltip-value" style={{ color: '#a78bfa', fontSize: '12px' }}>
          S/ {payload[1].value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
        </span>
      )}
    </div>
  )
}

export default function MasVendidosChart({ data = [] }) {
  // Acortar nombres largos para el eje X
  const chartData = data.map((p) => ({
    ...p,
    nombreCorto: p.nombre.length > 14 ? p.nombre.slice(0, 14) + '…' : p.nombre,
  }))

  return (
    <div className="chart-card" style={{ flex: 1 }}>
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Productos Más Vendidos</h3>
          <p className="chart-subtitle">Top 5 por unidades vendidas</p>
        </div>
      </div>
      {chartData.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
          Sin ventas registradas aún
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="nombreCorto" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="cantidad" name="Unidades" fill="#34d399" fillOpacity={0.85} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
