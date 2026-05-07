import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import { useCart } from "../context/CartContext";
import { productosService } from "../services/api";
import "./Productos.css";

// Iconos por categoría
const catIcons = {
  Todas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  Laptops: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M0 21h24"/>
    </svg>
  ),
  Periféricos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <rect x="6" y="2" width="12" height="20" rx="6"/>
      <line x1="12" y1="6" x2="12" y2="10"/>
    </svg>
  ),
  Monitores: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  Componentes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
    </svg>
  ),
  Audio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  ),
  Accesorios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
};

const POR_PAGINA = 8;

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-info">
        <div className="skeleton-line w80" />
        <div className="skeleton-line w50" />
        <div className="skeleton-line w60" />
        <div className="skeleton-btn" />
      </div>
    </div>
  );
}

function FavoritosPanel({ isOpen, onClose, favoritos, onToggleFavorito, products }) {
  const favProducts = products.filter((p) => favoritos.includes(p.id));

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} />}
      <aside className={`fav-panel ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>
            Mis favoritos
            {favProducts.length > 0 && (
              <span className="cart-count">({favProducts.length} {favProducts.length === 1 ? "producto" : "productos"})</span>
            )}
          </h2>
          <button className="cart-close" onClick={onClose}>&times;</button>
        </div>

        {favProducts.length === 0 ? (
          <div className="cart-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p>No tienes favoritos aún</p>
            <span>Presiona el corazón en cualquier producto</span>
            <button className="btn-ver-productos" onClick={onClose}>Ver productos</button>
          </div>
        ) : (
          <div className="fav-items">
            {favProducts.map((product) => (
              <div className="fav-item" key={product.id}>
                <div className="fav-item-imgs">
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    className="fav-item-img-main"
                    onError={(e) => { e.target.src = "https://placehold.co/260x160/0a0f18/00b4d8?text=?"; }}
                  />
                </div>
                <div className="fav-item-footer">
                  <div className="fav-item-footer-left">
                    <span className="fav-item-name">{product.nombre}</span>
                    <span className="fav-item-meta">
                      1 producto · S/ {product.precio.toFixed(2)}
                      {product.oferta && <span className="fav-item-oferta">Oferta</span>}
                    </span>
                  </div>
                  <div className="fav-item-footer-right">
                    <button className="fav-action-btn" title="Compartir">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                        <polyline points="16 6 12 2 8 6"/>
                        <line x1="12" y1="2" x2="12" y2="15"/>
                      </svg>
                    </button>
                    <button className="fav-action-btn fav-action-delete" title="Eliminar" onClick={() => onToggleFavorito(product.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6M9 6V4h6v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}

export default function Productos({ user, userProfile }) {
  const [products, setProducts] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [orden, setOrden] = useState("default");
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState([]);
  const { totalItems } = useCart();

  // Cargar productos desde la API
  useEffect(() => {
    productosService.getAll()
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error cargando productos:", err))
      .finally(() => setLoading(false));
  }, []);

  const categorias = ["Todas", ...new Set(products.map((p) => p.categoria))];

  useEffect(() => {
    if (products.length === 0) return;
    setPagina(1);
    const t = setTimeout(() => {}, 0);
    return () => clearTimeout(t);
  }, [categoriaActiva, busqueda, orden, products.length]);

  const toggleFavorito = (id) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  let filtrados = products.filter((p) => {
    const matchCat = categoriaActiva === "Todas" || p.categoria === categoriaActiva;
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  if (orden === "asc") filtrados = [...filtrados].sort((a, b) => a.precio - b.precio);
  if (orden === "desc") filtrados = [...filtrados].sort((a, b) => b.precio - a.precio);

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const productosPagina = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const irPagina = (n) => {
    setPagina(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="productos-page">
      {/* HEADER */}
      <header className="productos-header hero-gradient">
        <div className="hero-content">
          <h1 className="hero-title">
            Catálogo de <span className="hero-accent">Productos</span>
          </h1>
          <p className="hero-sub">Los mejores productos tecnológicos al mejor precio</p>
          <div className="hero-stats">
            <span>{products.length} productos</span>
            <span>Pago seguro</span>
            <span>Garantía oficial</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="fav-trigger" onClick={() => setFavOpen(true)}>
            <svg viewBox="0 0 24 24" fill={favoritos.length > 0 ? "#e05555" : "none"} stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {favoritos.length > 0 && <span className="fav-badge">{favoritos.length}</span>}
          </button>

          <button className="cart-trigger" onClick={() => setCartOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Carrito
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* BARRA BÚSQUEDA + CATEGORÍAS */}
      <div className="search-bar-wrap">
        <div className="search-bar-inner">
          <svg className="search-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/>
            <line x1="16.5" y1="16.5" x2="22" y2="22"/>
          </svg>
          <input
            className="search-bar-input"
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="search-cat-dropdown-wrap">
          <button
            className={`search-cat-btn ${catDropOpen ? "open" : ""}`}
            onClick={() => setCatDropOpen((v) => !v)}
          >
            <span>{categoriaActiva === "Todas" ? "Categorías" : categoriaActiva}</span>
            <svg
              className={`search-cat-arrow ${catDropOpen ? "rotated" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              width="14" height="14"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {catDropOpen && (
            <>
              <div className="search-cat-overlay" onClick={() => setCatDropOpen(false)} />
              <div className="search-cat-menu">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    className={`search-cat-option ${categoriaActiva === cat ? "active" : ""}`}
                    onClick={() => { setCategoriaActiva(cat); setCatDropOpen(false); }}
                  >
                    <span className="search-cat-opt-icon">{catIcons[cat] || catIcons["Todas"]}</span>
                    <span>{cat === "Todas" ? "Todos los productos" : cat}</span>
                    {categoriaActiva === cat && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13" style={{marginLeft:"auto", stroke:"#00b4d8"}}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="productos-body">
        <p className="productos-count">
          Mostrando <span>{productosPagina.length}</span> de <span>{filtrados.length}</span> productos
        </p>

        {loading ? (
          <div className="productos-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="sin-resultados">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56">
              <circle cx="11" cy="11" r="7"/>
              <line x1="16.5" y1="16.5" x2="22" y2="22"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            <p>No encontramos productos</p>
            <span>Intenta con otra búsqueda o categoría</span>
            <button className="btn-limpiar" onClick={() => { setBusqueda(""); setCategoriaActiva("Todas"); }}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="productos-grid">
            {productosPagina.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                esFavorito={favoritos.includes(product.id)}
                onToggleFavorito={toggleFavorito}
              />
            ))}
          </div>
        )}

        {!loading && totalPaginas > 1 && (
          <div className="paginacion">
            <button className="pag-btn pag-arrow" onClick={() => irPagina(pagina - 1)} disabled={pagina === 1}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button key={n} className={`pag-btn ${pagina === n ? "pag-active" : ""}`} onClick={() => irPagina(n)}>{n}</button>
            ))}
            <button className="pag-btn pag-arrow" onClick={() => irPagina(pagina + 1)} disabled={pagina === totalPaginas}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} user={user} userProfile={userProfile} />
      <FavoritosPanel
        isOpen={favOpen}
        onClose={() => setFavOpen(false)}
        favoritos={favoritos}
        onToggleFavorito={toggleFavorito}
        products={products}
      />
    </div>
  );
}
