// =====================================================================
// CAPA DE MODELO (entidad Lotes)
// Define qué campos tiene un Lote y qué reglas deben cumplir.
// =====================================================================

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarLote(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del lote'];
  }
  if (!datos.codigo_lote || typeof datos.codigo_lote !== 'string' || datos.codigo_lote.trim() === '') {
    errores.push('codigo_lote es obligatorio');
  }
  if (typeof datos.producto_id !== 'number' || datos.producto_id <= 0) {
    errores.push('producto_id es obligatorio y debe ser un número entero mayor a 0');
  }
  if (!datos.fecha_produccion || typeof datos.fecha_produccion !== 'string' || datos.fecha_produccion.trim() === '') {
    errores.push('fecha_produccion es obligatoria (ej: 2026-10-28)');
  }
  if (typeof datos.cantidad !== 'number' || datos.cantidad <= 0) {
    errores.push('cantidad es obligatoria y debe ser un número mayor a 0');
  }
  
  const resultadosValidos = ['pendiente', 'aprobado', 'rechazado'];
  if (!resultadosValidos.includes(datos.resultado_calidad)) {
    errores.push(`resultado_calidad debe ser uno de: ${resultadosValidos.join(', ')}`);
  }
  
  return errores;
}

// Construye un lote "limpio" solo con los campos permitidos
function construirLote(datos) {
  return {
    codigo_lote: datos.codigo_lote.trim(),
    producto_id: datos.producto_id,
    fecha_produccion: datos.fecha_produccion.trim(),
    cantidad: datos.cantidad,
    resultado_calidad: datos.resultado_calidad
  };
}

module.exports = { validarLote, construirLote };