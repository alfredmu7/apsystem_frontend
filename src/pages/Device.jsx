import { useEffect, useState } from "react";
import { getAllMaintenance } from "../api/maintenanceApi";
import "../style/Device.css"

export default function Device() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const data = await getAllMaintenance();
      setDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando dispositivos...</p>;

    return (
    <div className="device-page">
      <h2>Devices</h2>

      <table className="device-table">
        <thead>
          <tr>
            <th>Device type</th>
            <th>Location</th>
            <th>Device ID</th>
            <th>technician user</th>
            <th>System</th>
            <th>Trouble</th>
          </tr>
        </thead>

        <tbody>
          {devices.map((d) => (
            <tr key={d.id}>
              <td>{d.deviceType}</td>
              <td>{d.location}</td>
              <td>{d.deviceId}</td>
              <td>{d.technician}</td>
              <td>{d.systemName}</td>
              <td>{d.trouble}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
