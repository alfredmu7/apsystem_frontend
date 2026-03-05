import axios from "axios";

const API_URL = "http://localhost:8080/api/cctv";

export const editObservations = async (excelId, observations) => {
  return axios.post(`${API_URL}/observations`, {
    excelId: excelId,
    observations: observations
  });
};
