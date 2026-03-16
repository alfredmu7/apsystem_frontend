import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Header } from "./components/Header.jsx";
import PlansViewer from "./components/PlansViewer";
import { useEffect, useState } from "react";
import { SplashScreen } from "./components/SplashScreen.jsx";
import { Sheets } from "./pages/Sheets";
import Login from "./pages/Login.jsx";
import DeviceCctv from "./pages/DeviceCctv";
import Dashboard from "./pages/Dashboard.jsx";
import CctvSearch from "./pages/CctvSearch.jsx";

import "./style/SplashScreen.css";
import FadsSearch from "./pages/FadsSearch.jsx";
import SacsSearch from "./pages/sacs/SacsSearch.jsx";
import DeviceSacs from "../src/pages/sacs/DeviceSacs.jsx";
import DeviceFads from "../src/pages/DeviceFads.jsx";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// Wrapper para poder usar useLocation dentro de Router
function AppWrapper() {
  const location = useLocation();          // Saber ruta actual
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFade(true), 1800);
    const timer2 = setTimeout(() => setLoading(false), 2500);
    return () => (clearTimeout(timer1), clearTimeout(timer2));
  }, []);

  if (loading) return <SplashScreen fade={fade} />;

  // NO mostrar Header cuando estás en /login
  const hideHeader = location.pathname === "/login";

  return (
    <>
      {!hideHeader && token && <Header />}

      <main>
        <Routes>
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/id-search/fads" element={<PrivateRoute><FadsSearch /></PrivateRoute>}/>
          <Route path="/id-search/sacs" element={<SacsSearch/>}/>
          <Route path="/id-search/cctv" element={<CctvSearch />} />
          <Route path="/sheets" element={<Sheets />} />
          <Route path="/tracking" element={<PrivateRoute><PlansViewer /></PrivateRoute>} />
          <Route path="/devices/fads" element={<PrivateRoute><DeviceFads /></PrivateRoute>} />
          <Route path="/devices/sacs" element={<PrivateRoute><DeviceSacs /></PrivateRoute>} />
          <Route path="/devices/cctv" element={<PrivateRoute><DeviceCctv /></PrivateRoute>}/>
          <Route path="/profile" element={<PrivateRoute><h1>Profile</h1></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
