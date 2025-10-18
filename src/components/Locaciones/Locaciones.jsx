import "./Locaciones.css";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState } from "react";
import {
  httpGetLocaciones,
  httpCrearLocacion,
  httpEditarLocacion,
  httpEliminarLocacion,
} from "../../api/config";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function Locaciones() {
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

  const [locaciones, setLocaciones] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState({
    loc_area: "",
    loc_descripcion: "",
  });
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);

  const fetchLocaciones = React.useCallback(
    async (currentPage = page) => {
      try {
        const offset = (currentPage - 1) * pageSize;
        const res = await fetch(
          `${httpGetLocaciones}?limit=${pageSize}&offset=${offset}`
        );
        const data = await res.json();
        setLocaciones(data.data);
        setTotal(data.total);
      } catch (error) {
        setAlert({
          show: true,
          message: "Error al cargar locaciones: " + error,
          variant: "danger",
        });
      }
    },
    [page, pageSize]
  );

  useEffect(() => {
    fetchLocaciones(page);
  }, [page, pageSize, fetchLocaciones]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId
      ? `${httpEditarLocacion}/${editId}`
      : httpCrearLocacion;
    const method = editId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setAlert({
          show: true,
          message: editId
            ? "Locación actualizada correctamente"
            : "Locación creada correctamente",
          variant: "success",
        });
        setForm({
          loc_area: "",
          loc_descripcion: "",
        });
        setEditId(null);
        setShow(false);
        fetchLocaciones(page);
      } else {
        setAlert({
          show: true,
          message: "Error al guardar la locación",
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
        const res = await fetch(`${httpEliminarLocacion}/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setAlert({
            show: true,
            message: "Locación eliminada correctamente",
            variant: "success",
          });
          fetchLocaciones(page);
        } else {
          setAlert({
            show: true,
            message: "Error al eliminar la locación",
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

  const handleEdit = (locacion) => {
    setForm({ ...locacion });
    setEditId(locacion.loc_id);
    setShow(true);
  };

  const handleAdd = () => {
    setForm({
      loc_area: "",
      loc_descripcion: "",
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
      <h2>Gestión de Locaciones</h2>
      <Button variant="success" className="mb-3" onClick={handleAdd}>
        Agregar Locación
      </Button>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Área</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {locaciones.map((loc) => (
            <tr key={loc.loc_id}>
              <td>{loc.loc_id}</td>
              <td>{loc.loc_area}</td>
              <td>{loc.loc_descripcion}</td>
              <td>
                <div className="d-flex">
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(loc)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(loc.loc_id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
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
            {editId ? "Editar Locación" : "Agregar Locación"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Área</label>
              <input
                name="loc_area"
                className="form-control"
                placeholder="Área"
                value={form.loc_area}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Descripción</label>
              <textarea
                name="loc_descripcion"
                className="form-control"
                placeholder="Descripción"
                value={form.loc_descripcion}
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
