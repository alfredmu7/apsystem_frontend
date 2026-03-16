import { useState } from "react";
import "../style/Mantenimiento.css"; 
import { getFadsByDeviceId, applyFadsMaintenance } from "../api/fadsMaintenance";

export default function FadsSearch() {
  const [id, setId] = useState("");
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscarId = async () => {
    if (!id.trim()) return;
    setLoading(true);
    setDeviceData(null);
    try {
      const data = await getFadsByDeviceId(id.trim());
      // Manejo de respuesta (Array o Objeto directo)
      if (data) {
        setDeviceData(Array.isArray(data) ? data[0] : data);
      } else {
        alert("Dispositivo no encontrado en Neon.");
      }
    } catch (err) {
      console.error("Error al buscar:", err);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Esta función ahora envía el OBJETO completo que el 
   * controlador de Spring Boot necesita para evitar el error 500.
   */
  const handleExecuteMaintenance = async () => {
    if (!deviceData) return;
    
    setLoading(true);
    try {
      const payload = {
        id: deviceData.id,
        item: deviceData.dispositivo || "---", // Mapeamos 'dispositivo' a 'item' para el historial
        tipo_de_equipo: deviceData.tipo || "FADS",
        observation: "Mantenimiento Preventivo FADS", 
        technician: "Técnico ApSystem"
      };

      await applyFadsMaintenance(payload);
      alert("✅ Mantenimiento FADS registrado");
    } catch (err) {
      console.error("Error al registrar mantenimiento:", err);
      alert("Error 500: Revisa que el backend esté recibiendo el Map correctamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="id-container">
      <h2>Buscador FADS - Sistema de Detección de Incendio</h2>
      
      <div className="id-search-box">
        <input 
          type="text" 
          placeholder="Ingrese ID (Ej: P2L01D014)"
          value={id} 
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarId()}
        />
        <button onClick={buscarId} disabled={loading}>
          {loading ? "Consultando..." : "Consultar"}
        </button>
      </div>

      {deviceData && (
        <div className="results-container">
          <h3>Propiedades del Elemento (Datos de Neon)</h3> 
          
          <table className="results-table">
            <thead>
              <tr>
                <th>Parámetro Técnico</th>
                <th>Valor en Sistema</th>
              </tr>
            </thead>
            {/* --- SECCIÓN RESPETADA INTEGRALMENTE --- */}
            <tbody>
              <tr>
                <td style={{ width: "200px" }}><strong>Tipo</strong></td>
                <td>{deviceData.tipo || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>ID</strong></td>
                <td>{deviceData.id || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Dispositivo</strong></td>
                <td>{deviceData.dispositivo || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Ubicación</strong></td>
                <td>{deviceData.ubicacion || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Descripción</strong></td>
                <td>{deviceData.descripcion || "Sin descripción"}</td>
              </tr>
              <tr>
                <td><strong>Zona / Lazo</strong></td>
                <td>{deviceData.zona || "N/A"}</td>
              </tr>
            </tbody>
            {/* --- FIN DE SECCIÓN RESPETADA --- */}
          </table>
          
          <div className="actions-bar" style={{ marginTop: '20px' }}>
            <button className="btn-execute" onClick={handleExecuteMaintenance} disabled={loading}>
              {loading ? "Guardando..." : "Ejecutar Mantenimiento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}