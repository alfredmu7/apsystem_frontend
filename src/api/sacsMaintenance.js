import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/sacs";

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * GET: Search for a SACS ID in the database
 */
export const getIdInfo = async (id) => {
    const encodedId = encodeURIComponent(id.trim());
    return await api.get(`/search/${encodedId}`);
};

/**
 * POST: Ejecuta el mantenimiento y genera el reporte Excel
 * Se actualizó la ruta a '/apply/' para coincidir con el controlador
 */
export const addSacsMaintenance = async (id) => {
    const encodedId = encodeURIComponent(id.trim());
    // Esta llamada ahora dispara tanto el registro en DB como el llenado del Excel
    return await api.post(`/maintenance/apply/${encodedId}`);
};

/**
 * GET: Obtiene la tabla completa de registros que han pasado por mantenimiento
 */
export const getSacsMaintenanceTable = async () => {
    const response = await api.get("/maintenance/table");
    return response.data;
};

/**
 * PUT: Actualiza una celda específica en la base de datos
 */
export const updateSacsRow = async (payload) => {
    const response = await api.put("/maintenance/update", payload);
    return response.data;
};

/**
 * GET: Descarga el archivo Excel generado
 * Agregamos esto para que el usuario pueda bajar el reporte final
 */
export const downloadOtrosi7Excel = async () => {
    // La ruta debe coincidir con la del @GetMapping del Controller
    const response = await api.get("/maintenance/export/otrosi7", {
        responseType: 'blob', 
    });
    
    // Crear el objeto URL para el archivo binario
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'rms_sacs_otrosi7_doors_report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // Limpiar memoria
};