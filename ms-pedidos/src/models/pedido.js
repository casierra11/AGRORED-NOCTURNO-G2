// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Pedido y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// =====================================================================

const CENTROS_VALIDOS = ['Bogotá', 'Cali'];
const ESTADOS_VALIDOS = ['recibido', 'despachado', 'entregado'];

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarPedido(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del pedido'];
  }
  if (!datos.cliente_id || typeof datos.cliente_id !== 'number') {
    errores.push('cliente_id es obligatorio y debe ser un número');
  }
  if (!datos.producto_id || typeof datos.producto_id !== 'number') {
    errores.push('producto_id es obligatorio y debe ser un número');
  }
  if (!datos.cantidad || typeof datos.cantidad !== 'number' || datos.cantidad <= 0) {
    errores.push('cantidad es obligatoria y debe ser un número mayor a 0');
  }
  if (!CENTROS_VALIDOS.includes(datos.centro_distribucion)) {
    errores.push(`centro_distribucion debe ser uno de: ${CENTROS_VALIDOS.join(', ')}`);
  }
  if (datos.estado && !ESTADOS_VALIDOS.includes(datos.estado)) {
    errores.push(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }
  if (!datos.fecha || typeof datos.fecha !== 'string' || datos.fecha.trim() === '') {
    errores.push('fecha es obligatoria y debe ser una cadena de texto');
  }
  return errores;
}

// Construye un pedido "limpio" solo con los campos permitidos
function construirPedido(datos) {
  return {
    cliente_id: datos.cliente_id,
    producto_id: datos.producto_id,
    cantidad: datos.cantidad,
    centro_distribucion: datos.centro_distribucion,
    estado: datos.estado || 'recibido',
    fecha: datos.fecha.trim(),
  };
}

module.exports = { validarPedido, construirPedido };