const { auth, db } = require("../config/firebase");

/**
 * Middleware que verifica el Firebase ID Token del header Authorization.
 * Agrega req.user con { uid, email } si es válido.
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/**
 * Middleware que además verifica que el usuario sea admin.
 * Requiere que verifyToken haya corrido antes.
 */
async function verifyAdmin(req, res, next) {
  try {
    const snap = await db.collection("usuarios").doc(req.user.uid).get();
    if (!snap.exists) {
      return res.status(403).json({ error: "Usuario no encontrado" });
    }

    const rol = (snap.data().rol || "usuario").toLowerCase();
    if (rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado: se requiere rol admin" });
    }

    req.userProfile = snap.data();
    next();
  } catch (err) {
    return res.status(500).json({ error: "Error verificando permisos" });
  }
}

module.exports = { verifyToken, verifyAdmin };
