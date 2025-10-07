import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Menu.css";
import logo from "../../assets/Logo.png";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <div className="brand">
        <img src={logo} alt="Logo Cementerio" className="brand-logo" />
        {isOpen && <span>Aldea San José El Tablón VC</span>}
      </div>
        <button
          className="toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-chevron-right"}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard/reportes" end>
          <i className="bi bi-house-door"></i>
          {isOpen && <span>Inicio</span>}
        </NavLink>
        <NavLink to="/dashboard/difuntos">
          <i className="bi bi-clipboard-x"></i>
          {isOpen && <span>Difuntos</span>}
        </NavLink>
        <NavLink to="/dashboard/encargados">
          <i className="bi bi-person-fill"></i>
          {isOpen && <span>Encargados</span>}
        </NavLink>
        <NavLink to="/dashboard/locaciones">
          <i className="bi bi-geo-alt"></i>
          {isOpen && <span>Locaciones</span>}
        </NavLink>
        <NavLink to="/dashboard/panteones">
          <i className="bi bi-building"></i>
          {isOpen && <span>Panteones</span>}
        </NavLink>
        <NavLink to="/dashboard/espacios">
          <i className="bi bi-grid-3x3"></i>
          {isOpen && <span>Espacios</span>}
        </NavLink>
        <NavLink to="/dashboard/transacciones">
          <i className="bi bi-cash-coin"></i>
          {isOpen && <span>Transacciones</span>}
        </NavLink>
        <NavLink to="/dashboard/deudores">
          <i className="bi bi-exclamation-triangle"></i>
          {isOpen && <span>Deudores</span>}
        </NavLink>
        <NavLink to="/dashboard/movimientos">
          <i className="bi bi-arrow-left-right"></i>
          {isOpen && <span>Movimientos</span>}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <i className="bi bi-box-arrow-right me-2"></i>
          {isOpen && <span> Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
}
