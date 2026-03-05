const API = "http://localhost:8080/api/maintenance";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const saveMaintenance = async (payload) => {
  const res = await fetch(API, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getAllMaintenance = async () => {
  const res = await fetch(API, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error loading maintenance");
  return res.json();
};
