import { useState } from "react";
import { getIdInfo, addSacsMaintenance, downloadOtrosi7Excel } from "../../api/sacsMaintenance";

export default function SacsSearch() {
  const [id, setId] = useState("");
  const [foundId, setFoundId] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [showWordMenu, setShowWordMenu] = useState(false);
  const [showExcelMenu, setShowExcelMenu] = useState(false);

  const buscarId = async () => {
    setError("");
    setData([]);
    setFoundId("");
    if (!id.trim()) return;

    try {
      const response = await getIdInfo(id.trim()); 
      if (response.data && response.data.length > 0) {
        setData(response.data);
        setFoundId(id.trim());
      } else {
        setError("ID not found in SACS database");
      }
    } catch (err) {
      setError("Error: " + (err.response?.status === 404 ? "Not Found" : "Server Error"));
    }
  };

  const handleMaintenance = async () => {
    try {
      await addSacsMaintenance(foundId);
      alert("Maintenance recorded successfully");
      setFoundId("");
      setId("");
      setData([]);
    } catch (e) {
      alert(e.response?.status === 409 ? "Maintenance already exists" : "Error saving maintenance");
    }
  };

  // ESTA FUNCIÓN DEBE ESTAR AQUÍ AFUERA (No dentro de handleMaintenance)
  const handleDownloadExcel = async (type) => {
    setShowExcelMenu(false); 
    
    if (type === 'otrosi7') {
      try {
        await downloadOtrosi7Excel();
      } catch (err) {
        if (err.response?.status === 404) {
          alert("Aviso: No hay registros previos. Debes aplicar al menos un mantenimiento para generar el reporte.");
        } else {
          alert("Error al intentar descargar el reporte.");
        }
      }
    } else {
      alert("Este reporte aún no está implementado.");
    }
  };

  return (
    <div className="id-container">
      <h2>ID Search - SACS (Access Control)</h2>

      <div className="id-search-box">
        <input
          type="text"
          placeholder="Enter ID (ej. 2077-03, ZN GP10,D16)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && buscarId()}
        />
        <button onClick={buscarId}>Search</button>
      </div>

      <div className="id-search-box" style={{ borderTop: 'none' }}>
        
        {/* DROPDOWN EXCEL - Corregido */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button onClick={() => { setShowExcelMenu(!showExcelMenu); setShowWordMenu(false); }}>
            Download Excel Report ▾
          </button>

          {showExcelMenu && (
            <div className="word-dropdown">
              <button onClick={() => handleDownloadExcel('otrosi7')}>
                rms sacs otrosi 7 doors Report</button>
              <button onClick={() => setShowExcelMenu(false)}>rms sacs otrosi 20 doors Report</button>
              <button onClick={() => setShowExcelMenu(false)}>rms sacs buttons panic Report</button>
              <button onClick={() => setShowExcelMenu(false)}>rms sacs ck report</button>
            </div>
          )}
        </div>

        {/* DROPDOWN WORD */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button onClick={() => { setShowWordMenu(!showWordMenu); setShowExcelMenu(false); }}>
            Download Word Report ▾
          </button>

          {showWordMenu && (
            <div className="word-dropdown">
              <button onClick={() => setShowWordMenu(false)}>Otrosi 7 Doors Report</button>
              <button onClick={() => setShowWordMenu(false)}>Otrosi 20 Report</button>
              <button onClick={() => setShowWordMenu(false)}>Panic Buttons Report</button>
              <button onClick={() => setShowWordMenu(false)}>ck ccu rcu ipc Report</button>
            </div>
          )}
        </div>

        {foundId && (
          <button 
            className="maintenance-btn-active" 
            onClick={handleMaintenance}
          >
            Apply Maintenance
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {data.length > 0 && (
        <div className="results-container">
          <h3>Technical Information of the Device: {foundId}</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Property</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                "ITEM", "CODIGO", "ID PUERTA", "FECHA MANTENIMIENTO I", 
                "FECHA MANTENIMIENTO II", "GRUPO", "UBICACIÓN", "CAMARA", 
                "RESPONSABLE A CARGO", "TIPO DE EQUIPO", "OBSERVACIONES"
              ].map((colName) => {
                const item = data.find(d => d.columna.trim() === colName);
                return (
                  <tr key={colName}>
                    <td><strong>{colName}</strong></td>
                    <td>{item ? (item.valor || "---") : "---"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}