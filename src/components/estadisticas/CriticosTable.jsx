export default function CriticosTable({ data = [] }) {
  return (
    <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="chart-card-header" style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <h3 className="chart-title">Productos con Stock Crítico</h3>
          <p className="chart-subtitle">Productos con 5 o menos unidades disponibles</p>
        </div>
        <span className="criticos-count">{data.length} productos</span>
      </div>

      {data.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: '13px', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Todos los productos tienen stock suficiente
        </div>
      ) : (
        <div className="table-wrap">
          <table className="criticos-table">
            <thead>
              <tr>
                {['Imagen', 'Producto', 'Categoría', 'Precio', 'Stock', 'Estado'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(p => {
                const sinStock = p.stock === 0
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                        <img src={p.imagen} alt={p.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none' }} />
                      </div>
                    </td>
                    <td>
                      <p className="product-name">{p.nombre}</p>
                    </td>
                    <td><span className="cat-tag">{p.categoria}</span></td>
                    <td className="price-cell">S/ {parseFloat(p.precio).toFixed(2)}</td>
                    <td className="stock-cell">
                      <span className={`stock-num ${sinStock ? 'stock-critical' : 'stock-low'}`}>{p.stock}</span>
                    </td>
                    <td>
                      <span className={`badge ${sinStock ? 'badge-danger' : 'badge-warning'}`}>
                        {sinStock ? 'Sin Stock' : 'Stock Bajo'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
