import "./Deudores.css";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState } from "react";
import {
  httpGetDeudores,
  httpGetDetalleDeudaEncargado,
  httpGetHistorialPagosEspacio,
} from "../../api/config";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { formatFecha } from "../../utils/fechas";

export default function Deudores() {
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [deudores, setDeudores] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [diasFiltro, setDiasFiltro] = useState(30);
  const [loading, setLoading] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [detalleEncargado, setDetalleEncargado] = useState(null);
  const [historialEspacio, setHistorialEspacio] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchDeudores = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${httpGetDeudores}?diasAtraso=${diasFiltro}`);
      const data = await res.json();
      setDeudores(data.deudores);
      setResumen(data.resumen);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar deudores: " + error,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeudores();
  }, [diasFiltro]);

  const handleVerDetalle = async (encargadoId) => {
    try {
      const res = await fetchWithAuth(`${httpGetDetalleDeudaEncargado}/${encargadoId}`);
      const data = await res.json();
      setDetalleEncargado(data);
      setShowDetalle(true);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar detalle: " + error,
        variant: "danger",
      });
    }
  };

  const handleVerHistorial = async (espacioId) => {
    try {
      const res = await fetchWithAuth(`${httpGetHistorialPagosEspacio}/${espacioId}`);
      const data = await res.json();
      setHistorialEspacio(data);
      setShowHistorial(true);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar historial: " + error,
        variant: "danger",
      });
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      "Sin Pagos": "bg-dark",
      Crítico: "bg-danger",
      Urgente: "bg-warning text-dark",
      Atrasado: "bg-info",
      "Al día": "bg-success",
    };
    return badges[estado] || "bg-secondary";
  };

  const deudoresFiltrados = deudores.filter((deudor) => {
    if (filtroEstado === "Todos") return true;
    return deudor.estado_morosidad === filtroEstado;
  });

  return (
    <div className="container-fluid mt-4">
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
        >
          {alert.message}
        </Alert>
      )}

      <h2>Gestión de Deudores</h2>

      {resumen && (
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="card text-center">
              <div className="card-body">
                <h6 className="card-title">Total Deudores</h6>
                <h3 className="text-primary">{resumen.total_deudores}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center">
              <div className="card-body">
                <h6 className="card-title">Deuda Total</h6>
                <h3 className="text-danger">
                  Q{Number(resumen.deuda_total).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center bg-dark text-white">
              <div className="card-body">
                <h6 className="card-title">Sin Pagos</h6>
                <h3>{resumen.sin_pagos || 0}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center bg-danger text-white">
              <div className="card-body">
                <h6 className="card-title">Crítico (+90d)</h6>
                <h3>{resumen.critico || 0}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center bg-warning text-dark">
              <div className="card-body">
                <h6 className="card-title">Urgente (60-90d)</h6>
                <h3>{resumen.urgente || 0}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center bg-info text-white">
              <div className="card-body">
                <h6 className="card-title">Atrasado (30-60d)</h6>
                <h3>{resumen.atrasado || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">Días mínimos de atraso</label>
          <select
            className="form-select"
            value={diasFiltro}
            onChange={(e) => setDiasFiltro(Number(e.target.value))}
          >
            <option value={15}>15 días</option>
            <option value={30}>30 días</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Filtrar por estado</label>
          <select
            className="form-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Sin Pagos">Sin Pagos</option>
            <option value="Crítico">Crítico (+90 días)</option>
            <option value="Urgente">Urgente (60-90 días)</option>
            <option value="Atrasado">Atrasado (30-60 días)</option>
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <Button variant="primary" onClick={fetchDeudores}>
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Encargado</th>
                <th>Teléfono</th>
                <th>Panteón</th>
                <th>Espacio</th>
                <th>Área</th>
                <th>Deuda</th>
                <th>Cuotas Pend.</th>
                <th>Último Pago</th>
                <th>Días sin Pagar</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {deudoresFiltrados.map((deudor, idx) => (
                <tr key={idx}>
                  <td>
                    <span
                      className={`badge ${getEstadoBadge(
                        deudor.estado_morosidad
                      )}`}
                    >
                      {deudor.estado_morosidad}
                    </span>
                  </td>
                  <td>
                    <strong>
                      {deudor.enc_primer_nombre}{" "}
                      {deudor.enc_segundo_nombre || ""}{" "}
                      {deudor.enc_primer_apellido}{" "}
                      {deudor.enc_segundo_apellido || ""}
                    </strong>
                    <br />
                    <small className="text-muted">
                      {deudor.enc_direccion || "Sin dirección"}
                    </small>
                  </td>
                  <td>
                    {deudor.enc_telefono_uno ? (
                      <>
                        <i className="bi bi-telephone"></i>{" "}
                        {deudor.enc_telefono_uno}
                        {deudor.enc_telefono_dos && (
                          <>
                            <br />
                            <i className="bi bi-telephone"></i>{" "}
                            {deudor.enc_telefono_dos}
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">Sin teléfono</span>
                    )}
                  </td>
                  <td>{deudor.pan_no_panteon}</td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleVerHistorial(deudor.esp_id)}
                    >
                      {deudor.esp_no_espacio}
                    </Button>
                    <br />
                    <small className="text-muted">{deudor.esp_espacio}</small>
                  </td>
                  <td>{deudor.loc_area || "N/A"}</td>
                  <td>
                    <strong className="text-danger">
                      Q{Number(deudor.esp_restante_pago).toFixed(2)}
                    </strong>
                    <br />
                    <small className="text-muted">
                      de Q{Number(deudor.esp_valor_total).toFixed(2)}
                    </small>
                  </td>
                  <td>
                    {deudor.esp_cuotas_restantes} / {deudor.esp_cuotas}
                  </td>
                  <td>
                    {deudor.ultima_fecha_pago ? (
                      formatFecha(deudor.ultima_fecha_pago)
                    ) : (
                      <span className="badge bg-dark">Sin pagos</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        deudor.dias_sin_pagar >= 90
                          ? "bg-danger"
                          : deudor.dias_sin_pagar >= 60
                          ? "bg-warning text-dark"
                          : "bg-info"
                      }`}
                    >
                      {deudor.dias_sin_pagar} días
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerDetalle(deudor.enc_id)}
                    >
                      <i className="bi bi-eye"></i> Ver Detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deudoresFiltrados.length === 0 && (
            <div className="alert alert-info text-center">
              No hay deudores con los filtros seleccionados
            </div>
          )}
        </div>
      )}

      <Modal
        show={showDetalle}
        onHide={() => setShowDetalle(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalle de Deuda</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detalleEncargado && detalleEncargado.encargado && (
            <>
              <h5>
                {detalleEncargado.encargado.enc_primer_nombre}{" "}
                {detalleEncargado.encargado.enc_segundo_nombre || ""}{" "}
                {detalleEncargado.encargado.enc_primer_apellido}{" "}
                {detalleEncargado.encargado.enc_segundo_apellido || ""}
              </h5>
              <p>
                <strong>Teléfono:</strong>{" "}
                {detalleEncargado.encargado.enc_telefono_uno || "N/A"}
                {detalleEncargado.encargado.enc_telefono_dos &&
                  ` / ${detalleEncargado.encargado.enc_telefono_dos}`}
              </p>
              <p>
                <strong>Dirección:</strong>{" "}
                {detalleEncargado.encargado.enc_direccion || "N/A"}
              </p>
              <hr />
              <h6>Espacios con Deuda</h6>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Espacio</th>
                    <th>Panteón</th>
                    <th>Deuda</th>
                    <th>Cuotas Pend.</th>
                    <th>Último Pago</th>
                    <th>Días</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleEncargado.espacios.map((esp) => (
                    <tr key={esp.esp_id}>
                      <td>{esp.esp_no_espacio}</td>
                      <td>{esp.pan_no_panteon}</td>
                      <td>Q{Number(esp.esp_restante_pago).toFixed(2)}</td>
                      <td>{esp.esp_cuotas_restantes}</td>
                      <td>
                        {esp.ultima_fecha_pago
                          ? formatFecha(esp.ultima_fecha_pago)
                          : "Sin pagos"}
                      </td>
                      <td>{esp.dias_sin_pagar || "-"} días</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetalle(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showHistorial}
        onHide={() => setShowHistorial(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Historial de Pagos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historialEspacio && historialEspacio.espacio && (
            <>
              <h5>
                Espacio: {historialEspacio.espacio.esp_no_espacio} -{" "}
                {historialEspacio.espacio.pan_no_panteon}
              </h5>
              <div className="alert alert-info">
                <strong>Valor Total:</strong> Q
                {Number(historialEspacio.espacio.esp_valor_total).toFixed(2)} |{" "}
                <strong>Pagado:</strong> Q
                {Number(historialEspacio.espacio.esp_total_pagado).toFixed(2)}{" "}
                | <strong>Restante:</strong> Q
                {Number(historialEspacio.espacio.esp_restante_pago).toFixed(2)}
              </div>
              <h6>Transacciones</h6>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Abono</th>
                    <th>Documento</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historialEspacio.historial.length > 0 ? (
                    historialEspacio.historial.map((pago) => (
                      <tr key={pago.tra_id}>
                        <td>{formatFecha(pago.tra_fecha_pago)}</td>
                        <td>Q{Number(pago.tra_abono).toFixed(2)}</td>
                        <td>{pago.tra_documento || "-"}</td>
                        <td>{pago.tra_observaciones || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No hay transacciones registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistorial(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}