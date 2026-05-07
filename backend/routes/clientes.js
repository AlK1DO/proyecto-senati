const express = require("express");
const router = express.Router();
const { db, auth } = require("../config/firebase");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");

const COLLECTION = "usuarios";

// ── GET /api/clientes ── Listar todos los usuarios (solo admin)
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const snap = await db.collection(COLLECTION).get();
    const clientes = snap.docs.map((doc) => {
      const data = doc.data();
      // No exponer campos sensibles
      const { password, ...safe } = data;
      return { id: doc.id, ...safe };
    });

    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener clientes", detail: err.message });
  }
});

// ── GET /api/clientes/:uid ── Obtener un cliente (admin o el mismo usuario)
router.get("/:uid", verifyToken, async (req, res) => {
  try {
    // Solo admin o el propio usuario puede ver su perfil
    const userSnap = await db.collection(COLLECTION).doc(req.user.uid).get();
    const rol = userSnap.exists ? (userSnap.data().rol || "usuario").toLowerCase() : "usuario";

    if (rol !== "admin" && req.params.uid !== req.user.uid) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const snap = await db.collection(COLLECTION).doc(req.params.uid).get();
    if (!snap.exists) return res.status(404).json({ error: "Cliente no encontrado" });

    const { password, ...safe } = snap.data();
    res.json({ id: snap.id, ...safe });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener cliente", detail: err.message });
  }
});

// ── PUT /api/clientes/:uid ── Actualizar perfil (admin o el mismo usuario)
router.put("/:uid", verifyToken, async (req, res) => {
  try {
    const userSnap = await db.collection(COLLECTION).doc(req.user.uid).get();
    const rol = userSnap.exists ? (userSnap.data().rol || "usuario").toLowerCase() : "usuario";

    if (rol !== "admin" && req.params.uid !== req.user.uid) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const ref = db.collection(COLLECTION).doc(req.params.uid);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Cliente no encontrado" });

    const campos = {};
    const permitidos = ["nombre", "telefono", "direccion", "photoURL"];

    // Solo admin puede cambiar el rol
    if (rol === "admin" && req.body.rol) {
      campos.rol = req.body.rol;
    }

    for (const key of permitidos) {
      if (req.body[key] !== undefined) campos[key] = req.body[key];
    }
    campos.actualizadoEn = new Date().toISOString();

    await ref.update(campos);
    res.json({ id: req.params.uid, ...snap.data(), ...campos });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar cliente", detail: err.message });
  }
});

// ── DELETE /api/clientes/:uid ── Eliminar usuario (solo admin)
router.delete("/:uid", verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (req.params.uid === req.user.uid) {
      return res.status(400).json({ error: "No puedes eliminarte a ti mismo" });
    }

    // Eliminar de Firestore
    await db.collection(COLLECTION).doc(req.params.uid).delete();

    // Eliminar de Firebase Auth
    try {
      await auth.deleteUser(req.params.uid);
    } catch {
      // Si no existe en Auth, continuar igual
    }

    res.json({ message: "Cliente eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar cliente", detail: err.message });
  }
});

module.exports = router;
