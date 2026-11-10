// =====================================================================
// CLIENTE HTTP de ms-productos: se encarga de la comunicación 
// entre ms-pedidos y ms-productos.
// =====================================================================
const HttpError = require('../utils/http-error');
const PRODUCTOS_URL = process.env.PRODUCTOS_URL || 'http://localhost:3002';

// Hace la petición reenviando el token del usuario. null si no hubo respuesta.
async function pedir(ruta, token) {
  try {
    return await fetch(`${PRODUCTOS_URL}${ruta}`, {
      headers: { Authorization: token },        // reenvía el token de la petición original
      signal: AbortSignal.timeout(3000),        // timeout de 3 segundos por seguridad
    });
  } catch (error) {
    return null;                                // ms-productos caído o sin responder
  }
}

// VALIDACIÓN: ¿existe el producto? Si ms-productos no responde → 503
async function existeProducto(id, token) {
  const respuesta = await pedir(`/productos/${id}`, token);
  if (!respuesta) throw new HttpError(503, 'ms-productos não está disponible');
  if (respuesta.status === 404) return false;
  if (!respuesta.ok) {
    throw new HttpError(502, `ms-productos respondió ${respuesta.status}`);
  }
  return true;
}

// COMPOSICIÓN: varios productos en UNA petición → Map id → producto (null si no responde)
async function productosPorIds(ids, token) {
  if (ids.length === 0) return new Map();
  const respuesta = await pedir(`/productos?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null;
  const productos = await respuesta.json();
  return new Map(productos.map((p) =>
    [p.id, { id: p.id, nombre: p.nombre, precio: p.precio }]));
}

module.exports = { existeProducto, productosPorIds };