// =====================================================================
// API: Centralizador de llamadas HTTP (Soporta múltiples microservicios)
// =====================================================================
class ErrorApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles || [];
  }
}

async function api(ruta, opciones = {}, servicio = 'usuarios') {
  const baseURL = servicio === 'pedidos' ? API_PEDIDOS : API_USUARIOS;
  const token = sessionStorage.getItem('token');
  const cabeceras = { 'Content-Type': 'application/json' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${baseURL}${ruta}`, {
      method: opciones.method || 'GET',
      headers: cabeceras,
      body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    });
  } catch (error) {
    throw new ErrorApi(0, `No hay conexión con el microservicio (${servicio}). ¿Está activo en su puerto?`);
  }

  if (respuesta.status === 401 && !ruta.includes('/login')) {
    cerrarSesion();
    return null;
  }
  
  const datos = respuesta.status === 204 ? null : await respuesta.json();
  if (!respuesta.ok) throw new ErrorApi(respuesta.status, datos?.error || 'Error en la petición', datos?.detalles || []);
  return datos;
}