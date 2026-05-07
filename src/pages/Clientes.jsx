import { useState, useEffect, useMemo } from "react";
import { clientesService } from "../services/api";
import { useFacturas } from "../context/FacturasContext";
import "./Clientes.css";

// ── BADGE ROL ──
function RolBadge({ rol }) {
  const esAdmin = rol?.toLowerCase() === "admin";
  return (
    <span
      style={{
        background: esAdmin ? "rgba(108,99,255,0.12)" : "rgba(0,180,216,0.1)",
        color: esAdmin ? "#a09aff" : "#00b4d8",
        border: `1px solid ${esAdmin ? "rgba(108,99,255,0.25)" : "rgba(0,180,216,0.2)"}`,
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: "20px",
        textTransform: "capitalize",
      }}
    >
      {rol || "usuario"}
    </span>
  );
}

// ── AVATAR INICIAL ──
function Avatar({ nombre, photoURL, size = 36 }) {
  const inicial = (nombre || "?")[0].toUpperCase();
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={nombre}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover", border: "2px solid #1e2d3d",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, #0c2a3a, #1a3a5c)",
        border: "2px solid #1e2d3d",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#00b4d8", fontWeight: 800, fontSize: size * 0.38,
        fontFamily: "Orbitron, sans-serif", flexShrink: 0,
      }}
    >
      {inicial}
    </div>
  );
}

