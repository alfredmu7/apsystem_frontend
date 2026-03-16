import { useState } from "react";
import { getCctvByDeviceId, applyCctvMaintenance } from "../api/cctvMaintenance";

export const useCctvMaintenance = () => {
  const [id, setId] = useState("");
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    try {
      const result = await applyCctvMaintenance(deviceData.id);
      return result; // Devolvemos el resultado para que el componente decida qué hacer
    } catch (err) {
      const mensaje = err.response?.data?.message || "Error al registrar mantenimiento";
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
    ejecutarMantenimiento
  };
};