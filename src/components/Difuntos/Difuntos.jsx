import { formatFecha, toInputDate } from "../../utils/fechas";
import Alert from "react-bootstrap/Alert";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import {
  httpGetDifuntos,
  httpCrearDifunto,
  httpEditarDifunto,
  httpEliminarDifunto,
  httpBuscarPanteones,
  httpGetPanteonPorCodigo,
} from "../../api/config";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import { fetchWithAuth } from "../../api/fetchWrapper";

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

  const [panteones, setPanteones] = useState([]);
  const [busquedaPanteon, setBusquedaPanteon] = useState("");
  const [panteonSeleccionado, setPanteonSeleccionado] = useState(null);
  const [nichosDisponibles, setNichosDisponibles] = useState([]);
  const [cargandoNichos, setCargandoNichos] = useState(false);

  const [form, setForm] = useState({
    dif_primer_nombre: "",
    dif_segundo_nombre: "",
    dif_primer_apellido: "",
    dif_segundo_apellido: "",
    dif_dpi: "",
    dif_panteon_codigo: "",   
    dif_numero_nicho: "",      
    dif_fecha_defuncion: "",
    dif_fecha_entierro: "",
  });
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);

  const buscarPanteones = async (termino) => {
    if (!termino || termino.length < 2) {
      setPanteones([]);
      return;
    }

    try {
      const res = await fetchWithAuth(`${httpBuscarPanteones}?busqueda=${encodeURIComponent(termino)}`);
      const data = await res.json();
      setPanteones(data);
    } catch (error) {
      console.error("Error al buscar panteones:", error);
    }
  };
  const obtenerNichosPanteon = async (codigoPanteon) => {
    setCargandoNichos(true);
    try {
      const res = await fetchWithAuth(`${httpGetPanteonPorCodigo}/${codigoPanteon}`);
      const data = await res.json();
      
      if (res.ok) {
        setPanteonSeleccionado(data);

        const nichos = [];
        for (let i = 1; i <= data.pan_capacidad_maxima; i++) {
          const nichoExistente = data.nichos?.find(n => parseInt(n.numero_nicho) === i);
          nichos.push({
            numero: i,
            ocupado: nichoExistente?.esp_ocupado || false,
            existe: !!nichoExistente
          });
        }
        setNichosDisponibles(nichos);
      }
    } catch (error) {
      console.error("Error al obtener nichos:", error);
    } finally {
      setCargandoNichos(false);
    }
  };
  const seleccionarPanteon = (panteon) => {
    setForm({ ...form, dif_panteon_codigo: panteon.pan_no_panteon, dif_numero_nicho: "" });
    setBusquedaPanteon(`${panteon.pan_no_panteon} - ${panteon.pan_descripcion}`);
    setPanteones([]);
    obtenerNichosPanteon(panteon.pan_no_panteon);
  };

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

        const res = await fetchWithAuth(`${httpGetDifuntos}?${params.toString()}`);
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

    if (!form.dif_panteon_codigo || !form.dif_numero_nicho) {
      setAlert({
        show: true,
        message: "Debe seleccionar un panteón y un nicho",
        variant: "warning",
      });
      return;
    }

    const url = editId ? `${httpEditarDifunto}/${editId}` : httpCrearDifunto;
    const method = editId ? "PUT" : "POST";
    
    const formToSend = {
      ...form,
      dif_fecha_defuncion: form.dif_fecha_defuncion,
      dif_fecha_entierro: form.dif_fecha_entierro,
    };
    
    try {
      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSend),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAlert({
          show: true,
          message: editId
            ? "Difunto actualizado correctamente"
            : "Difunto creado correctamente",
          variant: "success",
        });
        handleCloseModal();
        fetchDifuntos(page);
      } else {
        setAlert({
          show: true,
          message: data.error || "Error al guardar el difunto",
          variant: "danger",
        });
      }
    } catch (error) {
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
        const res = await fetchWithAuth(`${httpEliminarDifunto}/${id}`, {
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
    handleCloseModal();
    setEditId(null);
    setShow(true);
  };

  const handleCloseModal = () => {
    setForm({
      dif_primer_nombre: "",
      dif_segundo_nombre: "",
      dif_primer_apellido: "",
      dif_segundo_apellido: "",
      dif_dpi: "",
      dif_panteon_codigo: "",
      dif_numero_nicho: "",
      dif_fecha_defuncion: "",
      dif_fecha_entierro: "",
    });
    setBusquedaPanteon("");
    setPanteones([]);
    setPanteonSeleccionado(null);
    setNichosDisponibles([]);
    setShow(false);
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
            <th>Espacio (ID)</th>
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

      <Modal show={show} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Editar Difunto" : "Agregar Difunto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Primer Nombre *</label>
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
              <label className="form-label">Primer Apellido *</label>
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
            <div className="col-md-6">
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

            <div className="col-12">
              <hr />
              <h6 className="text-primary">
                <i className="bi bi-building"></i> Selección de Panteón y Nicho
              </h6>
            </div>

            <div className="col-md-6">
              <label className="form-label">Buscar Panteón *</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: A-001 o Familia López"
                  value={busquedaPanteon}
                  onChange={(e) => {
                    setBusquedaPanteon(e.target.value);
                    buscarPanteones(e.target.value);
                  }}
                  required
                />
                {panteones.length > 0 && (
                  <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                    {panteones.map((p) => (
                      <div
                        key={p.pan_id}
                        className="p-2 border-bottom cursor-pointer hover-bg-light"
                        style={{ cursor: 'pointer' }}
                        onClick={() => seleccionarPanteon(p)}
                      >
                        <strong>{p.pan_no_panteon}</strong> - {p.pan_descripcion}
                        <br />
                        <small className="text-muted">
                          {p.loc_area} • Disponibles: {p.nichos_disponibles}/{p.pan_capacidad_maxima}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <small className="text-muted">Escribe al menos 2 caracteres para buscar</small>
            </div>

            <div className="col-md-6">
              <label className="form-label">Número de Nicho *</label>
              {cargandoNichos ? (
                <div className="text-center p-3">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Cargando nichos...
                </div>
              ) : nichosDisponibles.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {nichosDisponibles.map((nicho) => (
                    <Button
                      key={nicho.numero}
                      variant={
                        form.dif_numero_nicho === nicho.numero.toString()
                          ? "primary"
                          : nicho.ocupado
                          ? "secondary"
                          : "outline-primary"
                      }
                      size="sm"
                      disabled={nicho.ocupado}
                      onClick={() => setForm({ ...form, dif_numero_nicho: nicho.numero.toString() })}
                      style={{ width: '50px' }}
                    >
                      {nicho.numero}
                      {nicho.ocupado && <i className="bi bi-lock-fill ms-1"></i>}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle"></i> Selecciona un panteón primero
                </div>
              )}
              {panteonSeleccionado && (
                <small className="text-muted d-block mt-2">
                  <i className="bi bi-lock-fill"></i> = Ocupado | 
                  Capacidad máxima: {panteonSeleccionado.pan_capacidad_maxima} nichos
                </small>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Fecha Defunción</label>
              <input
                name="dif_fecha_defuncion"
                className="form-control"
                value={form.dif_fecha_defuncion}
                onChange={handleChange}
                type="date"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Fecha Entierro</label>
              <input
                name="dif_fecha_entierro"
                className="form-control"
                value={form.dif_fecha_entierro}
                onChange={handleChange}
                type="date"
              />
            </div>

            <div className="col-12">
              <Button type="submit" variant="success">
                <i className="bi bi-check-circle"></i> {editId ? "Actualizar" : "Agregar"}
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={handleCloseModal}
              >
                <i className="bi bi-x-circle"></i> Cancelar
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
