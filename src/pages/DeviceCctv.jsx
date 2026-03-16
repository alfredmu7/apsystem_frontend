import { useEffect, useState } from "react";
import { getCctvMaintenanceHistory } from "../api/cctvMaintenance"; // Asegúrate de apuntar al nuevo endpoint /history
import "../style/DeviceCctv.css";

export default function DeviceCctv() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Definimos las columnas que queremos mostrar basadas en tu tabla de Neon
  const columns = [
    { label: "Fecha", key: "fechaMantenimiento" },
    { label: "ID Dispositivo", key: "dispositivoId" },
    { label: "Técnico", key: "tecnico" },
    { label: "Observaciones", key: "observaciones" },
    { label: "Estado", key: "estado" }
  ];

  useEffect(() => {
    loadTable();
  }, []);

  const loadTable = async () => {
    try {
      setLoading(true);
      // Este endpoint debe llamar a /api/cctv/maintenance/history
      const data = await getCctvMaintenanceHistory(); 
      setRegistros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Cargando registros de Neon...</div>;

  return (
    <div className="device-cctv-container">
      <h2>Historial de Mantenimiento CCTV</h2>

      <table className="device-cctv-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {registros.length > 0 ? (
            registros.map((reg) => (
              <tr key={reg.id}>
                <td>{new Date(reg.fechaMantenimiento).toLocaleString()}</td>
                <td><strong>{reg.dispositivoId}</strong></td>
                <td>{reg.tecnico}</td>
                <td>
                  <textarea 
                    className="editable-textarea"
                    value={reg.observaciones || ""} 
                    readOnly // Por ahora, ya que es historial
                  />
                </td>
                <td>
                  <span className="status-badge">{reg.estado}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                No hay mantenimientos registrados aún.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}