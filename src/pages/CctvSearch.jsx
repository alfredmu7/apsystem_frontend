import { useState, useEffect } from "react";
import { useCctvMaintenance } from "../hooks/useCctvMaintenance";
import { useCctvMaintenanceFilters } from "../hooks/useCctvMaintenanceFilters"; 
import "../style/Mantenimiento.css";

export default function CctvSearch() {
  const [openReportsMenu, setOpenReportsMenu] = useState(false);
  
  const { 
    id, setId, 
    deviceData, setDeviceData, 
    loading, error, 
    buscarId, ejecutarMantenimiento,
    historial 
  } = useCctvMaintenance();

  const { filtros, toggleFiltro, datosFiltrados } = useCctvMaintenanceFilters(historial);

  useEffect(() => {
    const closeMenu = () => setOpenReportsMenu(false);
    if (openReportsMenu) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [openReportsMenu]);

  const handleDownload = (tipo) => {
    const url = `http://localhost:8080/api/cctv/maintenance/report/download/${tipo}`;
    window.open(url, "_blank");
    setOpenReportsMenu(false);
  };

  const handleConfirmAction = async () => {
    try {
      await ejecutarMantenimiento();
      alert(`✅ Mantenimiento registrado y añadido al historial.`);
      setDeviceData(null);
      setId("");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="id-container">
      <h2>Buscador CCTV - Gestión de Mantenimiento</h2>

      {/* TOOLBAR DE BÚSQUEDA */}
      <div className="id-search-box">
        <input
          type="text"
          placeholder="Ingrese ID (Ej: 3-42-4)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarId()}
          disabled={loading}
        />
        <button onClick={buscarId} disabled={loading || !id.trim()}>
          {loading ? "..." : "Consultar"}
        </button>

        <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
          <button
            type="button"
            className="dropdown-title"
            onClick={(e) => {
              e.stopPropagation();
              setOpenReportsMenu(prev => !prev);
            }}
          >
            Descargar Informes ▾
          </button>

          {openReportsMenu && (
            <ul className="dropdown-menu animated" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '1px', zIndex: 1000 }}>
              <li onClick={() => handleDownload("OTROSI7")}>Informe Otro Sí 7 / General</li>
              <li onClick={() => handleDownload("OTROSI20")}>Informe Otro Sí 20</li>
              <li onClick={() => handleDownload("SERVIDORES")}>Informe Servidores</li>
              <li onClick={() => handleDownload("CISA")}>Informe Exterior-CISA</li>
              <li onClick={() => handleDownload("EXCEL_RMS")}>Informe RMS VSS</li>
            </ul>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: '#d93025', fontSize: '12px', padding: '10px 15px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* --- SECCIÓN: FILTROS Y VISTA PREVIA --- */}
      <div className="preview-section">
  <div className="filter-panel">
    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
      Registro total ({datosFiltrados.length}):
    </span>
    <label><input type="checkbox" checked={filtros.OTROSI7} onChange={() => toggleFiltro("OTROSI7")} /> OS7</label>
    <label><input type="checkbox" checked={filtros.OTROSI20} onChange={() => toggleFiltro("OTROSI20")} /> OS20</label>
    <label><input type="checkbox" checked={filtros.SERVIDORES} onChange={() => toggleFiltro("SERVIDORES")} /> Serv</label>
    <label><input type="checkbox" checked={filtros.CISA} onChange={() => toggleFiltro("CISA")} /> Cisa</label>
  </div>

  {/* Contenedor con Scroll: 380px permite ver 8 filas de ~42px + cabecera antes de activar el scroll */}
  <div 
    className="preview-table-container" 
    style={{ 
      maxHeight: '260px', 
      overflowY: 'auto', 
      border: '1px solid #eee', 
      marginTop: '10px',
    }}
  >
    <table className="results-table preview-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ position: 'sticky', top: 0, background: '#f9f9f9', zIndex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
        <tr>
          <th>ID</th><th>Fase</th><th>Ubicación</th><th>Observación</th><th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {datosFiltrados.length > 0 ? (
          datosFiltrados.map((reg, i) => {
            const obsNormalizada = (reg.observacion || "").toUpperCase();
            const esOS20 = obsNormalizada.includes("OTRO SI 20") || obsNormalizada.includes("OS20");

            const faseVisual = esOS20 
              ? "OTRO SÍ 20" 
              : (reg.fase || (deviceData && reg.dispositivoId === deviceData.id ? deviceData.fase : "GENERAL"));

            return (
              <tr key={i} className={esOS20 ? "row-os20" : ""} style={{ height: '4px' }}>
                <td style={{ fontWeight: 'bold' }}>{reg.dispositivoId}</td>
                <td style={{ 
                  fontSize: '0.85rem', 
                  color: esOS20 ? '#2e7d32' : '#666', 
                  fontWeight: esOS20 ? '600' : 'normal' 
                }}>
                  {faseVisual}
                </td>
                <td style={{ fontSize: '0.85rem' }}>{reg.ubicacion || "N/A"}</td>
                <td style={{ 
                  fontSize: '0.85rem', 
                  color: esOS20 ? '#bc7c06' : '#666',
                  fontWeight: esOS20 ? '500' : 'normal'
                }}>
                  {reg.observacion || "---"}
                </td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                  {reg.fechaMantenimiento ? new Date(reg.fechaMantenimiento).toLocaleDateString() : "---"}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              No hay registros coincidentes en el historial
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* RESULTADOS DE BÚSQUEDA ACTUAL */}
      {deviceData && (
        <div className="results-container animated fadeIn" style={{ marginTop: '20px' }}>
          <h3>Información del Dispositivo</h3>
          <table className="results-table">
            <thead>
              <tr><th>Parámetro</th><th>Valor Actual</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>ID Sistema</strong></td><td>{deviceData.id}</td></tr>
              <tr><td><strong>Fase / Proyecto</strong></td><td>{deviceData.fase || "N/A"}</td></tr>
              <tr><td><strong>Ubicación</strong></td><td>{deviceData.ubicacion || "N/A"}</td></tr>
              <tr><td><strong>Cámara</strong></td><td>{deviceData.camara || "N/A"}</td></tr>
              <tr><td><strong>Observación DB</strong></td><td>{deviceData.observacion || "Sin registro"}</td></tr>
            </tbody>
          </table>

          <div className="actions-bar">
            <button className="btn-confirm" onClick={handleConfirmAction} disabled={loading}>
              {loading ? "Procesando..." : "Confirmar Mantenimiento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}