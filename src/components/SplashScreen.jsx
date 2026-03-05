export const SplashScreen = ({ fade = false }) => {
  return (
    <div className={`splash-screen ${fade ? "fade-out" : ""}`}>
      <div className="splash-card">
        <div className="logo-container">
          <img src="../APS-logo.png" alt="Logo" className="splash-logo" />
        </div>
        
        <div className="loader-wrapper">
          <div className="modern-loader"></div>
          <p className="loading-text">SYSTEM INITIATION...</p>
        </div>
      </div>
    </div>
  );
};