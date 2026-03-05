import { useState } from "react";
import { saveMaintenance } from "../api/maintenanceApi";

export default function useMaintenancePopup() {
  const [popup, setPopup] = useState({
    visible: false,
    x: 0,
    y: 0,
    deviceId: null,
  });

  const technicianEmail = localStorage.getItem("userEmail") || "Technician";

  const openPopup = (x, y, deviceId) => {
    setPopup({
      visible: true,
      x,
      y,
      deviceId: deviceId.toUpperCase(),
    });
  };

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, visible: false }));
  };

  /* --- ACCIÓN: MAINTENANCE --- */
  const handleMaintenance = async () => {
    try {
      const payload = {
        deviceType: "FADS",
        location: "Pendiente",
        deviceId: popup.deviceId,
        technician: technicianEmail,
        systemName: "Pendiente",
        trouble: "N/A", // Valor por defecto para OK
      };

      await saveMaintenance(payload);
      alert(`Maintenance recorded for: ${popup.deviceId}`);
      closePopup();
    } catch (error) {
      alert("Error saving maintenance: " + error.message);
    }
  };

  /* --- ACCIÓN: TROUBLE --- */
  const handleTrouble = async () => {
    try {
      const payload = {
        deviceType: "FADS",
        location: "Pendiente",
        deviceId: popup.deviceId,
        technician: technicianEmail,
        systemName: "Pendiente",
        trouble: "Requires technical review", // Valor descriptivo
      };

      await saveMaintenance(payload);
      alert(`Trouble report created for: ${popup.deviceId}`);
      closePopup();
    } catch (error) {
      alert("Error reporting trouble: " + error.message);
    }
  };

  /* --- COMPONENTE VISUAL --- */
  const PopupComponent = () =>
    popup.visible ? (
      <div
        className="maintenance-popup-wrapper"
        style={{
          left: `${popup.x}px`,
          top: `${popup.y}px`,
        }}
      >
        {/* Cabecera Estilo C-CURE */}
        <div className="maintenance-popup-header">
          <span>Device Control</span>
          <button className="close-popup-btn" onClick={closePopup}>×</button>
        </div>

        {/* Cuerpo del Popup */}
        <div className="maintenance-popup-body">
          <p className="popup-id-label"><strong>ID:</strong> {popup.deviceId}</p>
          
          <div className="popup-actions-grid">
            <button
              className="popup-btn btn-maintenance"
              onClick={handleMaintenance}
            >
              Maintenance
            </button>

            <button
              className="popup-btn btn-trouble"
              onClick={handleTrouble}
            >
              Trouble
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return {
    openPopup,
    closePopup,
    PopupComponent,
  };
}