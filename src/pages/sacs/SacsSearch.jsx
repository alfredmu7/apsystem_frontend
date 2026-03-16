import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../../style/Mantenimiento.css"; 
import { getSacsByDoorId, applySacsMaintenance } from "../../api/sacsMaintenance";

export default function SacsSearch() {
  // --- ESTADOS ---
  const [id, setId] = useState("");              // ID que escribe el usuario
  const [deviceData, setDeviceData] = useState(null); // Datos del inventario (Neon)
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState("");         
  
  const navigate = useNavigate(); 

  // --- LÓGICA DE BÚSQUEDA ---
  const buscarId = async () => {
    if (!id.trim()) return;
    
    setLoading(true); 
    setDeviceData(null);
    setError("");

    try {
      const response = await getSacsByDoorId(id.trim());
      const data = Array.isArray(response) ? response[0] : response;
      
      if (data) {
        setDeviceData(data);
      } else {
        setError("No se encontró ningún dispositivo SACS con ese ID.");
      }
    } catch (err) {
      console.error("Error en búsqueda SACS:", err);
      setError("Error al conectar con el servidor SACS.");
    } finally {
      setLoading(false); 
    }
  };

  // --- LÓGICA DE MANTENIMIENTO ---
  const handleMaintenance = async () => {
    if (!deviceData) return;

    setLoading(true);
    try {
      // Capturamos todos los datos necesarios del objeto deviceData
      const payload = {
        id: deviceData.id_puerta || deviceData.idPuerta || id,
        item: deviceData.item || "",
        tipo_de_equipo: deviceData.tipo_de_equipo || deviceData.tipoDeEquipo || "SACS",
        observation: "Mantenimiento Preventivo SACS",
        technician: "Técnico ApSystem"
      };

      // Enviamos el objeto completo a la API
      await applySacsMaintenance(payload); 
      
      alert(`Mantenimiento registrado con éxito para: ${payload.id}`);
      
      setDeviceData(null);
      setId("");
      

    } catch (e) {
      console.error("Error en mantenimiento SACS:", e);
      alert("No se pudo guardar el registro de mantenimiento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="id-container">
      <h2>Buscador SACS - Gestión de Mantenimiento</h2>
      
      {/* Caja de Búsqueda */}
      <div className="id-search-box">
        <input 
          type="text" 
          placeholder="Ingrese ID (Ej: 0-16-01)" 
          value={id} 
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarId()}
          disabled={loading}
        />
        <button onClick={buscarId} disabled={loading || !id.trim()}>
          {loading ? "Buscando..." : "Consultar"}
        </button>
      </div>

      {/* Mensaje de Error */}
      {error && <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

      {/* Tabla de Resultados */}
      {deviceData && (
        <div className="results-container">
          <h3>Información del Dispositivo (Neon DB)</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Parámetro</th>
                <th>Valor Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Item</strong></td>
                <td>{deviceData.item || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>ID Puerta</strong></td>
                <td>{deviceData.id_puerta || deviceData.idPuerta || id}</td>
              </tr>
              <tr>
                <td><strong>Ubicación</strong></td>
                <td>{deviceData.ubicacion || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Tipo de Equipo</strong></td>
                <td>{deviceData.tipo_de_equipo || deviceData.tipoDeEquipo || "SACS"}</td>
              </tr>
            </tbody>
          </table>
          
          {/* Botón de Acción */}
          <div className="actions-bar" style={{ marginTop: '20px' }}>
            <button 
              className="btn-execute"
              onClick={handleMaintenance}
              disabled={loading}
              
            >
              {loading ? "Guardando..." : "Confirmar Mantenimiento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}