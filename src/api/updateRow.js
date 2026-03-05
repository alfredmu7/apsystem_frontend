import axios from "axios";

export const updateRow = (payload) => {
  return axios.post("http://localhost:8080/api/cctv/maintenance/update-row", payload);
};
