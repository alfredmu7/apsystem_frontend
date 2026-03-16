import axios from "axios";

const API_URL = "http://localhost:8080/api/fads"; 

// 1. Buscador de inventario
export const getFadsByDeviceId = async (id) => {
    const response = await axios.get(`${API_URL}/search/${id}`);
    return response.data;
};

// 2. Aplicar Mantenimiento (Envía el objeto completo al Map de Java)
export const applyFadsMaintenance = async (payload) => {
    // payload debe contener: { id, item, tipo_de_equipo, observation, technician }
    const response = await axios.post(`${API_URL}/maintenance/execute`, payload);
    return response.data;
};

// 3. Obtener Historial (Para la tabla estilo C-CURE)
export const getFadsMaintenanceHistory = async () => {
    const response = await axios.get(`${API_URL}/maintenance/history`);
    return response.data;
};

// 4. Actualizar fila (Edición de observaciones con Enter)
export const updateFadsRow = async (payload) => {
    // payload debe contener: { id, value }
    const response = await axios.put(`${API_URL}/maintenance/update`, payload);
    return response.data;
};