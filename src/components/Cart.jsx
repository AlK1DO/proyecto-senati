import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useFacturas } from "../context/FacturasContext";
import "./Cart.css";

const METODOS_PAGO = [
  {
    id: "bcp",
    label: "Tarjeta BCP",
    sub: "Visa / Mastercard",
    logo: "/bcp.webp",
  },
  {
    id: "bbva",
    label: "Tarjeta BBVA",
    sub: "Visa / Mastercard",
    logo: "/bbva.jpg",
  },
  {
    id: "scotiabank",
    label: "Tarjeta Scotiabank",
    sub: "Visa / Mastercard",
    logo: "/scotiabank.png",
  },
  {
    id: "yape",
    label: "Yape",
    sub: "Pago con QR",
    logo: "/yape.png",
  },
];

function TicketModal({ factura, onClose }) {
  const fecha = new Date(factura.fecha).toLocaleString("es-PE", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const handlePrint = () => {
    const el = document.querySelector(".ticket-overlay");
    if (el) el.setAttribute("data-print-active", "true");
    window.print();
    if (el) el.removeAttribute("data-print-active");
  };

  return (
    <div className="ticket-overlay" onClick={onClose}>
      <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-header">
          <div className="ticket-brand">
            <span className="ticket-brand-icon">⬡</span>
            <span>TechLedger</span>
          </div>
          <div className="ticket-badge-ok">✓ Pago confirmado</div>
        </div>

        <div className="ticket-meta">
          <div className="ticket-meta-row">
            <span>N° {factura.tipoDoc === "factura" ? "Factura" : "Boleta"}</span>
            <strong>{factura.id}</strong>
          </div>
          <div className="ticket-meta-row">
            <span>Fecha</span>
            <strong>{fecha}</strong>
          </div>
          <div className="ticket-meta-row">
            <span>Cliente</span>
            <strong>{factura.usuario.nombre}</strong>
          </div>
          {factura.tipoDoc === "factura" && (
            <>
              <div className="ticket-meta-row">
                <span>RUC</span>
                <strong>{factura.ruc}</strong>
              </div>
              <div className="ticket-meta-row">
                <span>Razón social</span>
                <strong>{factura.razonSocial}</strong>
              </div>
              {factura.direccion && (
                <div className="ticket-meta-row">
                  <span>Dirección fiscal</span>
                  <strong>{factura.direccion}</strong>
                </div>
              )}
            </>
          )}
          <div className="ticket-meta-row">
            <span>Método de pago</span>
            <strong>{METODOS_PAGO.find(m => m.id === factura.metodoPago)?.label || factura.metodoPago}</strong>
          </div>
        </div>

        <div className="ticket-items">
          <div className="ticket-items-head">
            <span>Producto</span>
            <span>Cant.</span>
            <span>Subtotal</span>
          </div>
          {factura.items.map((item, i) => (
            <div className="ticket-item-row" key={i}>
              <span className="ticket-item-name">{item.nombre}</span>
              <span>{item.cantidad}</span>
              <span>S/ {item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="ticket-totales">
          <div className="ticket-total-row">
            <span>Subtotal</span>
            <span>S/ {factura.subtotal.toFixed(2)}</span>
          </div>
          {factura.descuentos > 0 && (
            <div className="ticket-total-row ticket-descuento">
              <span>Descuentos</span>
              <span>- S/ {factura.descuentos.toFixed(2)}</span>
            </div>
          )}
          <div className="ticket-total-row">
            <span>IGV (18%)</span>
            <span>S/ {factura.igv.toFixed(2)}</span>
          </div>
          <div className="ticket-total-row ticket-total-final">
            <span>Total</span>
            <span>S/ {factura.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="ticket-actions">
          <button className="ticket-btn-print" onClick={handlePrint}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir
          </button>
          <button className="ticket-btn-close" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function formatCardNumber(val) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(val) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

function CardForm({ banco, logo }) {
  const [numero, setNumero] = useState("");
  const [nombre, setNombre] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  return (
    <div className="card-fields">
      <div className="card-field">
        <label>Número de tarjeta</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          value={numero}
          onChange={(e) => setNumero(formatCardNumber(e.target.value))}
          maxLength={19}
        />
      </div>
      <div className="card-field">
        <label>Nombre del titular</label>
        <input
          type="text"
          placeholder="Como aparece en la tarjeta"
          value={nombre}
          onChange={(e) => setNombre(e.target.value.toUpperCase())}
          maxLength={26}
        />
      </div>
      <div className="card-field-row">
        <div className="card-field">
          <label>Fecha de vencimiento</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/AA"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            maxLength={5}
          />
        </div>
        <div className="card-field card-field-cvv">
          <label>
            CVV
            <span className="cvv-tooltip" title="3 dígitos al reverso de tu tarjeta (4 para Amex)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
          </label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="•••"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            maxLength={4}
          />
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ onClose, onConfirm, total, igv, subtotal, descuentos }) {
  const [metodoPago, setMetodoPago] = useState("");
  const [tipoDoc, setTipoDoc] = useState("boleta");
  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  const esTarjeta = ["bcp", "bbva", "scotiabank"].includes(metodoPago);
  const metodoSeleccionado = METODOS_PAGO.find(m => m.id === metodoPago);

  const handlePagar = async () => {
    if (!metodoPago) return;
    if (tipoDoc === "factura" && (!ruc.trim() || !razonSocial.trim())) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500)); // simulación procesamiento
    try {
      await onConfirm({ metodoPago, tipoDoc, ruc, razonSocial, direccion });
    } finally {
      setLoading(false);
    }
  };

  const facturaIncompleta = tipoDoc === "factura" && (!ruc.trim() || !razonSocial.trim());

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-header">
          <h2>Finalizar compra</h2>
          <button className="cart-close" onClick={onClose}>&times;</button>
        </div>

        <div className="checkout-body">
          {/* Tipo de documento */}
          <div className="checkout-section">
            <p className="checkout-section-title">Tipo de documento</p>
            <div className="checkout-doc-btns">
              <button
                className={`checkout-doc-btn ${tipoDoc === "boleta" ? "active" : ""}`}
                onClick={() => setTipoDoc("boleta")}
              >
                <span>🧾</span> Boleta
              </button>
              <button
                className={`checkout-doc-btn ${tipoDoc === "factura" ? "active" : ""}`}
                onClick={() => setTipoDoc("factura")}
              >
                <span>📄</span> Factura
              </button>
            </div>
          </div>

          {/* Datos empresa si es factura */}
          {tipoDoc === "factura" && (
            <div className="checkout-factura-datos">
              <p className="checkout-section-title">Datos de la empresa</p>
              <div className="card-fields">
                <div className="card-field">
                  <label>RUC <span className="campo-req">*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="20XXXXXXXXX"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    maxLength={11}
                  />
                </div>
                <div className="card-field">
                  <label>Razón social <span className="campo-req">*</span></label>
                  <input
                    type="text"
                    placeholder="Nombre de la empresa"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value.toUpperCase())}
                    maxLength={60}
                  />
                </div>
                <div className="card-field">
                  <label>Dirección fiscal</label>
                  <input
                    type="text"
                    placeholder="Av. Ejemplo 123, Lima"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    maxLength={80}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div className="checkout-section">
            <p className="checkout-section-title">Método de pago</p>
            <div className="checkout-metodos">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.id}
                  className={`checkout-metodo ${metodoPago === m.id ? "active" : ""}`}
                  onClick={() => setMetodoPago(m.id)}
                >
                  <img
                    src={m.logo}
                    alt={m.label}
                    className="checkout-metodo-logo"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div className="checkout-metodo-info">
                    <span className="checkout-metodo-label">{m.label}</span>
                    <span className="checkout-metodo-sub">{m.sub}</span>
                  </div>
                  {metodoPago === m.id && (
                    <svg className="checkout-metodo-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Formulario tarjeta */}
          {esTarjeta && metodoSeleccionado && (
            <CardForm banco={metodoSeleccionado.label} logo={metodoSeleccionado.logo} />
          )}

          {/* QR Yape */}
          {metodoPago === "yape" && (
            <div className="checkout-yape-qr">
              <p className="checkout-section-title">Escanea el QR con Yape</p>
              <div className="checkout-qr-wrap">
                <img
                  src="/yape-qr-png.jpeg"
                  alt="QR Yape"
                  className="checkout-qr-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="checkout-qr-placeholder" style={{display:"none"}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M20 14h.01M20 17h.01M20 20h.01M17 20h.01M14 20h.01"/>
                  </svg>
                  <span>Sube tu QR a public/yape-qr.png</span>
                </div>
              </div>
              <p className="checkout-qr-hint">Abre Yape → Pagar → Escanear QR</p>
            </div>
          )}

          {/* Resumen */}
          <div className="checkout-resumen">
            <div className="checkout-resumen-row">
              <span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span>
            </div>
            {descuentos > 0 && (
              <div className="checkout-resumen-row checkout-desc">
                <span>Descuentos</span><span>- S/ {descuentos.toFixed(2)}</span>
              </div>
            )}
            <div className="checkout-resumen-row">
              <span>IGV (18%)</span><span>S/ {igv.toFixed(2)}</span>
            </div>
            <div className="checkout-resumen-divider" />
            <div className="checkout-resumen-row checkout-total">
              <span>Total a pagar</span><span>S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          {loading ? (
            <div className="checkout-loading">
              <div className="checkout-loading-spinner" />
              <div className="checkout-loading-text">
                <p>Procesando pago...</p>
                <span>Por favor no cierres esta ventana</span>
              </div>
            </div>
          ) : (
            <>
              <button
                className="checkout-btn-pagar"
                disabled={!metodoPago || facturaIncompleta}
                onClick={handlePagar}
              >
                {`Pagar S/ ${total.toFixed(2)}`}
              </button>
              {!metodoPago && (
                <p className="checkout-hint">Selecciona un método de pago para continuar</p>
              )}
              {metodoPago && facturaIncompleta && (
                <p className="checkout-hint">Completa el RUC y razón social para continuar</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Cart({ isOpen, onClose, user, userProfile }) {
  const { cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { crearFactura } = useFacturas();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ticketFactura, setTicketFactura] = useState(null);

  const totalItems = cartItems.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const descuentos = cartItems.reduce((acc, item) => {
    if (item.oferta) return acc + (item.precio * 1.15 - item.precio) * item.cantidad;
    return acc;
  }, 0);
  const igv = parseFloat((subtotal * 0.18).toFixed(2));
  const totalConIgv = parseFloat((subtotal + igv).toFixed(2));

  const handleConfirmarPago = async ({ metodoPago, tipoDoc, ruc, razonSocial, direccion }) => {
    const usuarioData = {
      uid: user?.uid || "anonimo",
      nombre: userProfile?.nombre || user?.displayName || user?.email || "Cliente",
      email: user?.email || "",
    };
    try {
      const factura = await crearFactura({
        usuario: usuarioData,
        items: cartItems,
        metodoPago,
        tipoDoc,
        ruc: ruc || "",
        razonSocial: razonSocial || "",
        direccion: direccion || "",
      });
      clearCart();
      setCheckoutOpen(false);
      onClose();
      setTicketFactura(factura);
    } catch (err) {
      console.error("Error al crear factura:", err);
      alert("Hubo un error al procesar el pago. Intenta de nuevo.");
    }
  };

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} />}
      <aside className={`cart-panel ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Carrito {totalItems > 0 && <span className="cart-count">({totalItems} {totalItems === 1 ? "producto" : "productos"})</span>}</h2>
          <button className="cart-close" onClick={onClose}>&times;</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p>Tu carrito está vacío</p>
            <span>Agrega productos para empezar</span>
            <button className="btn-ver-productos" onClick={onClose}>Ver productos</button>
          </div>
        ) : (
          <div className="cart-body">
            <div className="cart-left">
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="cart-item-img"
                      onError={(e) => { e.target.src = "https://placehold.co/80x80/1a1a2e/00b4d8?text=?"; }}
                    />
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.nombre}</span>
                      <div className="cart-item-price-row">
                        <span className="cart-item-price">S/ {item.precio.toFixed(2)}</span>
                        {item.oferta && (
                          <>
                            <span className="cart-item-precio-tachado">S/ {(item.precio * 1.15).toFixed(2)}</span>
                            <span className="cart-item-badge-desc">-13%</span>
                          </>
                        )}
                      </div>
                      <div className="cart-item-qty">
                        <button onClick={() => updateQuantity(item.id, item.cantidad - 1)}>-</button>
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock}
                        >+</button>
                        {item.stock && (
                          <span className="cart-max-units">Máx {item.stock} unidades</span>
                        )}
                      </div>
                      {item.cantidad >= item.stock && (
                        <span className="cart-stock-limite">Límite de stock alcanzado</span>
                      )}
                    </div>
                    <div className="cart-item-right">
                      <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>&times;</button>
                      <span className="cart-item-subtotal">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-clear" onClick={clearCart}>Vaciar carrito</button>
            </div>

            <div className="cart-resumen">
              <h3 className="resumen-title">Resumen de la orden</h3>
              <div className="resumen-body">
                <div className="resumen-row">
                  <span>Subtotal ({totalItems})</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>
                {descuentos > 0 && (
                  <div className="resumen-row resumen-descuento">
                    <span>Descuentos</span>
                    <span>- S/ {descuentos.toFixed(2)}</span>
                  </div>
                )}
                <div className="resumen-row">
                  <span>IGV (18%)</span>
                  <span>S/ {igv.toFixed(2)}</span>
                </div>
                <div className="resumen-divider" />
                <div className="resumen-row resumen-total">
                  <span>Total</span>
                  <span>S/ {totalConIgv.toFixed(2)}</span>
                </div>
              </div>
              <button className="btn-checkout" onClick={() => setCheckoutOpen(true)}>
                Continuar compra
              </button>
            </div>
          </div>
        )}
      </aside>

      {checkoutOpen && (
        <CheckoutModal
          onClose={() => setCheckoutOpen(false)}
          onConfirm={handleConfirmarPago}
          total={totalConIgv}
          igv={igv}
          subtotal={subtotal}
          descuentos={descuentos}
        />
      )}

      {ticketFactura && (
        <TicketModal
          factura={ticketFactura}
          onClose={() => setTicketFactura(null)}
        />
      )}
    </>
  );
}
