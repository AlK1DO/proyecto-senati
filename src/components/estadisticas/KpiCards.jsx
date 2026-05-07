const CubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)
const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const ReceiptIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
)

export default function KpiCards({ inventario, ventas, esAdmin }) {
  const cardsAdmin = [
    {
      label: 'Total Productos',
      value: inventario.totalProductos,
      sub: `${inventario.stockTotal} unidades en stock`,
      icon: CubeIcon,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.15)',
    },
    {
      label: 'Valor Inventario',
      value: `S/ ${inventario.valorInventario.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`,
      sub: 'Valor total en stock',
      icon: DollarIcon,
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.15)',
    },
    {
      label: 'Stock Bajo',
      value: inventario.stockBajo,
      sub: 'Productos con ≤ 5 unidades',
      icon: AlertIcon,
      color: '#f97316',
      bg: 'rgba(249,115,22,0.15)',
    },
  ]

  const cardsVentas = [
    {
      label: 'Ingresos Totales',
      value: `S/ ${ventas.ingresoTotal.toLocaleString('es-PE', { maximumFractionDigits: 2 })}`,
      sub: `${ventas.totalFacturas} comprobantes emitidos`,
      icon: TrendIcon,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.15)',
    },
    {
      label: 'Boletas / Facturas',
      value: `${ventas.totalBoletas} / ${ventas.totalFacturasDoc}`,
      sub: `${ventas.totalBoletas} boletas · ${ventas.totalFacturasDoc} facturas`,
      icon: ReceiptIcon,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.15)',
    },
    {
      label: 'Ticket Promedio',
      value: ventas.totalFacturas > 0
        ? `S/ ${(ventas.ingresoTotal / ventas.totalFacturas).toFixed(2)}`
        : 'S/ 0.00',
      sub: 'Por comprobante',
      icon: CartIcon,
      color: '#00d4ff',
      bg: 'rgba(0,212,255,0.15)',
    },
  ]

  const cards = esAdmin ? [...cardsAdmin, ...cardsVentas] : cardsVentas

  return (
    <div className="kpi-grid">
      {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div className="kpi-card" key={label}>
          <div className="kpi-card-header">
            <span className="kpi-title">{label}</span>
            <div className="kpi-icon-wrap" style={{ background: bg, color }}>
              <Icon />
            </div>
          </div>
          <p className="kpi-value">{value}</p>
          <p className="kpi-label">{sub}</p>
        </div>
      ))}
    </div>
  )
}
