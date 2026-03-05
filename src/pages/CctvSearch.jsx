import { useState } from "react";
import * as XLSX from "xlsx"; 
import { getIdInfo } from "../api/idExcel";
import { addCctvMaintenance, addTemplateMaintenance } from "../api/cctvMaintenance";
import "../style/CctvSearchNew.css";

export default function CctvSearch() {
  const [id, setId] = useState("");
  const [foundId, setFoundId] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // --- NUEVO ESTADO PARA EL MENÚ ---
  const [showWordMenu, setShowWordMenu] = useState(false);

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
      const excelData = Array.isArray(response) ? response : response.data;
      setData(excelData);
      setFoundId(id.trim());
    } catch (err) {
      console.error(err);
      setError("ID not found");
    }
  };

  const handleMaintenance = async () => {
    if (!foundId) {
      alert("You must first search an ID");
      return;
    }
    try {
      const maintenancePayload = {
        deviceId: foundId,
        maintenanceDate: new Date().toISOString().split("T")[0],
        observation: "Mantenimiento preventivo realizado - OK",
        operator: "Sistema Automático",
        forceInsert: false
      };
      await Promise.all([
        addCctvMaintenance({ excelId: foundId }),
        addTemplateMaintenance(maintenancePayload)
      ]);
      alert(`Maintenance applied to ID: ${foundId}`);
      handlePreview(); 
    } catch (err) {
      console.error("Error en mantenimiento:", err);
      alert("Error saving maintenance.");
    }
  };

  const downloadRawFile = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/maintenance_rms_vss/download-current", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "vss_manto_current.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error downloading file.");
    }
  };

  const handlePreview = async () => {
    setLoadingPreview(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/maintenance_rms_vss/download-current", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const ab = e.target.result;
        const workbook = XLSX.read(ab, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, range: 15 });
        setPreviewData(jsonData);
        setLoadingPreview(false);
      };
      reader.readAsArrayBuffer(blob);
    } catch (err) {
      console.error(err);
      setLoadingPreview(false);
    }
  };

  // --- FUNCIÓN DESCARGAR WORD (MODIFICADA) ---
  const downloadWordReport = async (type) => {
    const token = localStorage.getItem("token");
    try {
      // Pasamos el 'type' como @RequestParam al backend
      const response = await fetch(`http://localhost:8080/api/reports/word/download?type=${type}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Word file not found");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_${type.toLowerCase()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setShowWordMenu(false); // Cerramos el menú tras descargar
    } catch (err) {
      alert("Error downloading Word report.");
    }
  };

  return (
    <div className="id-container">
      <h2>ID Search - CCTV</h2>

      <div className="id-search-box">
        <input
          type="text"
          placeholder="Enter ID (ej. 0-16-01)"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button onClick={buscarId}>Search</button>
      </div>

      <div className="id-search-box" style={{ borderTop: 'none' }}>
        <button onClick={downloadRawFile}>Download RMS VSS Report</button>

        {/* CONTENEDOR DEL BOTÓN DESPLEGABLE */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button 
            className="word-btn"
            onClick={() => setShowWordMenu(!showWordMenu)} 
            style={{ backgroundColor: '#2b5797'}}
          >
            Download Word Report ▾
          </button>

          {showWordMenu && (
            <div className="word-dropdown">
              <button onClick={() => downloadWordReport("GENERAL")}>General Report</button>
              <button onClick={() => downloadWordReport("T2")}>T2 Report</button>
              <button onClick={() => downloadWordReport("EXTERIOR-CISA")}>CISA Report</button>
              <button onClick={() => downloadWordReport("SERVIDORES")}>Servers Report</button>
              <button onClick={() => downloadWordReport("OTROSI-20")}>Otrosí 20 Report</button>
            </div>
          )}
        </div>

        <button onClick={handlePreview}>
          {loadingPreview ? "Loading..." : "Preview Report"}
        </button>

        {foundId && (
          <button onClick={handleMaintenance} style={{ fontWeight: 'bold' }}>
            Apply Maintenance
          </button>
        )}
      </div>

      {error && <p className="error" style={{ color: 'red', padding: '10px' }}>{error}</p>}

      {/* SECCIÓN VISTA PREVIA */}
{previewData && (
  <div className="preview-container">
    {/* Encabezado fijo */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      background: '#005a84',
      padding: '8px 1px',
     
    }}>
      <h3 style={{ margin: 0, color: 'white', fontSize: '14px' }}>Current Report Content</h3>
      <button 
        className="btn-x"
        onClick={() => setPreviewData(null)} 
        style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer' }}
      >
        X
      </button>
    </div>

    {/* Contenedor con Scroll - Aquí ocurre la magia */}
    <div style={{ 
      maxHeight: '166px', // Altura aproximada para 5 filas
      overflowY: 'auto', 
      border: '1px solid #ddd',
      background: 'white'
    }}>
      <table className="preview-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, background: '#f4f4f4', zIndex: 1 }}>
          <tr>
            <th>Id</th><th>Category</th><th>Location</th>
          </tr>
        </thead>
        <tbody>
          {previewData.filter(row => row[2]).map((row, i) => (
            <tr key={i}>
              <td>{row[1] || i + 1}</td>
              <td><strong>{row[2]}</strong></td>
              <td>{row[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

      {/* INFO TÉCNICA */}
      {data.length > 0 && (
        <div className="results-container">
          <h3>Technical Information of the Device</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td style={{ background: '#f5f5f5', width: '30%' }}>{item.columna}</td>
                  <td>{item.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}