const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");

const COLLECTION = "facturas";

function generarNumero() {
  const año = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return `TL-${año}-${rand}`;
}

// ── GET /api/facturas ── Admin: todas | Usuario: solo las suyas
router.get("/", verifyToken, async (req, res) => {
  try {
    const userSnap = await db.collection("usuarios").doc(req.user.uid).get();
    const rol = userSnap.exists ? (userSnap.data().rol || "usuario").toLowerCase() : "usuario";

    const { estado, metodoPago, tipoDoc } = req.query;

    // Firestore no permite orderBy + where en campos distintos sin índice compuesto.
    // Construimos la query base y filtramos en memoria cuando hay filtros extra.
    let query = db.collection(COLLECTION);

    if (rol !== "admin") {
      // Usuario normal: solo sus facturas
      query = query.where("usuario.uid", "==", req.user.uid);
    }

    // Aplicar filtros simples que no requieren índice compuesto con orderBy
    if (estado) query = query.where("estado", "==", estado);
    if (metodoPago) query = query.where("metodoPago", "==", metodoPago);
    if (tipoDoc) query = query.where("tipoDoc", "==", tipoDoc);

    const snap = await query.get();
    let facturas = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Ordenar por fecha descendente en memoria (evita necesidad de índices compuestos)
    facturas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json(facturas);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener facturas", detail: err.message });
  }
});

// ── GET /api/facturas/:id ── Obtener una factura
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const snap = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Factura no encontrada" });

    const factura = { id: snap.id, ...snap.data() };

    // Verificar que el usuario sea dueño o admin
    const userSnap = await db.collection("usuarios").doc(req.user.uid).get();
    const rol = userSnap.exists ? (userSnap.data().rol || "usuario").toLowerCase() : "usuario";

    if (rol !== "admin" && factura.usuario.uid !== req.user.uid) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    res.json(factura);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener factura", detail: err.message });
  }
});

// ── POST /api/facturas ── Crear factura (usuario autenticado)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { usuario, items, metodoPago, tipoDoc = "boleta", ruc = "", razonSocial = "", direccion = "" } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Se requieren items para crear la factura" });
    }
    if (!metodoPago) {
      return res.status(400).json({ error: "Se requiere método de pago" });
    }
    if (tipoDoc === "factura" && (!ruc || !razonSocial)) {
      return res.status(400).json({ error: "RUC y razón social son obligatorios para facturas" });
    }

    const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const igv = parseFloat((subtotal * 0.18).toFixed(2));
    const descuentos = items.reduce((acc, i) => {
      if (i.oferta) return acc + (i.precio * 1.15 - i.precio) * i.cantidad;
      return acc;
    }, 0);
    const total = parseFloat((subtotal + igv).toFixed(2));

    const nueva = {
      id: generarNumero(),
      fecha: new Date().toISOString(),
      usuario: {
        uid: req.user.uid,
        nombre: usuario?.nombre || "",
        email: req.user.email || "",
      },
      items: items.map((i) => ({
        id: i.id,
        nombre: i.nombre,
        precio: parseFloat(i.precio),
        cantidad: parseInt(i.cantidad),
        subtotal: parseFloat((i.precio * i.cantidad).toFixed(2)),
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      igv,
      descuentos: parseFloat(descuentos.toFixed(2)),
      total,
      metodoPago,
      tipoDoc,
      ruc,
      razonSocial,
      direccion,
      estado: "pagado",
      creadoEn: new Date().toISOString(),
    };

    // Guardar con el ID generado como document ID
    await db.collection(COLLECTION).doc(nueva.id).set(nueva);

    // Actualizar stock de productos buscando por el campo "id" numérico original
    const batch = db.batch();
    for (const item of items) {
      // item.id puede ser el ID numérico original del JSON o el doc ID de Firestore
      // Intentamos primero por doc ID, luego por campo "id"
      let prodRef = null;
      let stockActual = 0;

      const directSnap = await db.collection("productos").doc(String(item.id)).get();
      if (directSnap.exists) {
        prodRef = directSnap.ref;
        stockActual = directSnap.data().stock || 0;
      } else {
        // Buscar por nombre como fallback
        const querySnap = await db.collection("productos")
          .where("nombre", "==", item.nombre)
          .limit(1)
          .get();
        if (!querySnap.empty) {
          prodRef = querySnap.docs[0].ref;
          stockActual = querySnap.docs[0].data().stock || 0;
        }
      }

      if (prodRef) {
        batch.update(prodRef, { stock: Math.max(0, stockActual - item.cantidad) });
      }
    }
    await batch.commit();

    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: "Error al crear factura", detail: err.message });
  }
});

// ── PUT /api/facturas/:id ── Editar estado o método de pago (solo admin)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Factura no encontrada" });

    const campos = {};
    if (req.body.estado) campos.estado = req.body.estado;
    if (req.body.metodoPago) campos.metodoPago = req.body.metodoPago;
    campos.actualizadoEn = new Date().toISOString();

    await ref.update(campos);
    res.json({ id: req.params.id, ...snap.data(), ...campos });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar factura", detail: err.message });
  }
});

// ── PATCH /api/facturas/:id/anular ── Anular factura (solo admin)
router.patch("/:id/anular", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Factura no encontrada" });
    if (snap.data().estado === "anulado") {
      return res.status(400).json({ error: "La factura ya está anulada" });
    }

    const factura = snap.data();

    // Anular la factura
    await ref.update({ estado: "anulado", anuladoEn: new Date().toISOString() });

    // Devolver stock de cada producto
    const batch = db.batch();
    for (const item of factura.items || []) {
      // Buscar por doc ID directo primero
      const directSnap = await db.collection("productos").doc(String(item.id)).get();
      if (directSnap.exists) {
        const stockActual = directSnap.data().stock || 0;
        batch.update(directSnap.ref, { stock: stockActual + item.cantidad });
      } else {
        // Fallback: buscar por nombre
        const querySnap = await db.collection("productos")
          .where("nombre", "==", item.nombre)
          .limit(1)
          .get();
        if (!querySnap.empty) {
          const stockActual = querySnap.docs[0].data().stock || 0;
          batch.update(querySnap.docs[0].ref, { stock: stockActual + item.cantidad });
        }
      }
    }
    await batch.commit();

    res.json({ message: "Factura anulada y stock restaurado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al anular factura", detail: err.message });
  }
});

module.exports = router;
