const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { verifyToken } = require("../middleware/verifyToken");

// ── GET /api/estadisticas ── Admin ve todo, usuario ve sus propias stats
router.get("/", verifyToken, async (req, res) => {
  try {
    const userSnap = await db.collection("usuarios").doc(req.user.uid).get();
    const rol = userSnap.exists ? (userSnap.data().rol || "usuario").toLowerCase() : "usuario";
    const esAdmin = rol === "admin";

    // Traer productos siempre completos
    const productosSnap = await db.collection("productos").get();
    const productos = productosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Facturas: admin ve todas, usuario solo las suyas
    let facturasQuery = db.collection("facturas");
    if (!esAdmin) {
      facturasQuery = facturasQuery.where("usuario.uid", "==", req.user.uid);
    }
    const facturasSnap = await facturasQuery.get();

    const todasFacturas = facturasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Solo contar las no anuladas para ingresos, pero mostrar conteo total por tipo
    const facturas = todasFacturas.filter((f) => f.estado !== "anulado");

    // ── KPIs de inventario (solo admin ve inventario completo) ──
    const totalProductos = productos.length;
    const stockTotal = productos.reduce((s, p) => s + (p.stock || 0), 0);
    const valorInventario = productos.reduce((s, p) => s + (p.precio || 0) * (p.stock || 0), 0);
    const stockBajo = productos.filter((p) => p.stock <= 5).length;

    // ── KPIs de ventas ──
    const totalFacturas = todasFacturas.length; // total incluyendo anuladas para el conteo
    const ingresoTotal = facturas.reduce((s, f) => s + (f.total || 0), 0);

    // Contar por tipoDoc en todas (incluyendo anuladas para mostrar cuántas se emitieron)
    const totalBoletas = todasFacturas.filter((f) => f.tipoDoc === "boleta").length;
    const totalFacturasDoc = todasFacturas.filter((f) => f.tipoDoc === "factura").length;

    // ── Ventas por mes (últimos 12 meses) ──
    const ahora = new Date();
    const ventasPorMes = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const key = d.toLocaleString("es-PE", { month: "short", year: "2-digit" });
      ventasPorMes[key] = 0;
    }

    facturas.forEach((f) => {
      const fecha = new Date(f.fecha);
      const key = fecha.toLocaleString("es-PE", { month: "short", year: "2-digit" });
      if (ventasPorMes[key] !== undefined) {
        ventasPorMes[key] += f.total || 0;
      }
    });

    const ventasMensuales = Object.entries(ventasPorMes).map(([mes, ventas]) => ({
      mes,
      ventas: parseFloat(ventas.toFixed(2)),
    }));

    // ── Transacciones por día (última semana) ──
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const transaccionesPorDia = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = diasSemana[d.getDay()];
      transaccionesPorDia[key] = 0;
    }

    facturas.forEach((f) => {
      const fecha = new Date(f.fecha);
      const hoy = new Date();
      const diffDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
      if (diffDias <= 6) {
        const key = diasSemana[fecha.getDay()];
        if (transaccionesPorDia[key] !== undefined) {
          transaccionesPorDia[key]++;
        }
      }
    });

    const transaccionesSemanales = Object.entries(transaccionesPorDia).map(([dia, transacciones]) => ({
      dia,
      transacciones,
    }));

    // ── Ventas por categoría ──
    const ventasPorCategoria = {};
    facturas.forEach((f) => {
      (f.items || []).forEach((item) => {
        // Buscar categoría del producto
        const prod = productos.find((p) => p.nombre === item.nombre);
        const cat = prod?.categoria || "Otros";
        ventasPorCategoria[cat] = (ventasPorCategoria[cat] || 0) + (item.subtotal || 0);
      });
    });

    const categorias = Object.entries(ventasPorCategoria)
      .map(([nombre, total]) => ({ nombre, total: parseFloat(total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total);

    // ── Métodos de pago ──
    const metodosPago = {};
    facturas.forEach((f) => {
      const m = f.metodoPago || "otro";
      metodosPago[m] = (metodosPago[m] || 0) + 1;
    });

    // ── Productos más vendidos ──
    const ventasPorProducto = {};
    facturas.forEach((f) => {
      (f.items || []).forEach((item) => {
        if (!ventasPorProducto[item.nombre]) {
          ventasPorProducto[item.nombre] = { nombre: item.nombre, cantidad: 0, ingresos: 0 };
        }
        ventasPorProducto[item.nombre].cantidad += item.cantidad || 0;
        ventasPorProducto[item.nombre].ingresos += item.subtotal || 0;
      });
    });

    const masVendidos = Object.values(ventasPorProducto)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
      .map((p) => ({ ...p, ingresos: parseFloat(p.ingresos.toFixed(2)) }));

    // ── Productos críticos (stock bajo) ──
    const productosCriticos = productos
      .filter((p) => p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        precio: p.precio,
        stock: p.stock,
        imagen: p.imagen,
      }));

    res.json({
      inventario: { totalProductos, stockTotal, valorInventario, stockBajo },
      ventas: { totalFacturas, ingresoTotal, totalBoletas, totalFacturasDoc },
      ventasMensuales,
      transaccionesSemanales,
      categorias,
      metodosPago,
      masVendidos,
      productosCriticos,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener estadísticas", detail: err.message });
  }
});

module.exports = router;
