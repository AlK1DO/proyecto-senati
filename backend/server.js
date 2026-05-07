require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productosRouter = require("./routes/productos");
const facturasRouter = require("./routes/facturas");
const clientesRouter = require("./routes/clientes");
const authRouter = require("./routes/auth");
const estadisticasRouter = require("./routes/estadisticas");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ──
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  // En producción, agrega tu dominio de Vercel:
  // "https://tu-app.vercel.app",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej. Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para origen: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// ── Rutas ──
app.use("/api/productos", productosRouter);
app.use("/api/facturas", facturasRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/auth", authRouter);
app.use("/api/estadisticas", estadisticasRouter);

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// ── Error handler global ──
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`TechLedger API corriendo en http://localhost:${PORT}`);
  console.log(`   Rutas disponibles:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/productos`);
  console.log(`   GET  /api/facturas`);
  console.log(`   POST /api/facturas`);
  console.log(`   GET  /api/clientes`);
  console.log(`   GET  /api/auth/me`);
});
