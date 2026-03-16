import { useEffect, useState } from "react";
import { getFadsMaintenanceHistory, updateFadsRow } from "../api/fadsMaintenance"; 
import "../style/DeviceFads.css"; 

export default function DeviceFads() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para feedback visual de guardado
  const [saving, setSaving] = useState(null); 
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTable();
  }, []);

  const loadTable = async () => {
    try {
      setLoading(true);
      const data = await getFadsMaintenanceHistory();
      setMantenimientos(data);
    } catch (err) {
      console.error("Error al cargar historial de FADS:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setMantenimientos(prev => 
      prev.map(item => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  const handleEnterSave = async (e, id, field) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const value = e.target.value.trim();
    setSaving({ id, field });

    try {
      await updateFadsRow({ id, value });
      
      setSaved({ id, field });
      setTimeout(() => setSaved(null), 1000);
    } catch (err) {
      console.error("Error al guardar FADS:", err);
      setError({ id, field });
      setTimeout(() => setError(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="loading">Cargando registros de FADS...</div>;

  return (
    <div className="device-fads-container">
      <h2>Historial de Mantenimiento FADS - Incendio</h2>

      <table className="device-fads-table">
        <thead>
          <tr>
            {/* CAMBIO: DISPOSITIVO en lugar de ITEM */}
            <th>DISPOSITIVO</th>
            <th>ID DISPOSITIVO</th>
            <th>TIPO EQUIPO</th>
            <th>FECHA MANT.</th>
            <th>TÉCNICO</th>
            <th>OBSERVACIONES</th>
          </tr>
        </thead>

        <tbody>
          {mantenimientos.map((reg) => (
            <tr key={reg.id}>
              {/* Celdas de solo lectura */}
              <td>{reg.item || "---"}</td>
              <td>{reg.dispositivoId}</td>
              <td>{reg.tipoDeEquipo || "FADS"}</td>
              <td>{reg.fechaMantenimiento ? new Date(reg.fechaMantenimiento).toLocaleDateString() : "---"}</td>
              <td>{reg.tecnico || "Técnico"}</td>

              {/* Celda con textarea editable */}
              <td>
                <textarea
                  value={reg.observaciones || ""}
                  onChange={e => handleChange(reg.id, 'observaciones', e.target.value)}
                  onKeyDown={e => handleEnterSave(e, reg.id, 'observaciones')}
                  className={
                    saving?.id === reg.id ? "saving-fads" : 
                    saved?.id === reg.id ? "saved-fads" : 
                    error?.id === reg.id ? "error-fads" : "fads-editable-textarea"
                  }
                  placeholder="Escriba y presione Enter..."
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}