import { formatFecha, toInputDate } from "../../utils/fechas";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import {
  httpGetMovimientos,
  httpCrearMovimiento,
  httpEditarMovimiento,
  httpEliminarMovimiento,
  httpGetEstados,
  httpGetDifuntos,
} from "../../api/config";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import { fetchWithAuth } from '../../api/fetchWrapper';

export default function Movimiento() {
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

  const [difuntos, setDifuntos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    difunto: "",
  });
  const [form, setForm] = useState({
    mov_fecha: "",
    mov_estados: "",
    mov_difuntos: "",
    mov_observaciones: "",
  });
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);

  const fetchMovimientos = useCallback(
    async (currentPage = page) => {
      try {
        const offset = (currentPage - 1) * pageSize;
        const params = new URLSearchParams({
          limit: pageSize,
          offset: offset,
        });

        if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
        if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);
        if (filtros.difunto) params.append("difunto", filtros.difunto);

        const res = await fetchWithAuth(`${httpGetMovimientos}?${params}`);
        const data = await res.json();
        setMovimientos(data.data);
        setTotal(data.total);
      } catch (error) {
        setAlert({
          show: true,
          message: "Error al cargar movimientos" + error,
          variant: "danger",
        });
      }
    },
    [page, pageSize, filtros]
  );

  useEffect(() => {
    fetchMovimientos(page);
  }, [page, pageSize, fetchMovimientos]);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await fetchWithAuth(httpGetEstados);
        const data = await res.json();
        setEstados(data.data || []);
      } catch (error) {
        console.error("Error cargando estados:", error);
        setEstados([]);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    const fetchDifuntos = async () => {
      try {
        const res = await fetchWithAuth(httpGetDifuntos);
        const data = await res.json();
        setDifuntos(data.data || []);
      } catch (error) {
        console.error("Error cargando difuntos:", error);
      }
    };
    fetchDifuntos();
  }, []);

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = () => {
    setPage(1);
    fetchMovimientos(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaInicio: "",
      fechaFin: "",
      difunto: "",
    });
    setPage(1);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId
      ? `${httpEditarMovimiento}/${editId}`
      : httpCrearMovimiento;
    const method = editId ? "PUT" : "POST";
    const formToSend = {
      ...form,
      mov_fecha: form.mov_fecha || null,
      mov_estados: form.mov_estados || null,
      mov_difuntos: form.mov_difuntos || null,
      mov_observaciones: form.mov_observaciones || "",
    };
    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSend),
      });
      if (res.ok) {
        setAlert({
          show: true,
          message: editId
            ? "Movimiento actualizado correctamente"
            : "Movimiento creado correctamente",
          variant: "success",
        });
        setForm({
          mov_fecha: "",
          mov_estados: "",
          mov_difuntos: "",
          mov_observaciones: "",
        });
        setEditId(null);
        setShow(false);
        fetchMovimientos(page);
      } else {
        setAlert({
          show: true,
          message: "Error al guardar el movimiento",
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
        const res = await fetchWithAuth(`${httpEliminarMovimiento}/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setAlert({
            show: true,
            message: "Movimiento eliminado correctamente",
            variant: "success",
          });
          fetchMovimientos(page);
        } else {
          setAlert({
            show: true,
            message: "Error al eliminar el movimiento",
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

  const handleEdit = (movimiento) => {
    setForm({
      ...movimiento,
      mov_fecha: toInputDate(movimiento.mov_fecha),
      mov_estados: movimiento.mov_estados,
      mov_difuntos: movimiento.mov_difuntos,
      mov_observaciones: movimiento.mov_observaciones,
    });
    setEditId(movimiento.mov_id);
    setShow(true);
  };

  const handleAdd = () => {
    setForm({
      mov_fecha: "",
      mov_estados: "",
      mov_difuntos: "",
      mov_observaciones: "",
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
        <h2>Lista de Movimientos</h2>
        <div>
          <Button
            variant="info"
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'}`}></i> Filtros
          </Button>
          <Button variant="success" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Agregar
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

              <div className="col-md-4">
                <label className="form-label fw-bold">Fecha Fin</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaFin"
                  value={filtros.fechaFin}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">
                  <i className="bi bi-person"></i> Difunto
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="difunto"
                  placeholder="ID o nombre del difunto"
                  value={filtros.difunto}
                  onChange={handleFilterChange}
                />
                <small className="text-muted">Ingrese ID o nombre</small>
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

            {(filtros.fechaInicio || filtros.fechaFin || filtros.difunto) && (
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
            <th>Fecha Movimiento</th>
            <th>Estado</th>
            <th>Difunto</th>
            <th>Observaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.length > 0 ? (
            movimientos.map((d) => (
              <tr key={d.mov_id}>
                <td>{formatFecha(d.mov_fecha)}</td>
                <td>{d.est_tipo || d.mov_estados}</td>
                <td>
                  {d.dif_id
                    ? `${d.dif_id} - ${d.dif_primer_nombre} ${d.dif_segundo_nombre || ""} ${d.dif_primer_apellido} ${d.dif_segundo_apellido || ""}`
                    : d.mov_difuntos}
                </td>
                <td>{d.mov_observaciones}</td>
                <td>
                  <div className="d-flex">
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(d)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(d.mov_id)}
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
            {editId ? "Editar Movimiento" : "Agregar Movimiento"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Fecha Movimiento</label>
              <input
                name="mov_fecha"
                className="form-control"
                placeholder="Fecha movimiento"
                value={form.mov_fecha}
                onChange={handleChange}
                type="date"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Estado</label>
              <select
                name="mov_estados"
                className="form-select"
                value={form.mov_estados}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un estado</option>
                {estados.map((estado) => (
                  <option key={estado.est_id} value={estado.est_id}>
                    {estado.est_id} - {estado.est_tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Difunto</label>
              <select
                name="mov_difuntos"
                className="form-select"
                value={form.mov_difuntos}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un difunto</option>
                {difuntos.map((d) => (
                  <option key={d.dif_id} value={d.dif_id}>
                    {d.dif_id} - {d.dif_primer_nombre}{" "}
                    {d.dif_segundo_nombre} {d.dif_primer_apellido}{" "}
                    {d.dif_segundo_apellido}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Observaciones</label>
              <textarea
                name="mov_observaciones"
                className="form-control"
                placeholder="Observaciones"
                value={form.mov_observaciones}
                onChange={handleChange}
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