import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span className="tooltip-label">{label}</span>
      <span className="tooltip-value" style={{ color: '#00d4ff' }}>
        {payload[0].value} transacciones
      </span>
    </div>
  )
}

export default function TransaccionesChart({ data = [] }) {
  const total = data.reduce((s, d) => s + d.transacciones, 0)
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Transacciones Semanales</h3>
          <p className="chart-subtitle">Compras realizadas en los últimos 7 días</p>
        </div>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{total} total</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00d4ff', display: 'inline-block' }} />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Transacciones</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="transGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="dia" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="transacciones" stroke="#00d4ff" strokeWidth={2.5}
            fill="url(#transGrad)" dot={false}
            activeDot={{ r: 5, fill: '#00d4ff', stroke: '#07080f', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
