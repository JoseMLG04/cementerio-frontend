import "./Reportes.css";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState } from "react";
import {
  httpReporteResumenGeneral,
  httpReporteIngresosPeriodo,
  httpReporteCuentasCobrar,
  httpReporteOcupacionArea,
  httpReporteDifuntosPeriodo,
  httpReporteEstadoPanteones,
  httpReporteMovimientosRecientes,
  httpReporteEspaciosDisponibles,
  httpReporteTopDeudores,
} from "../../api/config";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Button from "react-bootstrap/Button";
import { formatFecha } from "../../utils/fechas";

export default function Reportes() {
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [activeTab, setActiveTab] = useState("resumen");
  const [loading, setLoading] = useState(false);

  const [resumenGeneral, setResumenGeneral] = useState(null);
  const [ingresos, setIngresos] = useState(null);
  const [cuentasCobrar, setCuentasCobrar] = useState(null);
  const [ocupacion, setOcupacion] = useState(null);
  const [difuntos, setDifuntos] = useState(null);
  const [panteones, setPanteones] = useState(null);
  const [movimientos, setMovimientos] = useState(null);
  const [espaciosDisp, setEspaciosDisp] = useState(null);
  const [topDeudores, setTopDeudores] = useState(null);

  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchResumenGeneral = async () => {
    setLoading(true);
    try {
      const res = await fetch(httpReporteResumenGeneral);
      const data = await res.json();
      setResumenGeneral(data);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar resumen: " + error,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchIngresos = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${httpReporteIngresosPeriodo}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );
      const data = await res.json();
      setIngresos(data);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar ingresos: " + error,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCuentasCobrar = async () => {
    setLoading(true);
    try {
      const res = await fetch(httpReporteCuentasCobrar);
      const data = await res.json();
      setCuentasCobrar(data);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar cuentas por cobrar: " + error,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOcupacion = async () => {
    setLoading(true);
    try {
      const res = await fetch(httpReporteOcupacionArea);
      const data = await res.json();
      setOcupacion(data);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar ocupación: " + error,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDifuntos = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${httpReporteDifuntosPeriodo}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );
      const data = await res.json();
      setDifuntos(data);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar difuntos: " + error,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPanteones = async () => {
    setLoading(true);
    try {
      const res = await fetch(httpReporteEstadoPanteones);
      const data = await res.json();
      setPanteones(data);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar panteones: " + error,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMovimientos = async () => {
    setLoading(true);
    try {
      const res = await fetch(httpReporteMovimientosRecientes);
      const data = await res.json();
      setMovimientos(data);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar movimientos: " + error,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEspaciosDisponibles = async () => {
    setLoading(true);
    try {
      const res = await fetch(httpReporteEspaciosDisponibles);
      const data = await res.json();
      setEspaciosDisp(data);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar espacios: " + error,
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopDeudores = async () => {
    setLoading(true);
    try {
      const res = await fetch(httpReporteTopDeudores);
      const data = await res.json();
      setTopDeudores(data);
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
    if (activeTab === "resumen") fetchResumenGeneral();
    else if (activeTab === "ingresos") fetchIngresos();
    else if (activeTab === "cuentas") fetchCuentasCobrar();
    else if (activeTab === "ocupacion") fetchOcupacion();
    else if (activeTab === "difuntos") fetchDifuntos();
    else if (activeTab === "panteones") fetchPanteones();
    else if (activeTab === "movimientos") fetchMovimientos();
    else if (activeTab === "espacios") fetchEspaciosDisponibles();
    else if (activeTab === "deudores") fetchTopDeudores();
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <i className="bi bi-house-door"></i> Bienvenido
        </h2>
        <Button variant="primary" onClick={handlePrint}>
          <i className="bi bi-printer"></i> Imprimir
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="resumen" title="Resumen General">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : resumenGeneral ? (
            <div className="row">
              <div className="col-md-3">
                <div className="card text-center mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Total Espacios</h5>
                    <h2 className="text-primary">
                      {resumenGeneral.espacios.total_espacios}
                    </h2>
                    <p className="text-muted">
                      Ocupados: {resumenGeneral.espacios.espacios_ocupados} |
                      Disponibles:{" "}
                      {resumenGeneral.espacios.espacios_disponibles}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Difuntos Registrados</h5>
                    <h2 className="text-success">
                      {resumenGeneral.difuntos.total_difuntos}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Total Recaudado</h5>
                    <h2 className="text-info">
                      Q{Number(resumenGeneral.financiero.total_recaudado).toFixed(2)}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center mb-3">
                  <div className="card-body">
                    <h5 className="card-title">Por Cobrar</h5>
                    <h2 className="text-warning">
                      Q{Number(resumenGeneral.financiero.total_por_cobrar).toFixed(2)}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card mb-3">
                  <div className="card-header">Tipos de Espacios</div>
                  <div className="card-body">
                    <p>
                      <strong>Nichos:</strong>{" "}
                      {resumenGeneral.espacios.total_nichos}
                    </p>
                    <p>
                      <strong>Espacios en Tierra:</strong>{" "}
                      {resumenGeneral.espacios.total_tierra}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card mb-3">
                  <div className="card-header">Transacciones</div>
                  <div className="card-body">
                    <p>
                      <strong>Total:</strong>{" "}
                      {resumenGeneral.transacciones.total_transacciones}
                    </p>
                    <p>
                      <strong>Suma Total:</strong> Q
                      {Number(resumenGeneral.transacciones.suma_transacciones).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Tab>

        <Tab eventKey="ingresos" title="Ingresos por Período">
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-control"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-control"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <Button variant="primary" onClick={fetchIngresos}>
                Generar Reporte
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : ingresos ? (
            <>
              <div className="alert alert-info">
                <strong>Total del Período:</strong> Q
                {Number(ingresos.resumen.total_ingresos).toFixed(2)} en{" "}
                {ingresos.resumen.total_transacciones} transacciones
              </div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Transacciones</th>
                    <th>Total Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresos.detalle.map((ing, idx) => (
                    <tr key={idx}>
                      <td>{formatFecha(ing.fecha)}</td>
                      <td>{ing.num_transacciones}</td>
                      <td>Q{Number(ing.total_ingresos).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </Tab>

        <Tab eventKey="cuentas" title="Cuentas por Cobrar">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : cuentasCobrar ? (
            <>
              <div className="alert alert-warning">
                <strong>Total por Cobrar:</strong> Q
                {Number(cuentasCobrar.totales.total_por_cobrar).toFixed(2)} en{" "}
                {cuentasCobrar.totales.espacios_con_deuda} espacios
              </div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Espacio</th>
                    <th>Tipo</th>
                    <th>Área</th>
                    <th>Valor Total</th>
                    <th>Pagado</th>
                    <th>Restante</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentasCobrar.cuentas.map((cuenta) => (
                    <tr key={cuenta.esp_id}>
                      <td>{cuenta.esp_no_espacio}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {cuenta.esp_espacio}
                        </span>
                      </td>
                      <td>{cuenta.loc_area}</td>
                      <td>Q{Number(cuenta.esp_valor_total).toFixed(2)}</td>
                      <td>Q{Number(cuenta.esp_total_pagado).toFixed(2)}</td>
                      <td>
                        <strong>
                          Q{Number(cuenta.esp_restante_pago).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            cuenta.estado_pago === "Sin Pagos"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {cuenta.estado_pago}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </Tab>

        <Tab eventKey="ocupacion" title="Ocupación por Área">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : ocupacion ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Área</th>
                  <th>Total Espacios</th>
                  <th>Ocupados</th>
                  <th>Disponibles</th>
                  <th>% Ocupación</th>
                </tr>
              </thead>
              <tbody>
                {ocupacion.map((area, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{area.loc_area}</strong>
                    </td>
                    <td>{area.total_espacios}</td>
                    <td>
                      <span className="badge bg-danger">{area.ocupados}</span>
                    </td>
                    <td>
                      <span className="badge bg-success">
                        {area.disponibles}
                      </span>
                    </td>
                    <td>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${area.porcentaje_ocupacion}%` }}
                        >
                          {area.porcentaje_ocupacion}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </Tab>

        <Tab eventKey="panteones" title="Estado de Panteones">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : panteones ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Panteón</th>
                  <th>Locación</th>
                  <th>Capacidad Máx.</th>
                  <th>Nichos Totales</th>
                  <th>Ocupados</th>
                  <th>Disponibles</th>
                  <th>Cap. Restante</th>
                </tr>
              </thead>
              <tbody>
                {panteones.map((pan, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{pan.pan_no_panteon}</strong>
                    </td>
                    <td>{pan.loc_area || "N/A"}</td>
                    <td>{pan.pan_capacidad_maxima}</td>
                    <td>{pan.nichos_totales}</td>
                    <td>
                      <span className="badge bg-danger">
                        {pan.nichos_ocupados}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success">
                        {pan.nichos_disponibles}
                      </span>
                    </td>
                    <td>{pan.capacidad_restante}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </Tab>

        <Tab eventKey="deudores" title="Top Deudores">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : topDeudores ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Espacio</th>
                  <th>Tipo</th>
                  <th>Área</th>
                  <th>Valor Total</th>
                  <th>Pagado</th>
                  <th>Deuda</th>
                  <th>% Pagado</th>
                </tr>
              </thead>
              <tbody>
                {topDeudores.map((deudor, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{deudor.esp_no_espacio}</td>
                    <td>
                      <span className="badge bg-secondary">
                        {deudor.esp_espacio}
                      </span>
                    </td>
                    <td>{deudor.loc_area}</td>
                    <td>Q{Number(deudor.esp_valor_total).toFixed(2)}</td>
                    <td>Q{Number(deudor.esp_total_pagado).toFixed(2)}</td>
                    <td>
                      <strong className="text-danger">
                        Q{Number(deudor.esp_restante_pago).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <div className="progress">
                        <div
                          className="progress-bar bg-warning"
                          role="progressbar"
                          style={{ width: `${deudor.porcentaje_pagado}%` }}
                        >
                          {deudor.porcentaje_pagado}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </Tab>

        <Tab eventKey="movimientos" title="Movimientos Recientes">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : movimientos ? (
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Difunto</th>
                  <th>Estado</th>
                  <th>Espacio</th>
                  <th>Área</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov, idx) => (
                  <tr key={idx}>
                    <td>{formatFecha(mov.mov_fecha)}</td>
                    <td>
                      {mov.dif_primer_nombre} {mov.dif_segundo_nombre}{" "}
                      {mov.dif_primer_apellido} {mov.dif_segundo_apellido}
                    </td>
                    <td>
                      <span className="badge bg-info">
                        {mov.est_descripcion}
                      </span>
                    </td>
                    <td>{mov.esp_no_espacio || "N/A"}</td>
                    <td>{mov.loc_area || "N/A"}</td>
                    <td>{mov.mov_observaciones || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </Tab>
      </Tabs>
    </div>
  );
}