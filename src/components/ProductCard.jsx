import { useState } from "react";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

function Stars({ rating, reviews = 128 }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "star filled" : "star"}>&#9733;</span>
      ))}
      <span className="rating-num">({reviews} reseñas)</span>
    </div>
  );
}

function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const caracteristicas = [
    "Alta calidad de construcción",
    "Diseño moderno y elegante",
    "Excelente relación calidad-precio",
    "Garantía del fabricante",
    "Compatible con múltiples dispositivos",
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-product" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <span className="modal-top-title">Detalles del Producto</span>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body-content">
          <div className="modal-img-side">
            <img
              src={product.imagen}
              alt={product.nombre}
              onError={(e) => {
                e.target.src = "https://placehold.co/400x300/0a0f18/00b4d8?text=Sin+imagen";
              }}
            />
          </div>
          <div className="modal-info-side">
            <h2 className="modal-nombre">{product.nombre}</h2>
            <Stars rating={product.rating} />
            <div className="modal-price-box">
              <div className="modal-price-row">
                <span className="modal-label">Precio:</span>
                <span className="modal-precio">S/ {product.precio.toFixed(2)}</span>
                {product.oferta && (
                  <span className="modal-precio-tachado">
                    S/ {(product.precio * 1.15).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="modal-stock-row">
                <span className="modal-label">Disponibilidad:</span>
                <span className="modal-stock-ok">{product.stock} unidades en stock</span>
              </div>
            </div>
            <div className="modal-desc-section">
              <h4>Descripción</h4>
              <p>{product.descripcion}</p>
            </div>
            <div className="modal-features-section">
              <h4>Características Destacadas</h4>
              <ul>
                {caracteristicas.map((c, i) => (
                  <li key={i}><span className="feat-dot">●</span>{c}</li>
                ))}
              </ul>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cerrar" onClick={onClose}>Cerrar</button>
              <button
                className={`modal-btn-agregar ${added ? "added" : ""}`}
                onClick={handleAdd}
                disabled={product.stock === 0}
              >
                {added ? "Agregado" : "Agregar al carrito"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product, esFavorito, onToggleFavorito }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imgHover, setImgHover] = useState(false);

  const descuento = Math.round(100 - (product.precio / (product.precio * 1.15)) * 100);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      {showModal && (
        <ProductModal product={product} onClose={() => setShowModal(false)} />
      )}

      <div className={`product-card ${imgHover ? "card-glow" : ""}`}>

        <div
          className="product-img-wrapper"
          onMouseEnter={() => setImgHover(true)}
          onMouseLeave={() => setImgHover(false)}
        >
          <img
            src={product.imagen}
            alt={product.nombre}
            className="product-img"
            onError={(e) => {
              e.target.src = "https://placehold.co/300x220/0a0f18/00b4d8?text=Sin+imagen";
            }}
          />
          <div className={`img-overlay ${imgHover ? "visible" : ""}`}>
            <button className="lupa-btn" onClick={() => setShowModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </button>
            <button
              className={`heart-btn ${esFavorito ? "heart-active" : ""}`}
              onClick={(e) => { e.stopPropagation(); onToggleFavorito(product.id); }}
            >
              <svg viewBox="0 0 24 24" fill={esFavorito ? "#e05555" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        </div>

        {product.stock < 5 && product.stock > 0 && (
          <div className="barra-stock-bajo" />
        )}

        <div className="product-info">
          <h3 className="product-nombre">{product.nombre}</h3>
          <Stars rating={product.rating} />

          <div className="product-precios">
            <span className="product-precio">S/ {product.precio.toFixed(2)}</span>
            {product.oferta && (
              <span className="badge-oferta-inline">-{descuento}%</span>
            )}
          </div>

          {product.oferta && (
            <span className="product-precio-tachado">S/ {(product.precio * 1.15).toFixed(2)}</span>
          )}

          {product.stock < 5 && product.stock > 0 ? (
            <span className="product-stock-bajo">Solo {product.stock} en stock</span>
          ) : (
            <span className="product-stock-text">{product.stock} disponibles</span>
          )}

          <button
            className={`btn-agregar ${added ? "added" : ""}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {added ? "Agregado" : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Agregar al carrito
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}