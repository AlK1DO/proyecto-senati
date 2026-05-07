import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { facturasService } from "../services/api";
import { auth } from "../firebase";

const FacturasContext = createContext();

export function FacturasProvider({ children }) {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarFacturas = useCallback(async () => {
    // Si no hay usuario autenticado, no intentar
    if (!auth.currentUser) return;

    setLoading(true);
    setError(null);
    try {
      const data = await facturasService.getAll();
      setFacturas(data);
    } catch (err) {
      setError(err.message);
      console.error("Error cargando facturas:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar facturas cuando el usuario se autentica
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        cargarFacturas();
      } else {
        // Usuario cerró sesión: limpiar
        setFacturas([]);
        setError(null);
      }
    });
    return () => unsub();
  }, [cargarFacturas]);

  async function crearFactura({ usuario, items, metodoPago, tipoDoc = "boleta", ruc = "", razonSocial = "", direccion = "" }) {
    const nueva = await facturasService.create({
      usuario,
      items,
      metodoPago,
      tipoDoc,
      ruc,
      razonSocial,
      direccion,
    });
    setFacturas((prev) => [nueva, ...prev]);
    return nueva;
  }

  async function anularFactura(id) {
    await facturasService.anular(id);
    setFacturas((prev) =>
      prev.map((f) => (f.id === id ? { ...f, estado: "anulado" } : f))
    );
  }

  async function actualizarFactura(id, cambios) {
    const actualizada = await facturasService.update(id, cambios);
    setFacturas((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...actualizada } : f))
    );
  }

  function getFacturasDeUsuario(uid) {
    return facturas.filter((f) => f.usuario?.uid === uid);
  }

  return (
    <FacturasContext.Provider
      value={{
        facturas,
        loading,
        error,
        crearFactura,
        anularFactura,
        actualizarFactura,
        getFacturasDeUsuario,
        recargar: cargarFacturas,
      }}
    >
      {children}
    </FacturasContext.Provider>
  );
}

export function useFacturas() {
  return useContext(FacturasContext);
}
