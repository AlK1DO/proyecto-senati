import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const DATA = [
  { mes: 'Ene', vendidos: 145 }, { mes: 'Feb', vendidos: 158 },
  { mes: 'Mar', vendidos: 148 }, { mes: 'Abr', vendidos: 195 },
  { mes: 'May', vendidos: 215 }, { mes: 'Jun', vendidos: 198 },
  { mes: 'Jul', vendidos: 232 }, { mes: 'Ago', vendidos: 208 },
  { mes: 'Sep', vendidos: 255 }, { mes: 'Oct', vendidos: 268 },
  { mes: 'Nov', vendidos: 238 }, { mes: 'Dic', vendidos: 282 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span className="tooltip-label">{label}</span>
      <span className="tooltip-value" style={{ color: '#22c55e' }}>
        Productos Vendidos : {payload[0].value}
      </span>
    </div>
  )
}

const CustomLegend = () => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
    <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#22c55e', display: 'inline-block' }} />
    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Productos Vendidos</span>
  </div>
)

export default function InventarioMensualChart() {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Estado del Inventario</h3>
          <p className="chart-subtitle">Comparativa mensual de productos vendidos</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="vendidos" name="Productos Vendidos" radius={[4, 4, 0, 0]} fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
