import { useState, useEffect } from "react";
import { useCctvMaintenance } from "../hooks/useCctvMaintenance";
import "../style/Mantenimiento.css";

export default function CctvSearch() {
  const [openReportsMenu, setOpenReportsMenu] = useState(false);
  
  const { 
    id, setId, 
    deviceData, setDeviceData, 
    loading, error, 
    buscarId, ejecutarMantenimiento 
  } = useCctvMaintenance();

  // Cerrar menú al hacer clic fuera
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
      alert(`✅ Mantenimiento registrado y añadido al informe Word.`);
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

        {/* DROPDOWN DE INFORMES (Dentro del toolbar para mejor flujo) */}
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
            <ul 
              className="dropdown-menu animated" 
              style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                marginTop: '1px', // Pegado al borde
                zIndex: 1000 
              }}
            >
              <li onClick={() => handleDownload("OTROSI7")}>Informe Otro Sí 7 / General</li>
              <li onClick={() => handleDownload("OTROSI20")}>Informe Otro Sí 20</li>
              <li onClick={() => handleDownload("SERVIDORES")}>Informe Servidores</li>
              <li onClick={() => handleDownload("CISA")}>Informe Exterior-CISA</li>
            </ul>
          )}
        </div>
      </div>

      {/* MENSAJES DE ERROR */}
      {error && (
        <div style={{ color: '#d93025', fontSize: '12px', padding: '10px 15px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* RESULTADOS Y ACCIÓN FINAL */}
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
              <tr><td><strong>ID Sistema</strong></td><td>{deviceData.id}</td></tr>
              <tr><td><strong>Ubicación</strong></td><td>{deviceData.ubicacion || "N/A"}</td></tr>
              <tr><td><strong>Cámara</strong></td><td>{deviceData.camara || "N/A"}</td></tr>
              <tr><td><strong>Observación</strong></td><td>{deviceData.observacion || "Sin registro"}</td></tr>
            </tbody>
          </table>
          
          <div className="actions-bar">
            <button onClick={handleConfirmAction} disabled={loading}>
              {loading ? "Procesando..." : "Confirmar Mantenimiento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}