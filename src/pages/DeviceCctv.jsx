import { useEffect, useState } from "react";
import { getCctvMaintenanceTable } from "../api/cctvMaintenance";
import { updateRow } from "../api/updateRow";
import "../style/DeviceCctv.css";

export default function DeviceCctv() {
  const nonEditable = ["FECHA MT 1", "FECHA MT 2", "CAMARA", "USUARIO"];
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState({});
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);



  // Cargar tabla desde el backend al montar el componente
  useEffect(() => {
    loadTable();
  }, []);

 const loadTable = async () => {
  const data = await getCctvMaintenanceTable();

  setHeaders(data.headers);

  if (Array.isArray(data.rows)) {
    // si viene en array → normalizamos
    const normalized = {};
    data.rows.forEach(row => {
      const id = row["ID"];
      normalized[id] = row;
    });
    setRows(normalized);
  } else {
    // si ya viene como objeto → lo usamos tal cual
    setRows(data.rows);
  }
};



  // Actualizar estado local cuando escribes en textarea
  const handleChange = (id, col, value) => {
    setRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [col]: value
      }
    }));
  };

  // Guardar en DB al presionar Enter
  const handleEnterSave = async (e, id, field) => {
  if (e.key !== "Enter") return;

  e.preventDefault();

  const value = e.target.value.trim(); // vacío permitido

  // opcional: marcar que está guardando
  setSaving({ id, field });


  try {
    await updateRow({
      excelId: id,
      values: { [field]: value === "" ? "" : value }
    });

    // actualizar UI local
    setRows(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));

    // señal visual de guardado
    setSaved({ id, field });

    // quitar estado de "saving" luego de un tiempo
    setTimeout(() => {
      setSaved(null);
    }, 300);

  } catch (err) {
    console.error("Error guardando:", err);
    setError({ id, field });
  } finally {
    setSaving(null);
  }
};

  return (
    <div className="device-cctv-container">
      <h2>CCTV Maintenance</h2>

      <table className="device-cctv-table">
        <thead>
          <tr>
            <th>ID</th>
            {headers.map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Object.entries(rows).map(([id, cols]) => (
            <tr key={id}>
              <td>{id}</td>

              {headers.map(h => (
                <td key={h}>
                  {nonEditable.includes(h) ? (
                    cols[h] || "-"
                  ) : (
                    <textarea
                      value={rows[id]?.[h] || ""}
                      onChange={e => handleChange(id, h, e.target.value)}
                      onKeyDown={e => handleEnterSave(e, id, h)}
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
  );
}
