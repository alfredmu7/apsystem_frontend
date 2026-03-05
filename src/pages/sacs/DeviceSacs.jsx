import { useEffect, useState } from "react";
import { getSacsMaintenanceTable, updateSacsRow } from "../../api/sacsMaintenance"; // Ajusta la ruta según tu proyecto
import "../../style/DeviceSacs.css"; // Usamos el mismo CSS para mantener la estética

export default function DeviceSacs() {
  // Definimos qué columnas NO se pueden editar manualmente (protección de datos técnicos)
  const nonEditable = [
    "ITEM", 
    "CODIGO", 
    "ID PUERTA", 
    "FECHA MANTENIMIENTO I", 
    "FECHA MANTENIMIENTO II", 
    "CAMARA", 
    "TIPO DE EQUIPO",
    "RESPONSIBLE A CARGO"
  ];

  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState({});
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTable();
  }, []);

  const loadTable = async () => {
    try {
      const data = await getSacsMaintenanceTable();
      setHeaders(data.headers);

      // Normalización de datos: Aseguramos que el ID sea la llave del objeto
      if (Array.isArray(data.rows)) {
        const normalized = {};
        data.rows.forEach(row => {
          // SACS usa "ID PUERTA" o el identificador que definimos como excelId
          const id = row["ID PUERTA"] || Object.keys(row)[0]; 
          normalized[id] = row;
        });
        setRows(normalized);
      } else {
        setRows(data.rows);
      }
    } catch (err) {
      console.error("Error loading SACS table:", err);
    }
  };

  const handleChange = (id, col, value) => {
    setRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [col]: value
      }
    }));
  };

  const handleEnterSave = async (e, id, field) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const value = e.target.value.trim();
    setSaving({ id, field });

    try {
      await updateSacsRow({
        excelId: id,
        values: { [field]: value }
      });

      setRows(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: value }
      }));

      setSaved({ id, field });
      setTimeout(() => setSaved(null), 800);
    } catch (err) {
      console.error("Error saving SACS data:", err);
      setError({ id, field });
      setTimeout(() => setError(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="id-container">
      <h2>SACS Maintenance Registry</h2>

      <div className="results-container" style={{ margin: '10px', overflowX: 'auto' }}>
        <table className="results-table">
          <thead>
            <tr>
              {/* Encabezado fijo para el ID del registro */}
              <th style={{ backgroundColor: '#005a84', color: 'white' }}>DEVICE ID</th>
              {headers.map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.entries(rows).map(([id, cols]) => (
              <tr key={id}>
                <td style={{ fontWeight: 'bold', background: '#f0f0f0' }}>{id}</td>

                {headers.map(h => (
                  <td key={h} className="editable-td">
                    {nonEditable.includes(h) ? (
                      <span className="readonly-cell">{cols[h] || "---"}</span>
                    ) : (
                      <textarea
                        value={rows[id]?.[h] || ""}
                        onChange={e => handleChange(id, h, e.target.value)}
                        onKeyDown={e => handleEnterSave(e, id, h)}
                        placeholder="Type and press Enter..."
                        className={
                          saving?.id === id && saving?.field === h
                            ? "saving-cell"
                            : saved?.id === id && saved?.field === h
                            ? "saved-cell"
                            : error?.id === id && error?.field === h
                            ? "error-cell"
                            : "editable-textarea"
                        }
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '10px', color: '#666', marginLeft: '15px' }}>
        * Only "RESPONSABLE A CARGO", "GRUPO" and "OBSERVACIONES" are editable. Press <strong>Enter</strong> to save changes.
      </p>
    </div>
  );
}