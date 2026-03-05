import axios from "axios";

const API_URL = "http://localhost:8080/api/dashboard";

export const getMaintenanceByMonth = async () => {
  const response = await axios.get(`${API_URL}/maintenance-by-month`);
  return response.data;
};

export const getTotalMaintenances = async () => {
  const response = await axios.get(`${API_URL}/total`);
  return response.data;
};