// ── MODAL DETALLE CLIENTE ──
function ClienteModal({ cliente, facturas, onClose }) {
  const misFacturas = facturas.filter((f) => f.usuario?.uid === cliente.uid);
  const totalGastado = misFacturas
    .filter((f) => f.estado !== "anulado")
    .reduce((acc, f) => acc + f.total, 0);
  const ultimaCompra = misFacturas[0]
    ? new Date(misFacturas[0].fecha).toLocaleDateString("es-PE", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : null;

  const fechaRegistro = cliente.createdAt?.toDate
    ? cliente.createdAt.toDate().toLocaleDateString("es-PE", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "—";

  return (
    <div className="cli-overlay" onClick={onClose}>
      <div className="cli-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="cli-modal-header">
          <button className="cli-modal-close" onClick={onClose}>&times;</button>
          <div className="cli-modal-avatar-wrap">
            <Avatar nombre={cliente.nombre} photoURL={cliente.photoURL} size={64} />
          </div>
          <h2 className="cli-modal-nombre">{cliente.nombre || "Sin nombre"}</h2>
          <p className="cli-modal-email">{cliente.email}</p>
          <div style={{ marginTop: 8 }}>
            <RolBadge rol={cliente.rol} />
          </div>
        </div>

        {/* STATS */}
        <div className="cli-modal-stats">
          <div className="cli-mstat">
            <span className="cli-mstat-val">{misFacturas.length}</span>
            <span className="cli-mstat-label">Compras</span>
          </div>
          <div className="cli-mstat">
            <span className="cli-mstat-val cli-mstat-cyan">S/ {totalGastado.toFixed(2)}</span>
            <span className="cli-mstat-label">Total gastado</span>
          </div>
          <div className="cli-mstat">
            <span className="cli-mstat-val">
              {misFacturas.filter((f) => f.estado === "pagado").length}
            </span>
            <span className="cli-mstat-label">Pagadas</span>
          </div>
        </div>

        {/* INFO */}
        <div className="cli-modal-body">
          <div className="cli-modal-section">
            <p className="cli-modal-section-title">INFORMACIÓN</p>
            <div className="cli-info-row">
              <span className="cli-info-label">Teléfono</span>
              <span className="cli-info-val">{cliente.telefono || "—"}</span>
            </div>
            <div className="cli-info-row">
              <span className="cli-info-label">Registrado</span>
              <span className="cli-info-val">{fechaRegistro}</span>
            </div>
            <div className="cli-info-row">
              <span className="cli-info-label">Última compra</span>
              <span className="cli-info-val">{ultimaCompra || "Sin compras"}</span>
            </div>
            <div className="cli-info-row">
              <span className="cli-info-label">UID</span>
              <span className="cli-info-val cli-uid">{cliente.uid}</span>
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="cli-modal-section">
            <p className="cli-modal-section-title">HISTORIAL DE COMPRAS</p>
            {misFacturas.length === 0 ? (
              <p className="cli-no-compras">Este cliente aún no tiene compras registradas.</p>
            ) : (
              <div className="cli-historial">
                {misFacturas.slice(0, 8).map((f) => (
                  <div className="cli-hist-row" key={f.id}>
                    <div className="cli-hist-left">
                      <span className="cli-hist-id">{f.id}</span>
                      <span className="cli-hist-fecha">
                        {new Date(f.fecha).toLocaleDateString("es-PE", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="cli-hist-right">
                      <span className="cli-hist-monto">S/ {f.total.toFixed(2)}</span>
                      <span
                        className={`cli-hist-estado cli-hist-estado--${f.estado}`}
                      >
                        {f.estado}
                      </span>
                    </div>
                  </div>
                ))}
                {misFacturas.length > 8 && (
                  <p className="cli-hist-more">+{misFacturas.length - 8} compras más</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="cli-modal-footer">
          <button className="cli-btn-close" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──
export default function Clientes() {
  const { facturas } = useFacturas();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    async function cargarClientes() {
      try {
        const lista = await clientesService.getAll();
        setClientes(lista);
      } catch (err) {
        console.error("Error cargando clientes:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      const q = busqueda.toLowerCase();
      const matchQ =
        !q ||
        (c.nombre || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.uid || "").toLowerCase().includes(q);
      const matchRol =
        filtroRol === "todos" ||
        (c.rol || "usuario").toLowerCase() === filtroRol;
      return matchQ && matchRol;
    });
  }, [clientes, busqueda, filtroRol]);

  // Stats
  const totalClientes = clientes.length;
  const totalAdmins = clientes.filter((c) => c.rol?.toLowerCase() === "admin").length;
  const clientesConCompras = clientes.filter((c) =>
    facturas.some((f) => f.usuario?.uid === c.uid)
  ).length;

  if (loading) {
    return (
      <div className="clientes-loading">
        <div className="clientes-spinner" />
        <p>Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="clientes-page">
      {/* HEADER */}
      <div className="clientes-header">
        <div>
          <h1 className="clientes-title">
            Panel de <span>Clientes</span>
          </h1>
          <p className="clientes-sub">Gestión y seguimiento de todos los usuarios registrados</p>
        </div>
        <div className="clientes-header-stats">
          <div className="cstat">
            <span className="cstat-val">{totalClientes}</span>
            <span className="cstat-label">Total usuarios</span>
          </div>
          <div className="cstat">
            <span className="cstat-val cstat-cyan">{clientesConCompras}</span>
            <span className="cstat-label">Con compras</span>
          </div>
          <div className="cstat">
            <span className="cstat-val cstat-purple">{totalAdmins}</span>
            <span className="cstat-label">Admins</span>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="clientes-filtros">
        <div className="clientes-search-wrap">
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" width="14" height="14"
            className="clientes-search-icon"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
          <input
            className="clientes-search"
            placeholder="Buscar por nombre, email o UID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select
          className="clientes-select"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <option value="todos">Todos los roles</option>
          <option value="usuario">Usuarios</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* TABLA */}
      {clientesFiltrados.length === 0 ? (
        <div className="clientes-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p>No se encontraron clientes</p>
          <span>Intenta con otro término de búsqueda</span>
        </div>
      ) : (
        <div className="clientes-table-wrap">
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Compras</th>
                <th>Total gastado</th>
                <th>Última compra</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => {
                const misFacturas = facturas.filter((f) => f.usuario?.uid === c.uid);
                const totalGastado = misFacturas
                  .filter((f) => f.estado !== "anulado")
                  .reduce((acc, f) => acc + f.total, 0);
                const ultimaCompra = misFacturas[0]
                  ? new Date(misFacturas[0].fecha).toLocaleDateString("es-PE", {
                      day: "2-digit", month: "short", year: "numeric",
                    })
                  : null;

                return (
                  <tr key={c.uid}>
                    <td>
                      <div className="td-cliente-info">
                        <Avatar nombre={c.nombre} photoURL={c.photoURL} size={34} />
                        <div className="td-cliente-texto">
                          <span className="td-nombre">{c.nombre || "Sin nombre"}</span>
                          <span className="td-email">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <RolBadge rol={c.rol} />
                    </td>
                    <td className="td-telefono">{c.telefono || "—"}</td>
                    <td>
                      <span className="td-compras">{misFacturas.length}</span>
                    </td>
                    <td className="td-monto">
                      {totalGastado > 0 ? `S/ ${totalGastado.toFixed(2)}` : "—"}
                    </td>
                    <td className="td-fecha">{ultimaCompra || "—"}</td>
                    <td>
                      <button
                        className="tbl-btn tbl-btn-ver"
                        onClick={() => setClienteSeleccionado(c)}
                        title="Ver detalle"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {clienteSeleccionado && (
        <ClienteModal
          cliente={clienteSeleccionado}
          facturas={facturas}
          onClose={() => setClienteSeleccionado(null)}
        />
      )}
    </div>
  );
}
