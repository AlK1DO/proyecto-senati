import { auth } from "../firebase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Obtiene el ID token del usuario autenticado para enviarlo al backend.
 */
async function getAuthHeader() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * Wrapper genérico para fetch con manejo de errores.
 */
async function request(endpoint, options = {}, requiresAuth = true) {
  const headers = { "Content-Type": "application/json" };

  if (requiresAuth) {
    const authHeader = await getAuthHeader();
    Object.assign(headers, authHeader);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }

  return data;
}

// ─────────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────────

export const productosService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/productos${query ? `?${query}` : ""}`, {}, false);
  },

  getById: (id) => request(`/productos/${id}`, {}, false),

  create: (data) =>
    request("/productos", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/productos/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id) =>
    request(`/productos/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────
// FACTURAS
// ─────────────────────────────────────────

export const facturasService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/facturas${query ? `?${query}` : ""}`);
  },

  getById: (id) => request(`/facturas/${id}`),

  create: (data) =>
    request("/facturas", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    request(`/facturas/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  anular: (id) =>
    request(`/facturas/${id}/anular`, { method: "PATCH" }),
};

// ─────────────────────────────────────────
// CLIENTES
// ─────────────────────────────────────────

export const clientesService = {
  getAll: () => request("/clientes"),

  getById: (uid) => request(`/clientes/${uid}`),

  update: (uid, data) =>
    request(`/clientes/${uid}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (uid) =>
    request(`/clientes/${uid}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

export const authService = {
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }, false),

  me: () => request("/auth/me"),
};

// ─────────────────────────────────────────
// ESTADÍSTICAS
// ─────────────────────────────────────────

export const estadisticasService = {
  getResumen: () => request("/estadisticas"),
};
