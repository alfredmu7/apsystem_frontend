import { useState } from "react";

export default function FadsSearch() {

  // ID ingresado en el input
  const [id, setId] = useState("");

  // ID válido encontrado
  const [foundId, setFoundId] = useState("");

  // Datos traídos del Excel
  const [data, setData] = useState([]);

  // Error
  const [error, setError] = useState("");

  // 🔍 Buscar ID
  const buscarId = async () => {
    setError("");
    setData([]);
    setFoundId("");

    if (!id.trim()) {
      setError("You must enter an ID first");
      return;
    }

    try {
      const response = await getIdInfo(id.trim());

      const excelData = Array.isArray(response)
        ? response
        : response.data;

      setData(excelData);
      setFoundId(id.trim());

    } catch (err) {
      console.error(err);
      setError("ID found");
    }
  };

  // 🛠 BOTÓN MAINTENANCE (YA DEFINIDO)
  const handleMaintenance = async () => {
  if (!foundId) {
    alert("You must first add an ID");
    return;
  }

  try {
    await addCctvMaintenance(foundId);
    alert("ID added to CCTV maintenance");
  } catch (e) {
    console.error(e);
  
  
  if (e.response && e.response.status === 409) {
    alert("This ID has already been added to CCTV maintenance");
    return;
  }
  alert("Error saving to CCTV maintenance");
  }
};



  return (
    <div className="id-container">
      <h2>ID Search - FADS</h2>

      <div className="id-search-box">
        <input
          type="text"
          placeholder="Enter ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button onClick={buscarId}>Search</button>
      </div>

      {/* ID encontrado */}
      {foundId && (
        <p className="searched-id">
          Device ID: <strong>{foundId}</strong>
        </p>
      )}

      {/* BOTÓN MAINTENANCE */}
      {foundId && (
        <button
          className="maintenance-btn"
          onClick={handleMaintenance}
        >
          Maintenance
        </button>
      )}

      </div>
  );
}
