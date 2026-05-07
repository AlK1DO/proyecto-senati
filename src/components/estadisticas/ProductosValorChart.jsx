import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import products from '../../data/products.json'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <span className="tooltip-label">{label}</span>
      <span className="tooltip-value" style={{ color: '#06b6d4' }}>
        S/ {payload[0].value.toLocaleString()}
      </span>
    </div>
  )
}

export default function ProductosValorChart() {
  const top5 = useMemo(() =>
    [...products]
      .map(p => ({ nombre: p.nombre.length > 15 ? p.nombre.slice(0, 15) + '…' : p.nombre, valor: p.precio * p.stock }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)
  , [])

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Productos por Valor de Inventario</h3>
          <p className="chart-subtitle">Top 5 productos más valiosos en stock (precio × unidades)</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={top5} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false}
            tickFormatter={v => `S/${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="valor" radius={[6, 6, 0, 0]} fill="#06b6d4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
