import axios from "axios";

const API_URL = "http://localhost:8080/api/sacs";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// --- BUSCADOR ---
export const getSacsByDoorId = async (idPuerta) => {
    const response = await api.get(`/search/${encodeURIComponent(idPuerta.trim())}`);
    return response.data;
};

// --- APLICAR MANTENIMIENTO ---
// Cambiado para enviar JSON en lugar de variable en la URL, igual que CCTV
export const applySacsMaintenance = async (payload) => {
    // Payload contiene { id, item, tipo }
    const response = await api.post(`/maintenance/execute`, {
        id: payload.id,
        item: payload.item,
        tipo_de_equipo: payload.tipo, // Asegúrate de que este nombre sea el que espera Java
        observation: "Mantenimiento Preventivo SACS",
        technician: "Técnico ApSystem"
    });
    return response.data;
};

// --- TABLA DE HISTORIAL (DeviceSacs.jsx) ---
// Renombramos para que coincida con la importación del componente
export const getSacsMaintenanceHistory = async () => {
    const response = await api.get("/maintenance/history");
    return response.data;
};

// --- ACTUALIZACIÓN Y REPORTES ---
export const updateSacsRow = async (payload) => {
    const response = await api.put("/maintenance/update", payload);
    return response.data;
};

export const downloadSacsReport = async () => {
    const response = await api.get("/maintenance/export/report", { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Reporte_SACS_Neon.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};