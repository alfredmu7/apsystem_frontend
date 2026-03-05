import { useEffect, useState, useRef } from "react";
import { getMaintenanceByMonth } from "../api/dashboardApi";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie
} from "recharts";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "../style/DashboardNew.css";

export default function Dashboard() {

  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const stompClientRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
    connectWebSocket();
    return () => disconnectWebSocket();
  }, []);

  /* =====================================================
     API REST
  ====================================================== */
  const loadDashboardData = async () => {
    try {
      const data = await getMaintenanceByMonth();
      setMonthlyData(data);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     WEBSOCKET (USUARIOS ONLINE)
  ====================================================== */
  const connectWebSocket = () => {
  // Evita múltiples conexiones
  if (stompClientRef.current) return;

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("JWT not found, WebSocket not connected");
    return;
  }

  const socket = new SockJS("http://localhost:8080/ws");

  const stompClient = new Client({
    webSocketFactory: () => socket,

    // ✅ SOLO enviar Authorization si existe
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },

    // ❌ DEBUG QUITADO (limpia la consola)
    // debug: (str) => console.log("🛰 STOMP:", str),

    onConnect: () => {
      console.log("✅ WebSocket connected");

      // 🔔 Suscripción a usuarios online
      stompClient.subscribe("/topic/online-users", (msg) => {
        const users = JSON.parse(msg.body);
        setOnlineUsers(users);
      });

      // 📡 Solicitar estado inicial
      stompClient.publish({
        destination: "/app/online-users"
      });
    },

    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"]);
    },

    onWebSocketError: () => {
      console.error("❌ WebSocket error");
    },

    onDisconnect: () => {
      console.log("🔌 WebSocket disconnected");
    }
  });

  stompClientRef.current = stompClient;
  stompClient.activate();
};


  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
  };

  /* =====================================================
     DERIVED DATA (KPIs)
  ====================================================== */
  const totalMaintenance = monthlyData.reduce((acc, item) => acc + item.total, 0);
  const statusData = [
    { name: "Completed", value: Math.floor(totalMaintenance * 0.75) },
    { name: "Pending", value: Math.floor(totalMaintenance * 0.25) }
  ];

  if (loading) return <p>Loading Dashboard...</p>;

  return (
  <div className="dashboard-layout">
    {/* SIDEBAR IZQUIERDO */}
    <aside className="sidebar">
      
      {/* Sección Search (Estilo C-CURE) */}
      <div className="sidebar-section">
        <div className="sidebar-header">
          <span>Search 🔎</span>
          <span>«</span>
        </div>
        <div className="sidebar-content">
          <input 
            type="text" 
            placeholder="Search..." 
            style={{ width: '100%', padding: '3px', fontSize: '12px', border: '1px solid #ccc' }} 
          />
        </div>
      </div>

      {/* Sección Configuration */}
      <div className="sidebar-section">
        <div className="sidebar-header">
          <span>Setting ⚙️</span>
          <span>«</span>
        </div>
        
        <div className="sidebar-content">
           <div className="sidebar-item active">📊 Dashboard</div>
           <div className="sidebar-item">🛠 Maintenance</div>
           <div className="sidebar-item">📈 Analytics</div>
           <div className="sidebar-item">👥 Users Online: {onlineUsers.length}</div>
        </div>
      </div>

      {/* Otras secciones (Botones simples abajo como en la imagen) */}
      <div className="sidebar-item" style={{marginTop: 'auto', borderTop: '1px solid #ccc'}}>
        ⚙️ Settings
      </div>
      <div className="sidebar-item" style={{color: 'red'}}>
        🚪 Logout
      </div>
    </aside>

    {/* CONTENIDO PRINCIPAL (Tus gráficas) */}
    <main className="main-content">
      <div className="dashboard-main">
        <h2 style={{marginTop: 0}}>Dashboard Overview</h2>

        {/* KPI CARDS */}
        <div className="cards-grid">
          <div className="dashboard-card"><h4>Total Maintenance</h4><p>{totalMaintenance}</p></div>
          <div className="dashboard-card"><h4>Users Online</h4><p>{onlineUsers.length}</p></div>
        </div>

        {/* CHARTS */}
        <div className="charts-grid">
          <div className="dashboard-card">
            <h3>Monthly Maintenance</h3>
            {/* Aquí va tu ResponsiveContainer con el BarChart */}
          </div>
        </div>
        
        {/* ... Resto de tus componentes ... */}
      </div>
    </main>
  </div>
);
}