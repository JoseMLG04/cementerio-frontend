import { formatFecha, toInputDate } from "../../utils/fechas";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import {
  httpGetDifuntos,
  httpCrearDifunto,
  httpEditarDifunto,
  httpEliminarDifunto,
} from "../../api/config";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";

export default function Difuntos() {
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    dpi: "",
    nombre: "",
    fechaDefuncionInicio: "",
    fechaDefuncionFin: "",
    fechaEntierroInicio: "",
    fechaEntierroFin: "",
  });

  const [form, setForm] = useState({
    dif_primer_nombre: "",
    dif_segundo_nombre: "",
    dif_primer_apellido: "",
    dif_segundo_apellido: "",
    dif_dpi: "",
    dif_espacios: "",
    dif_fecha_defuncion: "",
    dif_fecha_entierro: "",
  });
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);

  const fetchDifuntos = useCallback(
    async (currentPage = page) => {
      try {
        const offset = (currentPage - 1) * pageSize;

        const params = new URLSearchParams({
          limit: pageSize,
          offset: offset,
        });

        if (filtros.dpi) params.append('dpi', filtros.dpi);
        if (filtros.nombre) params.append('nombre', filtros.nombre);
        if (filtros.fechaDefuncionInicio) params.append('fechaDefuncionInicio', filtros.fechaDefuncionInicio);
        if (filtros.fechaDefuncionFin) params.append('fechaDefuncionFin', filtros.fechaDefuncionFin);
        if (filtros.fechaEntierroInicio) params.append('fechaEntierroInicio', filtros.fechaEntierroInicio);
        if (filtros.fechaEntierroFin) params.append('fechaEntierroFin', filtros.fechaEntierroFin);

        const res = await fetch(`${httpGetDifuntos}?${params.toString()}`);
        const data = await res.json();
        setDifuntos(data.data);
        setTotal(data.total);
      } catch (error) {
        setAlert({
          show: true,
          message: "Error al cargar difuntos: " + error,
          variant: "danger",
        });
      }
    },
    [page, pageSize, filtros]
  );

  useEffect(() => {
    fetchDifuntos(page);
  }, [page, pageSize, fetchDifuntos]);

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = () => {
    setPage(1); 
    fetchDifuntos(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      dpi: "",
      nombre: "",
      fechaDefuncionInicio: "",
      fechaDefuncionFin: "",
      fechaEntierroInicio: "",
      fechaEntierroFin: "",
    });
    setPage(1);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `${httpEditarDifunto}/${editId}` : httpCrearDifunto;
    const method = editId ? "PUT" : "POST";
    const formToSend = {
      ...form,
      dif_fecha_defuncion: form.dif_fecha_defuncion,
      dif_fecha_entierro: form.dif_fecha_entierro,
    };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSend),
      });
      if (res.ok) {
        setAlert({
          show: true,
          message: editId
            ? "Difunto actualizado correctamente"
            : "Difunto creado correctamente",
          variant: "success",
        });
        setForm({
          dif_primer_nombre: "",
          dif_segundo_nombre: "",
          dif_primer_apellido: "",
          dif_segundo_apellido: "",
          dif_dpi: "",
          dif_espacios: "",
          dif_fecha_defuncion: "",
          dif_fecha_entierro: "",
        });
        setEditId(null);
        setShow(false);
        fetchDifuntos(page);
      } else {
        setAlert({
          show: true,
          message: "Error al guardar el difunto",
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
        const res = await fetch(`${httpEliminarDifunto}/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setAlert({
            show: true,
            message: "Difunto eliminado correctamente",
            variant: "success",
          });
          fetchDifuntos(page);
        } else {
          setAlert({
            show: true,
            message: "Error al eliminar el difunto",
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

  const handleEdit = (difunto) => {
    setForm({
      ...difunto,
      dif_fecha_defuncion: toInputDate(difunto.dif_fecha_defuncion),
      dif_fecha_entierro: toInputDate(difunto.dif_fecha_entierro),
    });
    setEditId(difunto.dif_id);
    setShow(true);
  };

  const handleAdd = () => {
    setForm({
      dif_primer_nombre: "",
      dif_segundo_nombre: "",
      dif_primer_apellido: "",
      dif_segundo_apellido: "",
      dif_dpi: "",
      dif_espacios: "",
      dif_fecha_defuncion: "",
      dif_fecha_entierro: "",
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
        <h2>Lista de Difuntos</h2>
        <div>
          <Button 
            variant="info" 
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'}`}></i> Filtros
          </Button>
          <Button variant="success" onClick={handleAdd}>
            <i className="bi bi-plus-circle"></i> Agregar Difunto
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
                  <i className="bi bi-card-text"></i> DPI
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="dpi"
                  placeholder="Ingrese DPI"
                  value={filtros.dpi}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-person"></i> Nombre Completo
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  placeholder="Ej: Juan Pérez"
                  value={filtros.nombre}
                  onChange={handleFilterChange}
                />
                <small className="text-muted">Búsqueda parcial</small>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-calendar-x"></i> Fecha Defunción (Desde)
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaDefuncionInicio"
                  value={filtros.fechaDefuncionInicio}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Fecha Defunción (Hasta)</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaDefuncionFin"
                  value={filtros.fechaDefuncionFin}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">
                  <i className="bi bi-calendar-check"></i> Fecha Entierro (Desde)
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaEntierroInicio"
                  value={filtros.fechaEntierroInicio}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Fecha Entierro (Hasta)</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaEntierroFin"
                  value={filtros.fechaEntierroFin}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="col-md-6 d-flex align-items-end gap-2">
                <Button variant="primary" onClick={handleBuscar}>
                  <i className="bi bi-search"></i> Buscar
                </Button>
                <Button variant="secondary" onClick={handleLimpiarFiltros}>
                  <i className="bi bi-x-circle"></i> Limpiar Filtros
                </Button>
              </div>
            </div>

            {(filtros.dpi || filtros.nombre || filtros.fechaDefuncionInicio || 
              filtros.fechaDefuncionFin || filtros.fechaEntierroInicio || 
              filtros.fechaEntierroFin) && (
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
            <th>Primer Nombre</th>
            <th>Segundo Nombre</th>
            <th>Primer Apellido</th>
            <th>Segundo Apellido</th>
            <th>DPI</th>
            <th>Espacios</th>
            <th>Fecha Defunción</th>
            <th>Fecha Entierro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {difuntos.length > 0 ? (
            difuntos.map((d) => (
              <tr key={d.dif_id}>
                <td>{d.dif_primer_nombre}</td>
                <td>{d.dif_segundo_nombre}</td>
                <td>{d.dif_primer_apellido}</td>
                <td>{d.dif_segundo_apellido}</td>
                <td>{d.dif_dpi}</td>
                <td>{d.dif_espacios}</td>
                <td>{formatFecha(d.dif_fecha_defuncion)}</td>
                <td>{formatFecha(d.dif_fecha_entierro)}</td>
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
                      onClick={() => handleDelete(d.dif_id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center text-muted">
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
            {editId ? "Editar Difunto" : "Agregar Difunto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Primer Nombre</label>
              <input
                name="dif_primer_nombre"
                className="form-control"
                placeholder="Primer Nombre"
                value={form.dif_primer_nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Segundo Nombre</label>
              <input
                name="dif_segundo_nombre"
                className="form-control"
                placeholder="Segundo Nombre"
                value={form.dif_segundo_nombre}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Primer Apellido</label>
              <input
                name="dif_primer_apellido"
                className="form-control"
                placeholder="Primer Apellido"
                value={form.dif_primer_apellido}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Segundo Apellido</label>
              <input
                name="dif_segundo_apellido"
                className="form-control"
                placeholder="Segundo Apellido"
                value={form.dif_segundo_apellido}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">DPI</label>
              <input
                name="dif_dpi"
                className="form-control"
                placeholder="DPI"
                value={form.dif_dpi}
                onChange={handleChange}
                type="number"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Espacios</label>
              <input
                name="dif_espacios"
                className="form-control"
                placeholder="Espacios"
                value={form.dif_espacios}
                onChange={handleChange}
                type="number"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Fecha Defunción</label>
              <input
                name="dif_fecha_defuncion"
                className="form-control"
                placeholder="Fecha Defunción"
                value={form.dif_fecha_defuncion}
                onChange={handleChange}
                type="date"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Fecha Entierro</label>
              <input
                name="dif_fecha_entierro"
                className="form-control"
                placeholder="Fecha Entierro"
                value={form.dif_fecha_entierro}
                onChange={handleChange}
                type="date"
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