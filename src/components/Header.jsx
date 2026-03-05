import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../style/HeaderNew.css";

export const Header = () => {

  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [openIdMenu, setOpenIdMenu] = useState(false);
  const [openDeviceMenu, setOpenDeviceMenu] = useState(false);

  // Escucha cambios de autenticación
  useEffect(() => {
    const listener = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  // Cierra menú al hacer click fuera
  useEffect(() => {
    const closeMenus = () => {
      setOpenIdMenu(false);
      setOpenDeviceMenu(false);
    };

    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  return (
    <header className="header">
      <img src="../APS-logo.png" alt="logo de la app" />

      <nav>
        <ul className="menu">

          
          <li><Link to="/dashboard">Dashboard</Link></li>

          {/* ===== ID SEARCH DROPDOWN ===== */}
          <li className="dropdown">
            <span
              className="dropdown-title"
              onClick={(e) => {
                e.stopPropagation(); // evita cierre inmediato
                setOpenIdMenu(prev => !prev);
              }}
            >
              ID Search
            </span>

            {openIdMenu && (
              <ul className="dropdown-menu animated">
                <li
                  onClick={() => {
                    navigate("/id-search/fads");
                    setOpenIdMenu(false);
                  }}
                >
                  Fads
                </li>

                <li
                  onClick={() => {
                    navigate("/id-search/sacs");
                    setOpenIdMenu(false);
                  }}
                >
                  Sacs
                </li>

                <li
                  onClick={() => {
                    navigate("/id-search/cctv");
                    setOpenIdMenu(false);
                  }}
                >
                  Cctv
                </li>
              </ul>
            )}
          </li>

          <li><Link to="/sheets">Sheets</Link></li>
          <li><Link to="/tracking">Tracking</Link></li>
          
           {/* ===== DEVICES DROPDOWN ===== */}
          <li className="dropdown">
            <span
              className="dropdown-title"
              onClick={(e) => {
                e.stopPropagation();             // evita cierre inmediato
                setOpenDeviceMenu(prev => !prev); // toggle Devices menu
                setOpenIdMenu(false);             // cierra ID Search
              }}
            >
              Devices
            </span>

            {openDeviceMenu && (
              <ul className="dropdown-menu animated">
                <li onClick={() => { navigate("/devices/fads"); setOpenDeviceMenu(false); }}>
                  Fads
                </li>
                <li onClick={() => { navigate("/devices/sacs"); setOpenDeviceMenu(false); }}>
                  Sacs
                </li>
                <li onClick={() => { navigate("/devices/cctv"); setOpenDeviceMenu(false); }}>
                  Cctv
                </li>
              </ul>
            )}
          </li>
          

          <li><Link to="/profile">Profile</Link></li>

          {isAuthenticated ? (
            <li>
              <button onClick={handleLogout} className="btn-logout">
                Log out
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login" className="btn-login">
                Login
              </Link>
            </li>
          )}

        </ul>
      </nav>
    </header>
  );
};
