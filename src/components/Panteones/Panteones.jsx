import "./Panteones.css";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState } from "react";
import {
  httpGetPanteones,
  httpCrearPanteon,
  httpEditarPanteon,
  httpEliminarPanteon,
  httpGetTodasLocaciones,
} from "../../api/config";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import { fetchWithAuth } from '../../api/fetchWrapper';

export default function Panteones() {
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

  const [panteones, setPanteones] = useState([]);
  const [locaciones, setLocaciones] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    descripcion: "",
    locacion: "",
  });
  const [form, setForm] = useState({
    pan_no_panteon: "",
    pan_locacion_id: "",
    pan_capacidad_maxima: 6,
    pan_descripcion: "",
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

  const fetchPanteones = React.useCallback(
    async (currentPage = page) => {
      try {
        const offset = (currentPage - 1) * pageSize;
        const params = new URLSearchParams({
          limit: pageSize,
          offset: offset,
        });

        if (filtros.descripcion) params.append("descripcion", filtros.descripcion);
        if (filtros.locacion) params.append("locacion", filtros.locacion);

        const res = await fetchWithAuth(`${httpGetPanteones}?${params}`);
        const data = await res.json();
        setPanteones(data.data);
        setTotal(data.total);
      } catch (error) {
        setAlert({
          show: true,
          message: "Error al cargar panteones: " + error,
          variant: "danger",
        });
      }
    },
    [page, pageSize, filtros]
  );

  useEffect(() => {
    fetchLocaciones();
  }, []);

  useEffect(() => {
    fetchPanteones(page);
  }, [page, pageSize, fetchPanteones]);

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = () => {
    setPage(1);
    fetchPanteones(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      descripcion: "",
      locacion: "",
    });
    setPage(1);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `${httpEditarPanteon}/${editId}` : httpCrearPanteon;
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
            ? "Panteón actualizado correctamente"
            : "Panteón creado correctamente",
          variant: "success",
        });
        setForm({
          pan_no_panteon: "",
          pan_locacion_id: "",
          pan_capacidad_maxima: 6,
          pan_descripcion: "",
        });
        setEditId(null);
        setShow(false);
        fetchPanteones(page);
      } else {
        setAlert({
          show: true,
          message: "Error al guardar el panteón",
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
        const res = await fetchWithAuth(`${httpEliminarPanteon}/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setAlert({
            show: true,
            message: "Panteón eliminado correctamente",
            variant: "success",
          });
          fetchPanteones(page);
        } else {
          setAlert({
            show: true,
            message: "Error al eliminar el panteón",
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

  const handleEdit = (panteon) => {
    setForm({ ...panteon });
    setEditId(panteon.pan_id);
    setShow(true);
  };

  const handleAdd = () => {
    setForm({
      pan_no_panteon: "",
      pan_locacion_id: "",
      pan_capacidad_maxima: 6,
      pan_descripcion: "",
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
        <h2>Gestión de Panteones</h2>
        <div>
          <Button
            variant="info"
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'}`}></i> Filtros
          </Button>
          <Button variant="success" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Agregar Panteón
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
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  <i className="bi bi-card-text"></i> Descripción
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="descripcion"
                  placeholder="Buscar por descripción"
                  value={filtros.descripcion}
                  onChange={handleFilterChange}
                />
                <small className="text-muted">Búsqueda parcial</small>
              </div>

              <div className="col-md-6">
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

            {(filtros.descripcion || filtros.locacion) && (
              <div className="mt-3">
                <span className="badge bg-info">
                  <i className="bi bi-info-circle"></i> Filtros activos - Mostrando {total} resultados
                </span>
              </div>
            )}
          </Card.Body>
        </Card>
      </Collapse>

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>No. Panteón</th>
            <th>Locación</th>
            <th>Capacidad Máxima</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {panteones.length > 0 ? (
            panteones.map((p) => (
              <tr key={p.pan_id}>
                <td>{p.pan_no_panteon}</td>
                <td>{p.loc_area || "Sin locación"}</td>
                <td>{p.pan_capacidad_maxima}</td>
                <td>{p.pan_descripcion}</td>
                <td>
                  <div className="d-flex">
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(p)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(p.pan_id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No se encontraron resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
            {editId ? "Editar Panteón" : "Agregar Panteón"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">No. Panteón *</label>
              <input
                name="pan_no_panteon"
                className="form-control"
                placeholder="No. Panteón"
                value={form.pan_no_panteon}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Capacidad Máxima</label>
              <input
                name="pan_capacidad_maxima"
                className="form-control"
                placeholder="Capacidad Máxima"
                type="number"
                value={form.pan_capacidad_maxima}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Locación</label>
              <select
                name="pan_locacion_id"
                className="form-select"
                value={form.pan_locacion_id}
                onChange={handleChange}
              >
                <option value="">Seleccione una locación</option>
                {locaciones.map((loc) => (
                  <option key={loc.loc_id} value={loc.loc_id}>
                    {loc.loc_area}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-12">
              <label className="form-label">Descripción</label>
              <textarea
                name="pan_descripcion"
                className="form-control"
                placeholder="Descripción"
                value={form.pan_descripcion}
                onChange={handleChange}
                rows="3"
              />
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