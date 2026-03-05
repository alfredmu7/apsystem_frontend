import { useNavigate } from "react-router-dom";
import "../style/Sheets.css";

export const Sheets = () => {
  const navigate = useNavigate();

  const planos = [
    {
      id: 1,
      nombre: "Plano de prueba FADS",
      url: "public/pdfs/plano_de_prueba_fads.pdf",
    },
  ];

  const handleView = (planoUrl) => {
    navigate(`/tracking?pdf=${encodeURIComponent(planoUrl)}`);
  };

  return (
    <div className="sheets-container">
      {/* Sección FADS */}
      <h1 className="category-header">
        <span>📁</span> Fads
      </h1>
      
      <div className="grid-sheets">
        {planos.map((plano) => (
          <div className="sheet-card" key={plano.id}>
            <h3>{plano.nombre}</h3>
            <button
              className="btn-view"
              onClick={() => handleView(plano.url)}
            >
              Open Plan
            </button>
          </div>
        ))}
      </div>

      {/* Sección SACS */}
      <h1 className="category-header">
        <span>📁</span> Sacs
      </h1>
      
      <div className="grid-sheets">
        <div className="sheet-card" style={{ fontStyle: 'italic', color: '#999' }}>
          <span>No documents available in this folder.</span>
        </div>
      </div>
    </div>
  );
};