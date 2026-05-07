<div align="center">

# ⬡ TechLedger
### Sistema de Facturación Electrónica

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

> Plataforma completa de facturación con gestión de productos, clientes, boletas y facturas electrónicas. Arquitectura fullstack con autenticación segura por roles, estadísticas en tiempo real e integridad de datos en stock.

</div>

---

## 📋 Índice

- [Arquitectura General](#️-arquitectura-general)
- [Frontend](#-frontend)
  - [Tecnologías](#tecnologías-frontend)
  - [Estructura de Carpetas](#estructura-de-carpetas)
  - [Páginas](#páginas)
  - [Componentes](#componentes)
  - [Contextos (Estado Global)](#contextos-estado-global)
  - [Capa de Servicios](#capa-de-servicios)
- [Backend](#️-backend)
  - [Tecnologías](#tecnologías-backend)
  - [Estructura del Backend](#estructura-del-backend)
  - [Configuración Firebase Admin](#configuración-firebase-admin)
  - [Middlewares](#middlewares)
  - [Endpoints de la API](#endpoints-de-la-api)
  - [Lógica de Negocio](#lógica-de-negocio)
  - [Base de Datos Firestore](#base-de-datos-firestore)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Seguridad](#-seguridad)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Navegador)                       │
│                                                                   │
│   ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│   │   Páginas   │───▶│   Contextos  │───▶│ services/api.js  │   │
│   │  (React)    │    │ (Estado Global)│   │ (Service Layer)  │   │
│   └─────────────┘    └──────────────┘    └────────┬─────────┘   │
└────────────────────────────────────────────────────┼────────────┘
                                                     │ HTTP + JWT Token
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                    │
│                                                                   │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │
│   │    Routes    │──▶│  Middleware  │──▶│     Firestore    │   │
│   │(Controladores)│  │(Auth + Roles)│   │  (Base de datos) │   │
│   └──────────────┘   └──────────────┘   └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Firebase Auth  │
                    │  (Autenticación) │
                    └──────────────────┘
```

**Flujo de una petición:**
1. Usuario realiza una acción en el frontend
2. El servicio obtiene el **ID Token** de Firebase Auth
3. Envía la petición al backend con `Authorization: Bearer <token>`
4. El backend verifica el token y el rol del usuario
5. Consulta o modifica datos en **Firestore**
6. Devuelve la respuesta al frontend

---

## Frontend

### Tecnologías Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| **React** | 19 | Framework de UI |
| **Vite** | 8 | Build tool y servidor de desarrollo |
| **Firebase SDK** | 12 | Autenticación client-side |
| **Context API** | — | Estado global (carrito, facturas) |
| **Recharts** | 3 | Gráficas en estadísticas |
| **CSS Modules** | — | Estilos por componente |

---

### Estructura de Carpetas

```
src/
├── assets/                  # Imágenes y videos estáticos
├── components/              # Componentes reutilizables de UI
│   ├── Cart.jsx / .css          → Carrito + checkout + ticket post-compra
│   ├── HeroCarousel.jsx / .css  → Carrusel de la página de inicio
│   ├── Navbar.jsx / .css        → Barra de navegación con roles
│   ├── ProductCard.jsx / .css   → Tarjeta de producto
│   └── estadisticas/            → Componentes de gráficas
│       ├── KpiCards.jsx             → Tarjetas de métricas clave
│       ├── TransaccionesChart.jsx   → Gráfica de área semanal
│       ├── VentasMensualesChart.jsx → Gráfica de línea mensual
│       ├── MetodosPagoChart.jsx     → Gráfica de barras por método
│       ├── CategoriasChart.jsx      → Gráfica donut por categoría
│       ├── MasVendidosChart.jsx     → Top 5 productos más vendidos
│       └── CriticosTable.jsx        → Tabla de stock crítico
├── context/                 # Estado global con Context API
│   ├── CartContext.jsx          → Estado del carrito en memoria
│   └── FacturasContext.jsx      → Facturas conectadas a la API
├── pages/                   # Páginas principales
│   ├── Login.jsx / .css         → Inicio de sesión y registro
│   ├── Productos.jsx / .css     → Catálogo de productos (Firestore)
│   ├── GestionProductos.jsx / .css → CRUD de productos (solo admin)
│   ├── Facturas.jsx / .css      → Historial de comprobantes
│   ├── Clientes.jsx / .css      → Gestión de clientes (solo admin)
│   ├── Estadisticas.jsx / .css  → Dashboard con datos reales
│   ├── Perfil.jsx / .css        → Perfil del usuario
│   └── Soporte.jsx / .css       → Formulario de soporte
├── services/
│   └── api.js               # Capa de servicios — todos los endpoints
├── firebase.js              # Configuración Firebase Client SDK
├── App.jsx                  # Componente raíz y enrutamiento
└── main.jsx                 # Punto de entrada
```

---

### Páginas

#### Login (`/pages/Login.jsx`)
Autenticación con Firebase Auth (email + contraseña).

- Dos modos: iniciar sesión y registrarse
- Al registrarse llama a `POST /api/auth/register` para crear el perfil en Firestore
- Validación de campos y manejo de errores de Firebase

---

#### Productos (`/pages/Productos.jsx`)
Catálogo de productos cargado desde Firestore via API.

- Carga desde `GET /api/productos` al montar el componente
- Búsqueda en tiempo real por nombre
- Filtro por categoría con dropdown animado
- Paginación de 8 productos por página
- Favoritos en estado local
- Skeleton loading mientras cargan
- Modal de detalle con descripción completa
- Botón "Agregar al carrito" con feedback visual

---

#### Gestión de Productos (`/pages/GestionProductos.jsx`) — *Solo Admin*
Panel CRUD completo para administrar el catálogo.

- Tabla con imagen, nombre, categoría, precio, stock, rating y oferta
- Indicador visual de stock bajo (< 5) con borde rojo
- **Crear** → modal con formulario + preview de imagen en tiempo real
- **Editar** → mismo modal prellenado
- **Eliminar** → modal de confirmación antes de borrar
- Stats en el header: total, en oferta, stock bajo
- Conectado a `POST/PUT/DELETE /api/productos`

---

#### Facturas (`/pages/Facturas.jsx`)
Historial de comprobantes con dos vistas según el rol.

**Vista Admin:**
- Tabla con todas las facturas del sistema
- Filtros por estado, método de pago y tipo de documento
- Buscador por número, cliente o email
- Anular facturas (restaura el stock automáticamente)
- Editar estado y método de pago

**Vista Cliente:**
- Cards con sus propias facturas/boletas
- Filtro por tipo de documento
- Modal de detalle completo

**Modal de detalle (ambas vistas):**
- Diseño tipo ticket con cabecera TechLedger
- Muestra RUC y razón social si es factura electrónica
- Tabla de productos con cantidades y subtotales
- Totales: subtotal, descuentos, IGV (18%), total a pagar
- Impresión optimizada — solo imprime el modal activo (sin duplicados)

---

#### Estadísticas (`/pages/Estadisticas.jsx`)
Dashboard con datos reales de Firestore via `GET /api/estadisticas`.

**Vista Admin — 6 KPIs:**
- Total productos, Valor inventario, Stock bajo
- Ingresos totales, Boletas/Facturas emitidas, Ticket promedio

**Vista Usuario — 3 KPIs:**
- Sus ingresos totales, sus boletas/facturas, su ticket promedio

**7 gráficas con datos reales:**
- Transacciones de los últimos 7 días (área)
- Ingresos de los últimos 12 meses (línea)
- Métodos de pago más usados (barras)
- Ventas por categoría (donut)
- Top 5 productos más vendidos (barras)
- Tabla de stock crítico (solo admin)

Los datos se actualizan cada vez que el usuario navega a la sección.

---

#### Clientes (`/pages/Clientes.jsx`) — *Solo Admin*
Gestión de usuarios registrados desde `GET /api/clientes`.

---

#### Perfil (`/pages/Perfil.jsx`)
Editar nombre, teléfono, dirección y foto de perfil.
Cambios sincronizados con Firestore via `PUT /api/clientes/:uid`.

---

#### Soporte (`/pages/Soporte.jsx`)
Formulario de contacto usando **EmailJS**.

---

### Componentes

#### Cart (`/components/Cart.jsx`)
Panel lateral de carrito + flujo de pago completo.

**Carrito:**
- Lista de productos con controles de cantidad y límite de stock
- Resumen con subtotal, descuentos e IGV

**Checkout Modal:**
- Selección de tipo: **Boleta** o **Factura**
- Si es factura: RUC, razón social y dirección fiscal (obligatorios)
- Métodos de pago: BCP, BBVA, Scotiabank, Yape
- Formulario de tarjeta para pagos con tarjeta
- QR de Yape para pagos con Yape
- Spinner "Procesando pago..." mientras espera la API

**Ticket de confirmación post-pago:**
- Muestra todos los datos incluyendo RUC/razón social si es factura
- Botón de imprimir con diseño optimizado para papel
- Impresión con `data-print-active` para evitar duplicados

---

#### Navbar (`/components/Navbar.jsx`)
Barra de navegación sticky con glassmorphism.

- Adaptación por rol:
  - **Admin:** ve Clientes + Productos Admin + Estadísticas
  - **Usuario:** ve Perfil en lugar de Clientes + Estadísticas
- Avatar con iniciales o foto de perfil
- Menú hamburguesa para móviles

---

#### ProductCard (`/components/ProductCard.jsx`)
- Imagen con zoom al hover
- Overlay con lupa (modal detalle) y corazón (favorito)
- Badge de descuento si está en oferta
- Indicador de stock bajo con barra roja
- Botón "Agregar al carrito" siempre al mismo nivel (`margin-top: auto`)

---

### Contextos (Estado Global)

#### CartContext
```javascript
addToCart(product)           // Agrega o incrementa cantidad
removeFromCart(id)           // Elimina un producto
updateQuantity(id, cantidad) // Cambia la cantidad
clearCart()                  // Vacía el carrito
// Valores: cartItems, total, totalItems
```

#### FacturasContext
Se carga automáticamente cuando el usuario se autentica (`onAuthStateChanged`).
```javascript
crearFactura(datos)            // POST /api/facturas
anularFactura(id)              // PATCH /api/facturas/:id/anular
actualizarFactura(id, cambios) // PUT /api/facturas/:id
getFacturasDeUsuario(uid)      // Filtra en memoria
recargar()                     // Vuelve a llamar a la API
// Valores: facturas, loading, error
```

---

### Capa de Servicios

**`/services/api.js`** — Centraliza toda la comunicación con el backend.

Cada método obtiene automáticamente el token de Firebase y lo incluye en el header `Authorization: Bearer <token>`.

```javascript
productosService.getAll(params)      // GET    /api/productos
productosService.create(data)        // POST   /api/productos
productosService.update(id, data)    // PUT    /api/productos/:id
productosService.delete(id)          // DELETE /api/productos/:id

facturasService.getAll(params)       // GET    /api/facturas
facturasService.create(data)         // POST   /api/facturas
facturasService.update(id, data)     // PUT    /api/facturas/:id
facturasService.anular(id)           // PATCH  /api/facturas/:id/anular

clientesService.getAll()             // GET    /api/clientes
clientesService.update(uid, data)    // PUT    /api/clientes/:uid
clientesService.delete(uid)          // DELETE /api/clientes/:uid

estadisticasService.getResumen()     // GET    /api/estadisticas

authService.register(data)           // POST   /api/auth/register
authService.me()                     // GET    /api/auth/me
```

> **Patrón Service Layer:** El token, la URL base y el manejo de errores se escriben una sola vez. Los componentes solo llaman `facturasService.create(data)` sin saber nada del backend.

---

## Backend

### Tecnologías Backend

| Tecnología | Versión | Uso |
|---|---|---|
| **Node.js** | 18+ | Runtime de JavaScript |
| **Express.js** | 4 | Framework HTTP |
| **Firebase Admin SDK** | 12 | Firestore + verificación de tokens |
| **dotenv** | 16 | Variables de entorno |
| **cors** | 2 | Política de origen cruzado |
| **nodemon** | 3 | Reinicio automático en desarrollo |

---

### Estructura del Backend

```
backend/
├── server.js                    # Punto de entrada — configura Express
├── config/
│   └── firebase.js              # Inicializa Firebase Admin SDK
├── middleware/
│   └── verifyToken.js           # verifyToken + verifyAdmin
├── routes/
│   ├── productos.js             # CRUD de productos
│   ├── facturas.js              # CRUD de facturas + restock al anular
│   ├── clientes.js              # Gestión de usuarios
│   ├── estadisticas.js          # Dashboard con datos reales de Firestore
│   └── auth.js                  # Registro y perfil
├── scripts/
│   └── seedProductos.js         # Carga inicial de 12 productos a Firestore
├── .env                         # Variables de entorno (no subir a Git)
├── .gitignore
└── package.json
```

---

### Configuración Firebase Admin

**`config/firebase.js`** — Inicializa el Admin SDK con el service account JSON.

```javascript
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});
const db   = admin.firestore(); // Base de datos
const auth = admin.auth();      // Autenticación
```


---

### Middlewares

**`middleware/verifyToken.js`**

#### `verifyToken` — Verifica autenticación
```
Header: Authorization: Bearer <token>
      ↓
Firebase Admin verifica la firma JWT
      ↓
¿Válido? ──NO──▶ 401 Unauthorized
   │SÍ
   ▼
req.user = { uid, email } → continúa
```

#### `verifyAdmin` — Verifica rol de administrador
```
(Requiere verifyToken antes)
      ↓
Consulta Firestore: usuarios/{uid} → lee campo "rol"
      ↓
¿rol === "admin"? ──NO──▶ 403 Forbidden
        │SÍ
        ▼
req.userProfile = datos → continúa
```

---

### Endpoints de la API

> Base URL: `http://localhost:3001/api`

---

#### Productos — `/api/productos`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/productos` | Público | Lista todos los productos |
| `GET` | `/api/productos/:id` | Público | Obtiene un producto por ID |
| `POST` | `/api/productos` |  Admin | Crea un nuevo producto |
| `PUT` | `/api/productos/:id` | Admin | Actualiza un producto |
| `DELETE` | `/api/productos/:id` | Admin | Elimina un producto |

**Query params:** `?categoria=Laptops` · `?oferta=true`

---

#### 🧾 Facturas — `/api/facturas`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/facturas` |  Usuario | Admin ve todas; usuario ve solo las suyas |
| `GET` | `/api/facturas/:id` |  Usuario | Obtiene una factura (verifica propiedad) |
| `POST` | `/api/facturas` | Usuario | Crea factura y descuenta stock |
| `PUT` | `/api/facturas/:id` |  Admin | Edita estado o método de pago |
| `PATCH` | `/api/facturas/:id/anular` |  Admin | Anula y restaura stock |

**Query params:** `?estado=pagado` · `?metodoPago=yape` · `?tipoDoc=boleta`

---

####  Estadísticas — `/api/estadisticas`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/estadisticas` |  Usuario | Admin ve todo; usuario ve sus propias stats |

**Respuesta:**
```json
{
  "inventario": { "totalProductos", "stockTotal", "valorInventario", "stockBajo" },
  "ventas": { "totalFacturas", "ingresoTotal", "totalBoletas", "totalFacturasDoc" },
  "ventasMensuales": [{ "mes", "ventas" }],
  "transaccionesSemanales": [{ "dia", "transacciones" }],
  "categorias": [{ "nombre", "total" }],
  "metodosPago": { "bcp": 3, "yape": 2 },
  "masVendidos": [{ "nombre", "cantidad", "ingresos" }],
  "productosCriticos": [{ "id", "nombre", "stock", ... }]
}
```

---

####  Clientes — `/api/clientes`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/clientes` |  Admin | Lista todos los usuarios |
| `GET` | `/api/clientes/:uid` |  Usuario | Admin o el propio usuario |
| `PUT` | `/api/clientes/:uid` |  Usuario | Actualiza perfil |
| `DELETE` | `/api/clientes/:uid` |  Admin | Elimina de Firestore y Auth |

---

####  Auth — `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | Público | Crea perfil en Firestore tras registro |
| `GET` | `/api/auth/me` |  Usuario | Perfil del usuario autenticado |

---

### Lógica de Negocio

#### Creación de factura (`POST /api/facturas`)
```
Recibe items + metodoPago + tipoDoc
      ↓
Valida: items no vacíos, metodoPago presente
Si tipoDoc === "factura": RUC y razón social obligatorios
      ↓
Calcula: subtotal, IGV (18%), descuentos, total
      ↓
Genera número único: TL-2026-XXXXXX
      ↓
Guarda en Firestore colección "facturas"
      ↓
batch.update() → descuenta stock de cada producto (transacción atómica)
      ↓
Devuelve la factura creada
```

#### Anulación de factura (`PATCH /api/facturas/:id/anular`)
```
Verifica que exista y no esté ya anulada
      ↓
Actualiza estado → "anulado" + anuladoEn timestamp
      ↓
batch.update() → RESTAURA el stock de cada producto (transacción atómica)
      ↓
Devuelve confirmación
```

> **Integridad de datos:** El stock siempre refleja la realidad. Al comprar baja, al anular sube. Ambas operaciones usan `batch.update()` de Firestore para garantizar que todas las actualizaciones se aplican juntas o ninguna.

---

### Base de Datos Firestore

#### Colección `productos`
```json
{
  "id": "auto-generado-por-firestore",
  "nombre": "Laptop ASUS ROG Strix G16",
  "precio": 5299.99,
  "stock": 7,
  "categoria": "Laptops",
  "rating": 5,
  "imagen": "https://...",
  "oferta": true,
  "descripcion": "Laptop gaming con RTX 4070...",
  "creadoEn": "2026-05-06T10:00:00.000Z"
}
```

#### Colección `facturas`
```json
{
  "id": "TL-2026-558359",
  "fecha": "2026-05-06T01:27:00.000Z",
  "usuario": { "uid": "abc123", "nombre": "Keller Robles", "email": "..." },
  "items": [{ "id": "xyz", "nombre": "...", "precio": 529.99, "cantidad": 1, "subtotal": 529.99 }],
  "subtotal": 4629.97,
  "igv": 833.39,
  "descuentos": 409.50,
  "total": 5463.36,
  "metodoPago": "bcp",
  "tipoDoc": "boleta",
  "ruc": "",
  "razonSocial": "",
  "direccion": "",
  "estado": "pagado",
  "creadoEn": "2026-05-06T01:27:00.000Z"
}
```

#### Colección `usuarios`
```json
{
  "uid": "abc123",
  "nombre": "Keller Robles",
  "email": "keller@example.com",
  "rol": "usuario",
  "photoURL": "",
  "telefono": "",
  "direccion": "",
  "creadoEn": "2026-05-01T10:00:00.000Z"
}
```

---

##  Instalación y Ejecución

### Requisitos previos
- **Node.js** 18+
- **npm** 9+
- Cuenta de **Firebase** con proyecto creado
- **Service Account JSON** descargado desde Firebase Console

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd techledger
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

**Crear `backend/.env`:**
```env
PORT=3001
FIREBASE_SERVICE_ACCOUNT=./sistema-de-facturacion-19da0-firebase-adminsdk-fbsvc-f32f90b454.json
```

**Colocar el Service Account JSON en `backend/`**

**Cargar productos iniciales (solo una vez):**
```bash
node scripts/seedProductos.js
```

**Arrancar el servidor:**
```bash
npm run dev
# TechLedger API corriendo en http://localhost:3001
```

### 3. Configurar el Frontend
```bash
cd ..
npm install
```

**Crear `.env` en la raíz:**
```env
VITE_API_URL=http://localhost:3001/api
```

**Arrancar el frontend:**
```bash
npm run dev
# http://localhost:5173
```

### 4. Verificar
```bash
curl http://localhost:3001/api/health
# { "status": "ok" }
```

---

## Seguridad

| Medida | Descripción |
|--------|-------------|
| **JWT Tokens** | Cada petición lleva el token de Firebase. Expira en 1 hora, se renueva automáticamente. |
| **Verificación server-side** | El backend verifica el token con Admin SDK en cada petición protegida. |
| **Control por roles** | El rol se guarda en Firestore y se verifica en el backend, no en el frontend. |
| **Service Account** | El JSON de credenciales está en `.gitignore`, nunca se sube al repositorio. |
| **Stock server-side** | El descuento y restauración de stock se hace en el backend con transacciones atómicas. |
| **Propiedad de datos** | Los usuarios solo ven sus propias facturas y estadísticas; el backend filtra por `uid`. |
| **Impresión segura** | El atributo `data-print-active` evita que se impriman múltiples modales simultáneamente. |

---

## Troubleshooting

**`Error: Token no proporcionado`**
```
Causa:   Usuario no autenticado o token expirado
Solución: Cerrar sesión y volver a iniciar sesión
```

**`Error: Acceso denegado: se requiere rol admin`**
```
Causa:   El usuario no tiene rol "admin" en Firestore
Solución: Firebase Console → Firestore → usuarios/{uid} → cambiar rol a "admin"
```

**`Error: Cannot find module './sistema-de-facturacion-...'`**
```
Causa:   El service account JSON no está en backend/
Solución: Descargarlo desde Firebase Console y colocarlo en backend/
```

**Las facturas no cargan**
```
Causa:   El backend no está corriendo
Solución: npm run dev en la carpeta backend/
```

**Los productos aparecen vacíos**
```
Causa:   No se ejecutó el seed o el backend está apagado
Solución: node backend/scripts/seedProductos.js
```

**Las estadísticas muestran "Sin datos aún"**
```
Causa:   No hay compras registradas en Firestore
Solución: Realizar al menos una compra desde la página de Productos
```

---

<div align="center">

**TechLedger** · Sistema de Facturación Electrónica · 2026

</div>
