import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpLogin } from "../../api/config";
import { fetchWithAuth } from "../../api/fetchWrapper"; 
import "./Login.css";
import Logo from "../../assets/Logo.png";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetchWithAuth(httpLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usu_usuario: usuario,
          usu_contrasenia: contrasenia,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario)); 
        navigate("/dashboard/reportes");
      } else {
        setError(data.error || "Credenciales incorrectas");
      }
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      <div className="login-card">
        <div className="logo-container">
          <img src={Logo} alt="Logo Cementerio" className="login-logo" />
        </div>
        <h2 className="login-title">Sistema de Gestión</h2>
        <p className="login-subtitle">Cementerio Municipal</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-person-fill"></i> Usuario
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Ingrese su usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-lock-fill"></i> Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Ingrese su contraseña"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="alert alert-danger animate-shake" role="alert">
              <i className="bi bi-exclamation-circle-fill"></i> {error}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Ingresando...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i> Iniciar Sesión
              </>
            )}
          </button>
        </form>
        <div className="login-footer">
          <small className="text-muted">
            <i className="bi bi-shield-check"></i> Acceso seguro
          </small>
        </div>
      </div>
    </div>
  );
}