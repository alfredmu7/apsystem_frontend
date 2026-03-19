import { useEffect, useState } from "react";
import { getCctvMaintenanceHistory } from "../api/cctvMaintenance"; 
import "../style/DeviceCctv.css";

export default function DeviceCctv() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Columnas simplificadas (sin observaciones ni acciones)
  const columns = [
    { label: "Fecha", key: "fechaMantenimiento" },
    { label: "ID Dispositivo", key: "dispositivoId" },
    { label: "Técnico", key: "tecnico" },
    { label: "Estado", key: "estado" }
  ];

  useEffect(() => {
    loadTable();
  }, []);

  const loadTable = async () => {
    try {
      setLoading(true);
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
                {/* Formateo de fecha para que sea más legible */}
                <td>{new Date(reg.fechaMantenimiento).toLocaleDateString()}</td>
                <td><strong>{reg.dispositivoId}</strong></td>
                <td>{reg.tecnico}</td>
                <td>
                  <span className={`status-badge ${reg.estado?.toLowerCase()}`}>
                    {reg.estado}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                No hay mantenimientos registrados aún en la base de datos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}