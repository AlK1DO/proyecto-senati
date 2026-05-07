import { useState, useEffect } from "react";
import { productosService } from "../services/api";
import "./GestionProductos.css";

const CATEGORIAS = ["Laptops", "Periféricos", "Monitores", "Componentes", "Audio", "Accesorios"];

const EMPTY_FORM = {
  nombre: "",
  precio: "",
  stock: "",
  categoria: "",
  rating: "5",
  imagen: "",
  oferta: false,
  descripcion: "",
};

function ConfirmModal({ mensaje, onConfirm, onCancel }) {
  return (
    <div className="gp-confirm-overlay" onClick={onCancel}>
      <div className="gp-confirm-box" onClick={(e) => e.stopPropagation()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" width="36" height="36">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>{mensaje}</p>
        <div className="gp-confirm-actions">
          <button className="gp-btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="gp-btn-delete" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function ProductoModal({ producto, onClose, onSave }) {
  const esEdicion = Boolean(producto?.id);
  const [form, setForm] = useState(
    producto
      ? {
          nombre: producto.nombre || "",
          precio: String(producto.precio || ""),
          stock: String(producto.stock || ""),
          categoria: producto.categoria || "",
          rating: String(producto.rating || "5"),
          imagen: producto.imagen || "",
          oferta: producto.oferta || false,
          descripcion: producto.descripcion || "",
        }
      : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim() || !form.precio || !form.stock || !form.categoria) {
      setError("Nombre, precio, stock y categoría son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        categoria: form.categoria,
        rating: parseInt(form.rating),
        imagen: form.imagen.trim(),
        oferta: form.oferta,
        descripcion: form.descripcion.trim(),
      };

      if (esEdicion) {
        await productosService.update(producto.id, payload);
      } else {
        await productosService.create(payload);
      }

      onSave();
    } catch (err) {
      setError(err.message || "Error al guardar el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gp-modal-overlay" onClick={onClose}>
      <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gp-modal-header">
          <h2>{esEdicion ? "Editar producto" : "Nuevo producto"}</h2>
          <button className="gp-modal-close" onClick={onClose}>&times;</button>
        </div>

        <form className="gp-modal-body" onSubmit={handleSubmit}>
          {error && <p className="gp-form-error">{error}</p>}

          <div className="gp-form-grid">
            {/* Nombre */}
            <div className="gp-field gp-field-full">
              <label>Nombre <span className="gp-req">*</span></label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Laptop ASUS ROG Strix G16"
                maxLength={100}
              />
            </div>

            {/* Precio */}
            <div className="gp-field">
              <label>Precio (S/) <span className="gp-req">*</span></label>
              <input
                name="precio"
                type="number"
                min="0"
                step="0.01"
                value={form.precio}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div className="gp-field">
              <label>Stock <span className="gp-req">*</span></label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            {/* Categoría */}
            <div className="gp-field">
              <label>Categoría <span className="gp-req">*</span></label>
              <select name="categoria" value={form.categoria} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div className="gp-field">
              <label>Rating (1-5)</label>
              <select name="rating" value={form.rating} onChange={handleChange}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{"★".repeat(n)} ({n})</option>
                ))}
              </select>
            </div>

            {/* Imagen */}
            <div className="gp-field gp-field-full">
              <label>URL de imagen</label>
              <input
                name="imagen"
                value={form.imagen}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            {/* Descripción */}
            <div className="gp-field gp-field-full">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción del producto..."
                rows={3}
                maxLength={300}
              />
            </div>

            {/* Oferta */}
            <div className="gp-field gp-field-full">
              <label className="gp-checkbox-label">
                <input
                  type="checkbox"
                  name="oferta"
                  checked={form.oferta}
                  onChange={handleChange}
                />
                <span className="gp-checkbox-custom" />
                Producto en oferta
              </label>
            </div>
          </div>

          {/* Preview imagen */}
          {form.imagen && (
            <div className="gp-img-preview">
              <img
                src={form.imagen}
                alt="preview"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          <div className="gp-modal-footer">
            <button type="button" className="gp-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="gp-btn-save" disabled={loading}>
              {loading ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GestionProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [modalProducto, setModalProducto] = useState(null); // null=cerrado, {}=nuevo, {id,...}=editar
  const [confirmDelete, setConfirmDelete] = useState(null); // id a eliminar

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productosService.getAll();
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async () => {
    try {
      await productosService.delete(confirmDelete);
      setConfirmDelete(null);
      cargar();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const filtrados = productos.filter((p) => {
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = filtroCategoria === "todas" || p.categoria === filtroCategoria;
    return matchBusq && matchCat;
  });

  return (
    <div className="gp-page">
      {/* HEADER */}
      <div className="gp-header">
        <div>
          <h1 className="gp-title">Gestión de <span>Productos</span></h1>
          <p className="gp-sub">Administra el catálogo completo de productos</p>
        </div>
        <div className="gp-header-right">
          <div className="gp-stats">
            <div className="gp-stat">
              <span className="gp-stat-val">{productos.length}</span>
              <span className="gp-stat-label">Total</span>
            </div>
            <div className="gp-stat">
              <span className="gp-stat-val">{productos.filter(p => p.oferta).length}</span>
              <span className="gp-stat-label">En oferta</span>
            </div>
            <div className="gp-stat">
              <span className="gp-stat-val gp-stat-warn">
                {productos.filter(p => p.stock < 5).length}
              </span>
              <span className="gp-stat-label">Stock bajo</span>
            </div>
          </div>
          <button className="gp-btn-nuevo" onClick={() => setModalProducto({})}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo producto
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="gp-filtros">
        <div className="gp-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="gp-search-icon">
            <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
          <input
            className="gp-search"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select className="gp-select" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="todas">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <div className="gp-empty">
          <div className="gp-spinner" />
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="gp-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" width="48" height="48">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ color: "#ef4444" }}>Error al cargar productos</p>
          <span>{error}</span>
          <button className="gp-btn-nuevo" style={{ marginTop: "12px" }} onClick={cargar}>Reintentar</button>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="gp-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          <p>No hay productos</p>
          <span>Crea el primero con el botón "Nuevo producto"</span>
        </div>
      ) : (
        <div className="gp-table-wrap">
          <table className="gp-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Oferta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className={p.stock < 5 ? "row-stock-bajo" : ""}>
                  <td>
                    <div className="gp-td-producto">
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="gp-td-img"
                        onError={(e) => { e.target.src = "https://placehold.co/40x40/0a0f18/00b4d8?text=?"; }}
                      />
                      <div>
                        <span className="gp-td-nombre">{p.nombre}</span>
                        <span className="gp-td-desc">{p.descripcion?.slice(0, 50)}{p.descripcion?.length > 50 ? "..." : ""}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="gp-td-cat">{p.categoria}</span></td>
                  <td className="gp-td-precio">S/ {parseFloat(p.precio).toFixed(2)}</td>
                  <td>
                    <span className={`gp-td-stock ${p.stock < 5 ? "gp-stock-bajo" : ""}`}>
                      {p.stock}
                      {p.stock < 5 && <span className="gp-stock-warn"> ⚠</span>}
                    </span>
                  </td>
                  <td>
                    <div className="gp-stars">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} style={{ color: s <= p.rating ? "#f59e0b" : "#1e3248" }}>★</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {p.oferta
                      ? <span className="gp-badge-oferta">Sí</span>
                      : <span className="gp-badge-no">No</span>
                    }
                  </td>
                  <td>
                    <div className="gp-td-acciones">
                      <button
                        className="gp-tbl-btn gp-tbl-btn-edit"
                        title="Editar"
                        onClick={() => setModalProducto(p)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="gp-tbl-btn gp-tbl-btn-delete"
                        title="Eliminar"
                        onClick={() => setConfirmDelete(p.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6M9 6V4h6v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {modalProducto !== null && (
        <ProductoModal
          producto={modalProducto?.id ? modalProducto : null}
          onClose={() => setModalProducto(null)}
          onSave={() => { setModalProducto(null); cargar(); }}
        />
      )}

      {/* Modal confirmar eliminar */}
      {confirmDelete && (
        <ConfirmModal
          mensaje="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
          onConfirm={handleEliminar}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
