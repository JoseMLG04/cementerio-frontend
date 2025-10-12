import "./Transacciones.css";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState } from "react";
import {
  httpGetTransacciones,
  httpCrearTransaccion,
  httpEditarTransaccion,
  httpGetEspacios,
  httpGetResumenPagosEspacio,
} from "../../api/config";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import { formatFecha, toInputDate } from "../../utils/fechas";

export default function Transacciones() {
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const [transacciones, setTransacciones] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    documento: "",
    fechaInicio: "",
    fechaFin: "",
    tipo: "",
  });
  const [form, setForm] = useState({
    tra_fecha_pago: new Date().toISOString().split("T")[0],
    tra_abono: "",
    tra_documento: "",
    tra_espacios: "",
    tra_observaciones: "",
  });
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [showResumen, setShowResumen] = useState(false);
  const [resumenPagos, setResumenPagos] = useState(null);

  const fetchEspacios = async () => {
    try {
      const res = await fetch(`${httpGetEspacios}?limit=1000&offset=0`);
      const data = await res.json();
      setEspacios(data.data);
    } catch (error) {
      console.error("Error al cargar espacios:", error);
    }
  };

  const fetchTransacciones = React.useCallback(
    async (currentPage = page) => {
      try {
        const offset = (currentPage - 1) * pageSize;
        const params = new URLSearchParams({
          limit: pageSize,
          offset: offset,
        });

        if (filtros.documento) params.append("documento", filtros.documento);
        if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
        if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);
        if (filtros.tipo) params.append("tipo", filtros.tipo);

        const res = await fetch(`${httpGetTransacciones}?${params}`);
        const data = await res.json();
        setTransacciones(data.data);
        setTotal(data.total);
      } catch (error) {
        setAlert({
          show: true,
          message: "Error al cargar transacciones: " + error,
          variant: "danger",
        });
      }
    },
    [page, pageSize, filtros]
  );

  useEffect(() => {
    fetchEspacios();
  }, []);

  useEffect(() => {
    fetchTransacciones(page);
  }, [page, pageSize, fetchTransacciones]);

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = () => {
    setPage(1);
    fetchTransacciones(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      documento: "",
      fechaInicio: "",
      fechaFin: "",
      tipo: "",
    });
    setPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "tra_espacios" && value && !editId) {
      const espacio = espacios.find((e) => e.esp_id === parseInt(value));
      setEspacioSeleccionado(espacio);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      try {
        const editData = {
          tra_fecha_pago: form.tra_fecha_pago,
          tra_documento: form.tra_documento,
          tra_observaciones: form.tra_observaciones,
        };

        const res = await fetch(`${httpEditarTransaccion}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        });

        if (res.ok) {
          setAlert({
            show: true,
            message: "Transacción actualizada correctamente",
            variant: "success",
          });
          setForm({
            tra_fecha_pago: new Date().toISOString().split("T")[0],
            tra_abono: "",
            tra_documento: "",
            tra_espacios: "",
            tra_observaciones: "",
          });
          setEditId(null);
          setEspacioSeleccionado(null);
          setShow(false);
          fetchTransacciones(page);
        } else {
          setAlert({
            show: true,
            message: "Error al actualizar la transacción",
            variant: "danger",
          });
        }
      } catch {
        setAlert({
          show: true,
          message: "Error de conexión al actualizar",
          variant: "danger",
        });
      }
    } else {
      if (espacioSeleccionado) {
        const restante = Number(espacioSeleccionado.esp_restante_pago);
        const abono = Number(form.tra_abono);
        if (abono > restante) {
          setAlert({
            show: true,
            message: `El abono no puede ser mayor al saldo restante (Q${restante.toFixed(2)})`,
            variant: "warning",
          });
          return;
        }
      }

      try {
        const res = await fetch(httpCrearTransaccion, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        
        if (res.ok) {
          const data = await res.json();
          setAlert({
            show: true,
            message: `Transacción registrada correctamente. Nuevo saldo: Q${data.espacioActualizado.esp_restante_pago}`,
            variant: "success",
          });
          setForm({
            tra_fecha_pago: new Date().toISOString().split("T")[0],
            tra_abono: "",
            tra_documento: "",
            tra_espacios: "",
            tra_observaciones: "",
          });
          setEspacioSeleccionado(null);
          setShow(false);
          fetchTransacciones(page);
          fetchEspacios();
        } else {
          setAlert({
            show: true,
            message: "Error al guardar la transacción",
            variant: "danger",
          });
        }
      } catch {
        setAlert({
          show: true,
          message: "Error de conexión al guardar",
          variant: "danger",
        });
      }
    }
  };

  const handleEdit = (transaccion) => {
    setForm({
      tra_fecha_pago: toInputDate(transaccion.tra_fecha_pago),
      tra_abono: transaccion.tra_abono,
      tra_documento: transaccion.tra_documento,
      tra_espacios: transaccion.tra_espacios,
      tra_observaciones: transaccion.tra_observaciones,
    });
    setEditId(transaccion.tra_id);
    setEspacioSeleccionado(null);
    setShow(true);
  };

  const handleVerResumen = async (espacioId) => {
    try {
      const res = await fetch(`${httpGetResumenPagosEspacio}/${espacioId}`);
      const data = await res.json();
      setResumenPagos(data);
      setShowResumen(true);
    } catch (error) {
      setAlert({
        show: true,
        message: "Error al cargar resumen: " + error,
        variant: "danger",
      });
    }
  };

  const handleAdd = () => {
    setForm({
      tra_fecha_pago: new Date().toISOString().split("T")[0],
      tra_abono: "",
      tra_documento: "",
      tra_espacios: "",
      tra_observaciones: "",
    });
    setEditId(null);
    setEspacioSeleccionado(null);
    setShow(true);
  };

  return (
    <div className="container mt-4">
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
        <h2>Gestión de Transacciones</h2>
        <div>
          <Button
            variant="info"
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'}`}></i> Filtros
          </Button>
          <Button variant="success" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Registrar Pago
          </Button>
        </div>
      </div>

      <Collapse in={showFilters}>
        <Card className="mb-3">
          <Card.Body>
            <h5 className="mb-3">
              <i className="bi bi-search"></i> Búsqueda y Filtros
            </h5>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-file-text"></i> Documento
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="documento"
                  placeholder="No. de documento"
                  value={filtros.documento}
                  onChange={handleFilterChange}
                />
                <small className="text-muted">Búsqueda parcial</small>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-calendar"></i> Fecha Inicio
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaInicio"
                  value={filtros.fechaInicio}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">Fecha Fin</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaFin"
                  value={filtros.fechaFin}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-tag"></i> Tipo de Espacio
                </label>
                <select
                  className="form-select"
                  name="tipo"
                  value={filtros.tipo}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="NICHO">NICHO</option>
                  <option value="TIERRA">TIERRA</option>
                </select>
              </div>

              <div className="col-md-12 d-flex gap-2">
                <Button variant="primary" onClick={handleBuscar}>
                  <i className="bi bi-search"></i> Buscar
                </Button>
                <Button variant="secondary" onClick={handleLimpiarFiltros}>
                  <i className="bi bi-x-circle"></i> Limpiar Filtros
                </Button>
              </div>
            </div>

            {(filtros.documento || filtros.fechaInicio || filtros.fechaFin || filtros.tipo) && (
              <div className="mt-3">
                <span className="badge bg-info">
                  <i className="bi bi-info-circle"></i> Filtros activos - Mostrando {total} resultados
                </span>
              </div>
            )}
          </Card.Body>
        </Card>
      </Collapse>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Espacio</th>
              <th>Tipo</th>
              <th>Locación</th>
              <th>Abono</th>
              <th>Documento</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.length > 0 ? (
              transacciones.map((tra) => (
                <tr key={tra.tra_id}>
                  <td>{formatFecha(tra.tra_fecha_pago)}</td>
                  <td>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleVerResumen(tra.tra_espacios)}
                    >
                      {tra.esp_no_espacio}
                    </Button>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        tra.esp_espacio === "NICHO" ? "bg-primary" : "bg-success"
                      }`}
                    >
                      {tra.esp_espacio}
                    </span>
                  </td>
                  <td>{tra.loc_area}</td>
                  <td className="text-end">
                    <strong>Q{Number(tra.tra_abono).toFixed(2)}</strong>
                  </td>
                  <td>{tra.tra_documento || "N/A"}</td>
                  <td>{tra.tra_observaciones || "-"}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEdit(tra)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <span>Página: </span>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="me-2"
          >
            Anterior
          </Button>
          <span>{page}</span>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={page * pageSize >= total}
            onClick={() => setPage(page + 1)}
            className="ms-2"
          >
            Siguiente
          </Button>
        </div>
        <div>
          <span>Mostrar: </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="form-select form-select-sm d-inline-block w-auto"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          <span>Total: {total}</span>
        </div>
      </div>

      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Editar Transacción" : "Registrar Pago"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            {editId && (
              <div className="col-md-12">
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Solo puedes modificar la fecha, documento y observaciones. El monto y espacio no se pueden cambiar para mantener la integridad de los pagos.
                </div>
              </div>
            )}
            
            <div className="col-md-6">
              <label className="form-label">Fecha de Pago *</label>
              <input
                name="tra_fecha_pago"
                className="form-control"
                type="date"
                value={form.tra_fecha_pago}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Documento</label>
              <input
                name="tra_documento"
                className="form-control"
                placeholder="No. de recibo, factura, etc."
                value={form.tra_documento}
                onChange={handleChange}
              />
            </div>
            
            {editId ? (
              <>
                <div className="col-md-6">
                  <label className="form-label">Espacio</label>
                  <input
                    className="form-control"
                    value={form.tra_espacios}
                    disabled
                  />
                  <small className="text-muted">No editable</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Abono</label>
                  <input
                    className="form-control"
                    value={`Q${Number(form.tra_abono).toFixed(2)}`}
                    disabled
                  />
                  <small className="text-muted">No editable</small>
                </div>
              </>
            ) : (
              <>
                <div className="col-md-12">
                  <label className="form-label">Espacio *</label>
                  <select
                    name="tra_espacios"
                    className="form-select"
                    value={form.tra_espacios}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un espacio</option>
                    {espacios.map((esp) => (
                      <option key={esp.esp_id} value={esp.esp_id}>
                        {esp.esp_no_espacio} - {esp.esp_espacio} ({esp.loc_area}) -
                        Restante: Q{Number(esp.esp_restante_pago).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                {espacioSeleccionado && (
                  <div className="col-md-12">
                    <div className="alert alert-info">
                      <strong>Información del Espacio:</strong>
                      <ul className="mb-0 mt-2">
                        <li>
                          Valor Total: Q
                          {Number(espacioSeleccionado.esp_valor_total).toFixed(2)}
                        </li>
                        <li>
                          Total Pagado: Q
                          {Number(espacioSeleccionado.esp_total_pagado).toFixed(2)}
                        </li>
                        <li>
                          <strong>
                            Saldo Restante: Q
                            {Number(espacioSeleccionado.esp_restante_pago).toFixed(
                              2
                            )}
                          </strong>
                        </li>
                        <li>
                          Cuotas: {espacioSeleccionado.esp_cuotas_restantes}/
                          {espacioSeleccionado.esp_cuotas}
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                <div className="col-md-6">
                  <label className="form-label">Abono *</label>
                  <input
                    name="tra_abono"
                    className="form-control"
                    placeholder="Monto a pagar"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.tra_abono}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}
            
            <div className="col-md-12">
              <label className="form-label">Observaciones</label>
              <textarea
                name="tra_observaciones"
                className="form-control"
                placeholder="Notas adicionales"
                value={form.tra_observaciones}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="col-12">
              <Button type="submit" variant="success">
                {editId ? "Actualizar" : "Registrar Pago"}
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => {
                  setShow(false);
                  setEditId(null);
                  setEspacioSeleccionado(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showResumen} onHide={() => setShowResumen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Resumen de Pagos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resumenPagos && (
            <div>
              <h5>Espacio: {resumenPagos.esp_no_espacio}</h5>
              <div className="row mt-3">
                <div className="col-md-6">
                  <p>
                    <strong>Valor Total:</strong> Q
                    {Number(resumenPagos.esp_valor_total).toFixed(2)}
                  </p>
                  <p>
                    <strong>Total Pagado:</strong> Q
                    {Number(resumenPagos.esp_total_pagado).toFixed(2)}
                  </p>
                  <p>
                    <strong>Saldo Restante:</strong> Q
                    {Number(resumenPagos.esp_restante_pago).toFixed(2)}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Cuotas Restantes:</strong>{" "}
                    {resumenPagos.esp_cuotas_restantes}/{resumenPagos.esp_cuotas}
                  </p>
                  <p>
                    <strong>Total Transacciones:</strong>{" "}
                    {resumenPagos.total_transacciones}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    <span
                      className={`badge ${
                        resumenPagos.esp_ocupado ? "bg-danger" : "bg-success"
                      }`}
                    >
                      {resumenPagos.esp_ocupado ? "Ocupado" : "Disponible"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResumen(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}