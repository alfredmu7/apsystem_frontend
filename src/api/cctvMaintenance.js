import axios from "axios";

const API = "http://localhost:8080/api/cctv";

export async function addCctvMaintenance(payload) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/maintenance`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Error guardando mantenimiento");
  }
}

//-------------------------------------------------------------
//Agregamos la API para la plantilla

const TEMPLATE_API = "http://localhost:8080/api/maintenance_rms_vss";

export async function addTemplateMaintenance({ deviceId, observation, operator }) {
  const token = localStorage.getItem("token");

  const payload = {
  deviceId,
  maintenanceDate: new Date().toISOString().split("T")[0],
  observation: observation ?? "",
  operator: operator ?? "system",
  forceInsert: false
};


  const res = await fetch(TEMPLATE_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Error guardando plantilla");
  }
}

//-----------------------------------------------------------------



export async function getCctvMaintenanceTable() {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${API}/maintenance`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  return res.json();
}


const api = axios.create({
  baseURL: "http://localhost:8080/api",
});


