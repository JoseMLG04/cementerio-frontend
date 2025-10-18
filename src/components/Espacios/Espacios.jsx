import "./Espacios.css";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState } from "react";
import {
  httpGetEspacios,
  httpCrearEspacio,
  httpEditarEspacio,
  httpEliminarEspacio,
  httpGetTodasLocaciones,
  httpGetTodosPanteones,
} from "../../api/config";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";

export default function Espacios() {
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

  const [espacios, setEspacios] = useState([]);
  const [locaciones, setLocaciones] = useState([]);
  const [panteones, setPanteones] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: "",
    ocupado: "",
    locacion: "",
  });
  const [form, setForm] = useState({
    esp_espacio: "NICHO",
    esp_panteon: "",
    esp_locacion: "",
    esp_no_espacio: "",
    esp_ocupado: false,
    esp_valor_total: 0,
    esp_cuotas: 1,
  });
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);

  const fetchLocaciones = async () => {
    try {
      const res = await fetchWithAuth(httpGetTodasLocaciones);
      const data = await res.json();
      setLocaciones(data);
    } catch (error) {
      console.error("Error al cargar locaciones:", error);
    }
  };

  const fetchPanteones = async () => {
    try {
      const res = await fetchWithAuth(httpGetTodosPanteones);
      const data = await res.json();
      setPanteones(data);
    } catch (error) {
      console.error("Error al cargar panteones:", error);
    }
  };

  const fetchEspacios = React.useCallback(
    async (currentPage = page) => {
      try {
        const offset = (currentPage - 1) * pageSize;
        const params = new URLSearchParams({
          limit: pageSize,
          offset: offset,
        });

        if (filtros.tipo) params.append("tipo", filtros.tipo);
        if (filtros.ocupado !== "") params.append("ocupado", filtros.ocupado);
        if (filtros.locacion) params.append("locacion", filtros.locacion);

        const res = await fetchWithAuth(`${httpGetEspacios}?${params}`);
        const data = await res.json();
        setEspacios(data.data);
        setTotal(data.total);
      } catch (error) {
        setAlert({
          show: true,
          message: "Error al cargar espacios: " + error,
          variant: "danger",
        });
      }
    },
    [page, pageSize, filtros]
  );

  useEffect(() => {
    fetchLocaciones();
    fetchPanteones();
  }, []);

  useEffect(() => {
    fetchEspacios(page);
  }, [page, pageSize, fetchEspacios]);

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = () => {
    setPage(1);
    fetchEspacios(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      tipo: "",
      ocupado: "",
      locacion: "",
    });
    setPage(1);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "esp_espacio") {
      if (value === "TIERRA") {
        setForm({ ...form, [name]: value, esp_panteon: "" });
      } else {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({
        ...form,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `${httpEditarEspacio}/${editId}` : httpCrearEspacio;
    const method = editId ? "PUT" : "POST";
    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setAlert({
          show: true,
          message: editId
            ? "Espacio actualizado correctamente"
            : "Espacio creado correctamente",
          variant: "success",
        });
        setForm({
          esp_espacio: "NICHO",
          esp_panteon: "",
          esp_locacion: "",
          esp_no_espacio: "",
          esp_ocupado: false,
          esp_valor_total: 0,
          esp_cuotas: 1,
        });
        setEditId(null);
        setShow(false);
        fetchEspacios(page);
      } else {
        setAlert({
          show: true,
          message: "Error al guardar el espacio",
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
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
      try {
        const res = await fetchWithAuth(`${httpEliminarEspacio}/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setAlert({
            show: true,
            message: "Espacio eliminado correctamente",
            variant: "success",
          });
          fetchEspacios(page);
        } else {
          setAlert({
            show: true,
            message: "Error al eliminar el espacio",
            variant: "danger",
          });
        }
      } catch {
        setAlert({
          show: true,
          message: "Error de conexión al eliminar",
          variant: "danger",
        });
      }
    }
  };

  const handleEdit = (espacio) => {
    setForm({ ...espacio });
    setEditId(espacio.esp_id);
    setShow(true);
  };

  const handleAdd = () => {
    setForm({
      esp_espacio: "NICHO",
      esp_panteon: "",
      esp_locacion: "",
      esp_no_espacio: "",
      esp_ocupado: false,
      esp_valor_total: 0,
      esp_cuotas: 1,
    });
    setEditId(null);
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
        <h2>Gestión de Espacios</h2>
        <div>
          <Button
            variant="info"
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'}`}></i> Filtros
          </Button>
          <Button variant="success" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Agregar Espacio
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
              <div className="col-md-4">
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

              <div className="col-md-4">
                <label className="form-label fw-bold">
                  <i className="bi bi-check-circle"></i> Estado
                </label>
                <select
                  className="form-select"
                  name="ocupado"
                  value={filtros.ocupado}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="true">Ocupado</option>
                  <option value="false">Disponible</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">
                  <i className="bi bi-geo-alt"></i> Locación
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="locacion"
                  placeholder="Buscar por locación"
                  value={filtros.locacion}
                  onChange={handleFilterChange}
                />
                <small className="text-muted">Búsqueda parcial</small>
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

            {(filtros.tipo || filtros.ocupado !== "" || filtros.locacion) && (
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
              <th>No. Espacio</th>
              <th>Tipo</th>
              <th>Locación</th>
              <th>Panteón</th>
              <th>Ocupado</th>
              <th>Valor Total</th>
              <th>Pagado</th>
              <th>Restante</th>
              <th>Cuotas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {espacios.length > 0 ? (
              espacios.map((esp) => (
                <tr key={esp.esp_id}>
                  <td>{esp.esp_no_espacio}</td>
                  <td>
                    <span
                      className={`badge ${
                        esp.esp_espacio === "NICHO"
                          ? "bg-primary"
                          : "bg-success"
                      }`}
                    >
                      {esp.esp_espacio}
                    </span>
                  </td>
                  <td>{esp.loc_area}</td>
                  <td>{esp.pan_no_panteon || "N/A"}</td>
                  <td>
                    <span
                      className={`badge ${
                        esp.esp_ocupado ? "bg-danger" : "bg-success"
                      }`}
                    >
                      {esp.esp_ocupado ? "Sí" : "No"}
                    </span>
                  </td>
                  <td>Q{Number(esp.esp_valor_total).toFixed(2)}</td>
                  <td>Q{Number(esp.esp_total_pagado).toFixed(2)}</td>
                  <td>Q{Number(esp.esp_restante_pago).toFixed(2)}</td>
                  <td>
                    {esp.esp_cuotas_restantes}/{esp.esp_cuotas}
                  </td>
                  <td>
                    <div className="d-flex">
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(esp)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(esp.esp_id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center text-muted">
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
            {editId ? "Editar Espacio" : "Agregar Espacio"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Tipo de Espacio *</label>
              <select
                name="esp_espacio"
                className="form-select"
                value={form.esp_espacio}
                onChange={handleChange}
                required
              >
                <option value="NICHO">NICHO</option>
                <option value="TIERRA">TIERRA</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">No. Espacio *</label>
              <input
                name="esp_no_espacio"
                className="form-control"
                placeholder="No. Espacio"
                value={form.esp_no_espacio}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Locación *</label>
              <select
                name="esp_locacion"
                className="form-select"
                value={form.esp_locacion}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una locación</option>
                {locaciones.map((loc) => (
                  <option key={loc.loc_id} value={loc.loc_id}>
                    {loc.loc_area}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Panteón {form.esp_espacio === "NICHO" && "*"}
              </label>
              <select
                name="esp_panteon"
                className="form-select"
                value={form.esp_panteon}
                onChange={handleChange}
                required={form.esp_espacio === "NICHO"}
                disabled={form.esp_espacio === "TIERRA"}
              >
                <option value="">
                  {form.esp_espacio === "TIERRA"
                    ? "No aplica para espacios en tierra"
                    : "Seleccione un panteón"}
                </option>
                {panteones.map((pan) => (
                  <option key={pan.pan_id} value={pan.pan_id}>
                    {pan.pan_no_panteon} (Cap: {pan.pan_capacidad_maxima})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Valor Total</label>
              <input
                name="esp_valor_total"
                className="form-control"
                placeholder="Valor Total"
                type="number"
                step="0.01"
                value={form.esp_valor_total}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Cuotas</label>
              <input
                name="esp_cuotas"
                className="form-control"
                placeholder="Cuotas"
                type="number"
                value={form.esp_cuotas}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <div className="form-check mt-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="esp_ocupado"
                  checked={form.esp_ocupado}
                  onChange={handleChange}
                />
                <label className="form-check-label">Ocupado</label>
              </div>
            </div>
            <div className="col-12">
              <Button type="submit" variant="success">
                {editId ? "Actualizar" : "Agregar"}
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={() => setShow(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}