import { useState } from "react";
// ✅ IMPORTANTE: Aquí traemos las funciones reales que conectan con tu Java/Neon
import { getFadsByDeviceId, applyFadsMaintenance } from "../../api/fadsMaintenance";

export default function FadsSearch() {
  const [id, setId] = useState("");
  const [foundId, setFoundId] = useState("");
  const [deviceData, setDeviceData] = useState(null);
  const [error, setError] = useState("");

  // 🔍 BUSCAR ID
  const buscarId = async () => {
    setError("");
    setDeviceData(null);
    setFoundId("");

    if (!id.trim()) {
      setError("Debes ingresar un ID primero");
      return;
    }

    try {
      // ✅ CAMBIO: Usamos getFadsByDeviceId (la que importamos arriba)
      const response = await getFadsByDeviceId(id.trim());

      // Validamos si Neon nos devolvió datos
      if (response) {
        setDeviceData(response);
        setFoundId(id.trim());
      } else {
        setError("ID no encontrado en Neon");
      }
    } catch (err) {
      console.error(err);
      setError("Error al buscar el ID");
    }
  };

  // 🛠 APLICAR MANTENIMIENTO
  const handleMaintenance = async () => {
    if (!foundId) return;

    try {
      // ✅ CAMBIO: Usamos la función de FADS, no la de CCTV
      await applyFadsMaintenance(foundId);
      alert(`Mantenimiento registrado para ${foundId} en el sistema FADS.`);
      
      // Limpiar después de éxito
      setDeviceData(null);
      setFoundId("");
      setId("");
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 409) {
        alert("Este dispositivo ya tiene mantenimiento registrado hoy.");
      } else {
        alert("Error al guardar el mantenimiento");
      }
    }
  };

  return (
    <div className="id-container">
      <h2>Buscador FADS - Incendio</h2>

      <div className="id-search-box">
        <input
          type="text"
          placeholder="Ingrese ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && buscarId()}
        />
        <button onClick={buscarId}>Buscar</button>
      </div>

      {/* Si encontramos el dispositivo, mostramos la info y el botón */}
      {foundId && deviceData && (
        <div className="results">
          <p>Dispositivo encontrado: <strong>{foundId}</strong></p>
          <p>Ubicación: {deviceData.ubicacion}</p>
          
          <button
            className="maintenance-btn"
            onClick={handleMaintenance}
          >
            Aplicar Mantenimiento
          </button>
        </div>
      )}

      {error && <p className="error" style={{color: 'red'}}>{error}</p>}
    </div>
  );
}