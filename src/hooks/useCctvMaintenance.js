import { useEffect, useState } from "react";
import { getCctvByDeviceId, applyCctvMaintenance } from "../api/cctvMaintenance";

export const useCctvMaintenance = () => {
  const [id, setId] = useState("");
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [historial, setHistorial] = useState([]); 

  //asegura que el hook de mantenimiento obtenga y exporte el historial
  const obtenerHistorial = async () => {
    const resp = await fetch("http://localhost:8080/api/cctv/maintenance/history");
    const data = await resp.json();
    setHistorial(data);
  };

  useEffect(() => {
    obtenerHistorial();
  }, []);

  const buscarId = async () => {
    if (!id.trim()) return;
    setLoading(true);
    setDeviceData(null);
    setError("");

    try {
      const response = await getCctvByDeviceId(id.trim());
      const data = Array.isArray(response) ? response[0] : response;
      if (data) {
        setDeviceData(data);
      } else {
        setError("No se encontró el ID en el inventario.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

 const ejecutarMantenimiento = async () => {
    if (!deviceData) return null;
    setLoading(true);
    setError(null); // Limpiamos errores previos

    try {
      // 1. Enviamos la petición al Backend
      const result = await applyCctvMaintenance(deviceData.id);

      // 2. ¡CRÍTICO! Refrescamos el historial localmente
      // Esto hará que useMaintenanceFilters detecte el nuevo cambio y lo muestre
      if (typeof obtenerHistorial === "function") {
        await obtenerHistorial();
      }

      return result; 
    } catch (err) {
      const mensaje = err.response?.data?.message || "Error al registrar mantenimiento";
      setError(mensaje); // Opcional: setear el error en el estado del hook
      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return {
    id, setId,
    deviceData, setDeviceData,
    loading,
    error,
    buscarId,
    ejecutarMantenimiento,
    historial,
    obtenerHistorial
  };
};