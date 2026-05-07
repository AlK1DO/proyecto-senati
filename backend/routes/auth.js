const express = require("express");
const router = express.Router();
const { db, auth } = require("../config/firebase");
const { verifyToken } = require("../middleware/verifyToken");

// ── POST /api/auth/register ── Registrar usuario y crear perfil en Firestore
router.post("/register", async (req, res) => {
  try {
    const { uid, nombre, email, rol = "usuario" } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: "uid y email son obligatorios" });
    }

    // Verificar que el uid existe en Firebase Auth
    try {
      await auth.getUser(uid);
    } catch {
      return res.status(400).json({ error: "Usuario no encontrado en Firebase Auth" });
    }

    // Crear perfil en Firestore si no existe
    const ref = db.collection("usuarios").doc(uid);
    const snap = await ref.get();

    if (snap.exists) {
      return res.status(200).json({ message: "Perfil ya existe", perfil: snap.data() });
    }

    const perfil = {
      uid,
      nombre: nombre || email.split("@")[0],
      email,
      rol,
      photoURL: "",
      telefono: "",
      direccion: "",
      creadoEn: new Date().toISOString(),
    };

    await ref.set(perfil);
    res.status(201).json({ message: "Perfil creado", perfil });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar usuario", detail: err.message });
  }
});

// ── GET /api/auth/me ── Obtener perfil del usuario autenticado
router.get("/me", verifyToken, async (req, res) => {
  try {
    const snap = await db.collection("usuarios").doc(req.user.uid).get();
    if (!snap.exists) return res.status(404).json({ error: "Perfil no encontrado" });

    const { password, ...safe } = snap.data();
    res.json({ id: snap.id, ...safe });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener perfil", detail: err.message });
  }
});

module.exports = router;
