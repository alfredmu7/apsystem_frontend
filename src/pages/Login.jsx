// src/pages/Login.jsx
  import React, { useState } from "react";
  import { useNavigate } from "react-router-dom"; 
  import "../style/Login.css";

  export default function Login() {

    const navigate = useNavigate();   // Hook para redirigir

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();

      setErrorMessage("");
      setLoading(true);

      try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            password: password
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => null);
          setErrorMessage(err?.message || "Credenciales incorrectas");
          setLoading(false);
          return;
        }

        const data = await response.json();
        const token = data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", email);

        // Fuerza a que App.jsx detecte el nuevo login
        window.dispatchEvent(new Event("storage"));
        navigate("/");//Redirección al home (App.jsx)   

      } catch (error) {
        console.error(error);
        setErrorMessage("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="login-page">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-title">Login</h2>

          {errorMessage && <p className="login-error">{errorMessage}</p>}

          <label className="login-label">
            Email
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Password
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
      </div>
    );
  }
