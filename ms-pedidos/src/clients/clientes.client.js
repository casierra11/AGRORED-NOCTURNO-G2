// =====================================================================
// CLIENTE HTTP de ms-clientes: se encarga de la comunicación 
// entre ms-pedidos y ms-clientes.
// =====================================================================
const HttpError = require('../utils/http-error');
const CLIENTES_URL = process.env.CLIENTES_URL || 'http://localhost:3002';

async function pedir(ruta, token) {
  try {
    return await fetch(`${CLIENTES_URL}${ruta}`, {
      headers: { Authorization: token },
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    return null; // ms-clientes caído o sin responder
  }
}

async function existeCliente(id, token) {
  const respuesta = await pedir(`/clientes/${id}`, token);
  if (!respuesta) throw new HttpError(503, 'ms-clientes no está disponible');
  if (respuesta.status === 404) return false;
  if (!respuesta.ok) {
    throw new HttpError(502, `ms-clientes respondió ${respuesta.status}`);
  }
  return true;
}

// Opcional para composición más adelante
async function clientesPorIds(ids, token) {
  if (ids.length === 0) return new Map();
  const respuesta = await pedir(`/clientes?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null;
  const clientes = await respuesta.json();
  return new Map(clientes.map((c) => 
    [c.id, { id: c.id, nombre: c.nombre }]));
}

module.exports = { existeCliente, clientesPorIds };