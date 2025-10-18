export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const httpLogin = `${API_URL}/usuarios/login`;

export const httpGetUsuarios = `${API_URL}/usuarios`;
export const httpCrearUsuario = `${API_URL}/usuarios`;

export const httpGetDifuntos = `${API_URL}/difuntos`;
export const httpCrearDifunto = `${API_URL}/difuntos`;
export const httpEditarDifunto = `${API_URL}/difuntos`;
export const httpEliminarDifunto = `${API_URL}/difuntos`;

export const httpGetMovimientos = `${API_URL}/movimientos`;
export const httpCrearMovimiento = `${API_URL}/movimientos`;
export const httpEditarMovimiento = `${API_URL}/movimientos`;
export const httpEliminarMovimiento = `${API_URL}/movimientos`;

export const httpGetEncargados = `${API_URL}/encargados`;
export const httpCrearEncargado = `${API_URL}/encargados`;
export const httpEditarEncargado = `${API_URL}/encargados`;
export const httpEliminarEncargado = `${API_URL}/encargados`;

export const httpGetLocaciones = `${API_URL}/locaciones`;
export const httpGetTodasLocaciones = `${API_URL}/locaciones/todas`;
export const httpCrearLocacion = `${API_URL}/locaciones`;
export const httpEditarLocacion = `${API_URL}/locaciones`;
export const httpEliminarLocacion = `${API_URL}/locaciones`;

export const httpGetPanteones = `${API_URL}/panteones`;
export const httpGetTodosPanteones = `${API_URL}/panteones/todos`;
export const httpCrearPanteon = `${API_URL}/panteones`;
export const httpEditarPanteon = `${API_URL}/panteones`;
export const httpEliminarPanteon = `${API_URL}/panteones`;

export const httpGetEspacios = `${API_URL}/espacios`;
export const httpGetEspaciosDisponibles = `${API_URL}/espacios/disponibles`;
export const httpCrearEspacio = `${API_URL}/espacios`;
export const httpEditarEspacio = `${API_URL}/espacios`;
export const httpEliminarEspacio = `${API_URL}/espacios`;

export const httpGetEstados = `${API_URL}/estados`;

export const httpGetTransacciones = `${API_URL}/transacciones`;
export const httpGetTransaccionesPorEspacio = `${API_URL}/transacciones/espacio`;
export const httpGetResumenPagosEspacio = `${API_URL}/transacciones/resumen`;
export const httpCrearTransaccion = `${API_URL}/transacciones`;
export const httpEditarTransaccion = `${API_URL}/transacciones`;
export const httpEliminarTransaccion = `${API_URL}/transacciones`;

export const httpReporteResumenGeneral = `${API_URL}/reportes/resumen-general`;
export const httpReporteIngresosPeriodo = `${API_URL}/reportes/ingresos-periodo`;
export const httpReporteCuentasCobrar = `${API_URL}/reportes/cuentas-cobrar`;
export const httpReporteOcupacionArea = `${API_URL}/reportes/ocupacion-area`;
export const httpReporteDifuntosPeriodo = `${API_URL}/reportes/difuntos-periodo`;
export const httpReporteEstadoPanteones = `${API_URL}/reportes/estado-panteones`;
export const httpReporteMovimientosRecientes = `${API_URL}/reportes/movimientos-recientes`;
export const httpReporteEspaciosDisponibles = `${API_URL}/reportes/espacios-disponibles`;
export const httpReporteResumenFinanciero = `${API_URL}/reportes/resumen-financiero`;
export const httpReporteTopDeudores = `${API_URL}/reportes/top-deudores`;

export const httpGetDeudores = `${API_URL}/deudores`;
export const httpGetDetalleDeudaEncargado = `${API_URL}/deudores/encargado`;
export const httpGetHistorialPagosEspacio = `${API_URL}/deudores/historial`;
export const httpExportarDeudores = `${API_URL}/deudores/exportar`;

export const httpBuscarPanteones = `${API_URL}/panteones/buscar`;
export const httpGetPanteonPorCodigo = `${API_URL}/panteones/codigo`;
