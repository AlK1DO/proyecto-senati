const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");

const COLLECTION = "productos";

// ── GET /api/productos ── Listar todos (público)
router.get("/", async (req, res) => {
  try {
    const { categoria, oferta } = req.query;
    let query = db.collection(COLLECTION);

    if (categoria) query = query.where("categoria", "==", categoria);
    if (oferta === "true") query = query.where("oferta", "==", true);

    const snap = await query.get();
    const productos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos", detail: err.message });
  }
});

// ── GET /api/productos/:id ── Obtener uno (público)
router.get("/:id", async (req, res) => {
  try {
    const snap = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener producto", detail: err.message });
  }
});

// ── POST /api/productos ── Crear producto (solo admin)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { nombre, precio, stock, categoria, rating, imagen, oferta, descripcion } = req.body;

    if (!nombre || precio == null || stock == null || !categoria) {
      return res.status(400).json({ error: "Faltan campos obligatorios: nombre, precio, stock, categoria" });
    }

    const nuevo = {
      nombre,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      categoria,
      rating: parseInt(rating) || 0,
      imagen: imagen || "",
      oferta: Boolean(oferta),
      descripcion: descripcion || "",
      creadoEn: new Date().toISOString(),
    };

    const ref = await db.collection(COLLECTION).add(nuevo);
    res.status(201).json({ id: ref.id, ...nuevo });
  } catch (err) {
    res.status(500).json({ error: "Error al crear producto", detail: err.message });
  }
});

// ── PUT /api/productos/:id ── Actualizar producto (solo admin)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Producto no encontrado" });

    const campos = {};
    const permitidos = ["nombre", "precio", "stock", "categoria", "rating", "imagen", "oferta", "descripcion"];
    for (const key of permitidos) {
      if (req.body[key] !== undefined) campos[key] = req.body[key];
    }
    campos.actualizadoEn = new Date().toISOString();

    await ref.update(campos);
    res.json({ id: req.params.id, ...snap.data(), ...campos });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar producto", detail: err.message });
  }
});

// ── DELETE /api/productos/:id ── Eliminar producto (solo admin)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Producto no encontrado" });

    await ref.delete();
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar producto", detail: err.message });
  }
});

module.exports = router;
