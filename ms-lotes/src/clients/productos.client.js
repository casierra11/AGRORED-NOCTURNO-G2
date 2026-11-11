// =====================================================================
// CLIENTE HTTP: ms-productos
// Encapsula la comunicación REST síncrona hacia ms-productos.
// =====================================================================
const PRODUCTOS_URL = process.env.PRODUCTOS_URL || 'http://127.0.0.1:3003';

// Función base: realiza la petición y retorna null si el servicio está caído
async function pedir(ruta, token) {
  try {
    const respuesta = await fetch(`${PRODUCTOS_URL}${ruta}`, {
      method: 'GET',
      headers: {
        'authorization': token || '',
        'Content-Type': 'application/json'
      }
    });
    return respuesta;
  } catch (error) {
    // Si ms-productos está apagado o no responde, retorna null
    return null;
  }
}

// 1. VALIDACIÓN AL ESCRIBIR (POST y PUT)
// Si el servicio no responde arroja 503; si responde 200 retorna true, si 404 retorna false.
async function existeProducto(productoId, token) {
  const respuesta = await pedir(`/productos/${productoId}`, token);
  if (!respuesta) {
    const error = new Error('ms-productos no disponible');
    error.status = 503;
    throw error;
  }
  return respuesta.ok;
}

// 2. COMPOSICIÓN AL LEER (GET listado y GET por ID)
// Consulta varios productos en UNA sola petición -> Map(id => producto). Retorna null si está caído.
async function productosPorIds(ids, token) {
  if (!ids || ids.length === 0) return new Map();

  const respuesta = await pedir(`/productos?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null; // Activa degradación controlada

  const productos = await respuesta.json();
  return new Map(productos.map((p) => [p.id, { id: p.id, nombre: p.nombre, categoria: p.categoria }]));
}

module.exports = { existeProducto, productosPorIds };