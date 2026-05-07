import { useState, useMemo } from "react";
import { useFacturas } from "../context/FacturasContext";
import "./Facturas.css";

const METODOS_LABEL = {
  bcp: "Tarjeta BCP",
  bbva: "Tarjeta BBVA",
  scotiabank: "Tarjeta Scotiabank",
  yape: "Yape",
};

const ESTADO_COLORS = {
  pagado: { bg: "rgba(0,168,85,0.12)", color: "#00a855", border: "rgba(0,168,85,0.25)" },
  anulado: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  pendiente: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" },
};

function EstadoBadge({ estado }) {
  const s = ESTADO_COLORS[estado] || ESTADO_COLORS.pendiente;
  return (
    <span
      className={`estado-badge estado-badge--${estado}`}
      style={{
        background: s.bg, color: s.color,
        border: `1px solid ${s.border}`,
        fontSize: "0.72rem", fontWeight: 700,
        padding: "3px 10px", borderRadius: "20px",
        textTransform: "capitalize",
      }}
    >
      {estado}
    </span>
  );
}

function DetalleModal({ factura, onClose, isAdmin, onAnular, onEditar }) {
  const [editEstado, setEditEstado] = useState(factura.estado);
  const [editMetodo, setEditMetodo] = useState(factura.metodoPago);
  const [editMode, setEditMode] = useState(false);

  const fecha = new Date(factura.fecha).toLocaleString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const handleGuardar = () => {
    onEditar(factura.id, { estado: editEstado, metodoPago: editMetodo });
    setEditMode(false);
  };

  const handlePrint = () => {
    // Marcar solo este overlay como activo para impresión
    const el = document.querySelector(".fdet-overlay");
    if (el) el.setAttribute("data-print-active", "true");
    window.print();
    if (el) el.removeAttribute("data-print-active");
  };

  return (
    <div className="fdet-overlay" onClick={onClose}>
      <div className="fdet-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── CABECERA TICKET ── */}
        <div className="fdet-ticket-top">
          <button className="fdet-close" onClick={onClose}>&times;</button>

          <div className="fdet-ticket-brand">
            <span className="fdet-brand-icon">⬡</span>
            <span className="fdet-brand-name">TechLedger</span>
          </div>
          <p className="fdet-brand-sub">Sistema de Facturación</p>
          <p className="fdet-brand-addr">Lima, Perú · soporte@techledger.com</p>

          <div className="fdet-ticket-divider-dots" />

          <div className="fdet-doc-tipo">
            {factura.tipoDoc === "factura" ? "FACTURA ELECTRÓNICA" : "BOLETA DE VENTA"}
          </div>
          <div className="fdet-doc-num">{factura.id}</div>
          <p className="fdet-doc-fecha">{fecha}</p>

          <div className="fdet-ticket-divider" />
        </div>

        {/* ── CUERPO SCROLLABLE ── */}
        <div className="fdet-ticket-body">

          {/* Datos del cliente */}
          <div className="fdet-ticket-section">
            <p className="fdet-ticket-section-title">DATOS DEL CLIENTE</p>
            <div className="fdet-ticket-info-row">
              <span className="fdet-info-label">Nombre</span>
              <span className="fdet-info-val">{factura.usuario.nombre}</span>
            </div>
            <div className="fdet-ticket-info-row">
              <span className="fdet-info-label">Email</span>
              <span className="fdet-info-val">{factura.usuario.email}</span>
            </div>
            {factura.tipoDoc === "factura" && factura.ruc && (
              <>
                <div className="fdet-ticket-info-row">
                  <span className="fdet-info-label">RUC</span>
                  <span className="fdet-info-val">{factura.ruc}</span>
                </div>
                <div className="fdet-ticket-info-row">
                  <span className="fdet-info-label">Razón social</span>
                  <span className="fdet-info-val">{factura.razonSocial}</span>
                </div>
                {factura.direccion && (
                  <div className="fdet-ticket-info-row">
                    <span className="fdet-info-label">Dirección</span>
                    <span className="fdet-info-val">{factura.direccion}</span>
                  </div>
                )}
              </>
            )}
            <div className="fdet-ticket-info-row">
              <span className="fdet-info-label">Método de pago</span>
              {editMode ? (
                <select className="fdet-select-inline" value={editMetodo} onChange={(e) => setEditMetodo(e.target.value)}>
                  {Object.entries(METODOS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              ) : (
                <span className="fdet-info-val">{METODOS_LABEL[factura.metodoPago] || factura.metodoPago}</span>
              )}
            </div>
            <div className="fdet-ticket-info-row">
              <span className="fdet-info-label">Estado</span>
              {editMode ? (
                <select className="fdet-select-inline" value={editEstado} onChange={(e) => setEditEstado(e.target.value)}>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="anulado">Anulado</option>
                </select>
              ) : (
                <EstadoBadge estado={factura.estado} />
              )}
            </div>
          </div>

          <div className="fdet-ticket-divider" />

          {/* Productos */}
          <div className="fdet-ticket-section">
            <p className="fdet-ticket-section-title">DETALLE DE PRODUCTOS</p>
            <div className="fdet-prod-head">
              <span>Descripción</span>
              <span>Cant.</span>
              <span>P. Unit.</span>
              <span>Subtotal</span>
            </div>
            {factura.items.map((item, i) => (
              <div className="fdet-prod-row" key={i}>
                <span className="fdet-prod-name">{item.nombre}</span>
                <span>{item.cantidad}</span>
                <span>S/ {item.precio.toFixed(2)}</span>
                <span>S/ {item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="fdet-ticket-divider" />

          {/* Totales */}
          <div className="fdet-ticket-totales">
            <div className="fdet-tot-row">
              <span>Subtotal (sin IGV)</span>
              <span>S/ {(factura.subtotal - factura.igv < 0 ? factura.subtotal : (factura.subtotal)).toFixed(2)}</span>
            </div>
            {factura.descuentos > 0 && (
              <div className="fdet-tot-row fdet-tot-desc">
                <span>Descuento aplicado</span>
                <span>- S/ {factura.descuentos.toFixed(2)}</span>
              </div>
            )}
            <div className="fdet-tot-row">
              <span>IGV (18%)</span>
              <span>S/ {factura.igv.toFixed(2)}</span>
            </div>
            <div className="fdet-ticket-divider-dots" />
            <div className="fdet-tot-row fdet-tot-final">
              <span>TOTAL A PAGAR</span>
              <span>S/ {factura.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="fdet-ticket-divider-dots" />
          <p className="fdet-ticket-footer-msg">
            Gracias por tu compra · TechLedger {new Date().getFullYear()}
          </p>
        </div>

        {/* ── ACCIONES ── */}
        <div className="fdet-footer">
          {isAdmin && !editMode && factura.estado !== "anulado" && (
            <>
              <button className="fdet-btn-edit" onClick={() => setEditMode(true)}>Editar</button>
              <button className="fdet-btn-anular" onClick={() => { onAnular(factura.id); onClose(); }}>Anular</button>
            </>
          )}
          {editMode && (
            <>
              <button className="fdet-btn-edit" onClick={handleGuardar}>Guardar</button>
              <button className="fdet-btn-cancel" onClick={() => setEditMode(false)}>Cancelar</button>
            </>
          )}
          <button className="fdet-btn-print" onClick={handlePrint}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir
          </button>
          <button className="fdet-btn-close" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── VISTA ADMIN ──
function VistaAdmin() {
  const { facturas, loading, error, anularFactura, actualizarFactura, recargar } = useFacturas();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [detalle, setDetalle] = useState(null);

  const filtradas = useMemo(() => {
    return facturas.filter((f) => {
      const q = busqueda.toLowerCase();
      const matchQ = !q ||
        f.id.toLowerCase().includes(q) ||
        f.usuario.nombre.toLowerCase().includes(q) ||
        f.usuario.email.toLowerCase().includes(q);
      const matchEstado = filtroEstado === "todos" || f.estado === filtroEstado;
      const matchMetodo = filtroMetodo === "todos" || f.metodoPago === filtroMetodo;
      const matchTipo = filtroTipo === "todos" || f.tipoDoc === filtroTipo;
      return matchQ && matchEstado && matchMetodo && matchTipo;
    });
  }, [facturas, busqueda, filtroEstado, filtroMetodo, filtroTipo]);

  const totalMonto = filtradas.reduce((acc, f) => acc + (f.estado !== "anulado" ? f.total : 0), 0);

  return (
    <div className="facturas-page">
      <div className="facturas-header">
        <div>
          <h1 className="facturas-title">Panel de <span>Facturas</span></h1>
          <p className="facturas-sub">Gestión completa de todas las transacciones</p>
        </div>
        <div className="facturas-header-stats">
          <div className="fstat">
            <span className="fstat-val">{facturas.length}</span>
            <span className="fstat-label">Total emitidas</span>
          </div>
          <div className="fstat">
            <span className="fstat-val">{facturas.filter(f => f.estado === "pagado").length}</span>
            <span className="fstat-label">Pagadas</span>
          </div>
          <div className="fstat">
            <span className="fstat-val fstat-monto">S/ {totalMonto.toFixed(2)}</span>
            <span className="fstat-label">Monto filtrado</span>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="facturas-filtros">
        <div className="facturas-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="facturas-search-icon">
            <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
          </svg>
          <input
            className="facturas-search"
            placeholder="Buscar por N°, cliente o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select className="facturas-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="anulado">Anulado</option>
        </select>
        <select className="facturas-select" value={filtroMetodo} onChange={(e) => setFiltroMetodo(e.target.value)}>
          <option value="todos">Todos los métodos</option>
          {Object.entries(METODOS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select className="facturas-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="todos">Boletas y facturas</option>
          <option value="boleta">Solo boletas</option>
          <option value="factura">Solo facturas</option>
        </select>
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="facturas-empty">
          <div className="facturas-spinner" />
          <p>Cargando facturas...</p>
        </div>
      ) : error ? (
        <div className="facturas-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" width="48" height="48">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{color:"#ef4444"}}>Error al cargar facturas</p>
          <span>{error}</span>
          <button className="fcard-btn" style={{marginTop:"12px", padding:"8px 20px"}} onClick={recargar}>Reintentar</button>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="facturas-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>No hay facturas que coincidan</p>
        </div>
      ) : (
        <div className="facturas-table-wrap">
          <table className="facturas-table">
            <thead>
              <tr>
                <th>N° Documento</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Método</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((f) => (
                <tr key={f.id} className={f.estado === "anulado" ? "row-anulado" : ""}>
                  <td className="td-id">{f.id}</td>
                  <td><span className="td-tipo">{f.tipoDoc}</span></td>
                  <td>
                    <div className="td-cliente">
                      <span>{f.usuario.nombre}</span>
                      <span className="td-email">{f.usuario.email}</span>
                    </div>
                  </td>
                  <td className="td-fecha">
                    {new Date(f.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td>{METODOS_LABEL[f.metodoPago] || f.metodoPago}</td>
                  <td className="td-monto">S/ {f.total.toFixed(2)}</td>
                  <td><EstadoBadge estado={f.estado} /></td>
                  <td>
                    <div className="td-acciones">
                      <button className="tbl-btn tbl-btn-ver" onClick={() => setDetalle(f)} title="Ver detalle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      {f.estado !== "anulado" && (
                        <button className="tbl-btn tbl-btn-anular" onClick={() => anularFactura(f.id)} title="Anular">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <DetalleModal
          factura={detalle}
          onClose={() => setDetalle(null)}
          isAdmin
          onAnular={anularFactura}
          onEditar={actualizarFactura}
        />
      )}
    </div>
  );
}

// ── VISTA CLIENTE ──
function VistaCliente({ user }) {
  const { getFacturasDeUsuario, loading, error, recargar } = useFacturas();
  const [detalle, setDetalle] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const misFacturas = useMemo(() => {
    const todas = getFacturasDeUsuario(user?.uid || "");
    if (filtroTipo === "todos") return todas;
    return todas.filter((f) => f.tipoDoc === filtroTipo);
  }, [getFacturasDeUsuario, user, filtroTipo]);

  return (
    <div className="facturas-page">
      <div className="facturas-header">
        <div>
          <h1 className="facturas-title">Mis <span>Comprobantes</span></h1>
          <p className="facturas-sub">Historial de tus boletas y facturas</p>
        </div>
        <div className="facturas-header-stats">
          <div className="fstat">
            <span className="fstat-val">{misFacturas.length}</span>
            <span className="fstat-label">Documentos</span>
          </div>
          <div className="fstat">
            <span className="fstat-val fstat-monto">
              S/ {misFacturas.filter(f => f.estado !== "anulado").reduce((a, f) => a + f.total, 0).toFixed(2)}
            </span>
            <span className="fstat-label">Total gastado</span>
          </div>
        </div>
      </div>

      <div className="facturas-filtros">
        <select className="facturas-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="todos">Todos los documentos</option>
          <option value="boleta">Solo boletas</option>
          <option value="factura">Solo facturas</option>
        </select>
      </div>

      {loading ? (
        <div className="facturas-empty">
          <div className="facturas-spinner" />
          <p>Cargando comprobantes...</p>
        </div>
      ) : error ? (
        <div className="facturas-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" width="48" height="48">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{color:"#ef4444"}}>Error al cargar comprobantes</p>
          <span>{error}</span>
          <button className="fcard-btn" style={{marginTop:"12px", padding:"8px 20px"}} onClick={recargar}>Reintentar</button>
        </div>
      ) : misFacturas.length === 0 ? (
        <div className="facturas-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>Aún no tienes comprobantes</p>
          <span>Realiza una compra para ver tus boletas y facturas aquí</span>
        </div>
      ) : (
        <div className="facturas-cards">
          {misFacturas.map((f) => (
            <div className="fcard" key={f.id} onClick={() => setDetalle(f)}>
              <div className="fcard-top">
                <div className="fcard-tipo-wrap">
                  <span className="fcard-tipo">{f.tipoDoc === "factura" ? "📄 Factura" : "🧾 Boleta"}</span>
                  <EstadoBadge estado={f.estado} />
                </div>
                <span className="fcard-monto">S/ {f.total.toFixed(2)}</span>
              </div>
              <p className="fcard-id">{f.id}</p>
              <div className="fcard-meta">
                <span>{new Date(f.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}</span>
                <span>{METODOS_LABEL[f.metodoPago] || f.metodoPago}</span>
                <span>{f.items.length} producto{f.items.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="fcard-actions">
                <button className="fcard-btn" onClick={(e) => { e.stopPropagation(); setDetalle(f); }}>
                  Ver detalle
                </button>
                <button className="fcard-btn" onClick={(e) => {
                  e.stopPropagation();
                  setDetalle(f);
                  setTimeout(() => {
                    const el = document.querySelector(".fdet-overlay");
                    if (el) el.setAttribute("data-print-active", "true");
                    window.print();
                    if (el) el.removeAttribute("data-print-active");
                  }, 300);
                }}>
                  Imprimir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detalle && (
        <DetalleModal
          factura={detalle}
          onClose={() => setDetalle(null)}
          isAdmin={false}
          onAnular={() => {}}
          onEditar={() => {}}
        />
      )}
    </div>
  );
}

export default function Facturas({ user, userProfile }) {
  const rol = (userProfile?.rol || "usuario").toLowerCase();
  if (rol === "admin") return <VistaAdmin />;
  return <VistaCliente user={user} />;
}
