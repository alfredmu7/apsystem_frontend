import axios from "axios";

// Configuración centralizada de Axios
const API_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adjuntar el token (aunque ahora la seguridad sea permitAll, esto no estorba)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * BUSCAR: Sincronizado con el componente CctvSearch.jsx
 */
export const getCctvByDeviceId = async (id) => {
  // Usamos el nombre que busca el componente para evitar el error de exportación
  const response = await api.get(`/cctv/search/${encodeURIComponent(id.trim())}`);
  return response.data;
};

/**
 * APLICAR MANTENIMIENTO: Sincronizado con el botón del componente
 */
export const applyCctvMaintenance = async (idDispositivo) => {
  // Cambié 'axios' por 'api' para usar la configuración base y los interceptores
  const response = await api.post("/cctv/maintenance/execute", {
    id: idDispositivo,
    observation: "Mantenimiento preventivo realizado",
    technician: "Técnico ApSystem"
  });
  return response.data;
};;

/**
 * GET: Obtiene la lista completa de cámaras (Inventario).
 */
export const getAllCctv = async () => {
  const response = await api.get("/cctv");
  return response.data;
};

/**
 * GET: Obtiene la tabla de registros históricos de mantenimiento.
 */
export const getCctvMaintenanceHistory = async () => {
  // Importante: usamos /history para coincidir con el @GetMapping del Back
  const response = await api.get("/cctv/maintenance/history");
  return response.data;
};

/**
 * LÓGICA DE PLANTILLA (RMS VSS): 
 * Mantenemos esta función por si tu sistema genera reportes automáticos en Word/Excel.
 */
export const addTemplateMaintenance = async ({ deviceId, observation, operator }) => {
  const payload = {
    deviceId,
    maintenanceDate: new Date().toISOString().split("T")[0],
    observation: observation ?? "",
    operator: operator ?? "system",
    forceInsert: false
  };

  const response = await api.post("/maintenance_rms_vss", payload);
  return response.data;
};

