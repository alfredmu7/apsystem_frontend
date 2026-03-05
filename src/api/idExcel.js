const API_URL = "http://localhost:8080/api/ids";

export async function getIdInfo(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("ID no encontrado o acceso denegado");
  }

  return response.json();
}


/**
 * CCTV exclusivo
 */
export async function getCctvIdInfo(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/cctv/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("ID CCTV no encontrado");
  }

  return response.json();
}
