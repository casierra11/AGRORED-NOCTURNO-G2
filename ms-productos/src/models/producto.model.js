function validarProducto(datos) {
  const errores = [];
  const categoriasValidas = ['fruta', 'hortaliza', 'procesado'];
  const unidadesValidas = ['kg', 'caja'];

  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('nombre es obligatorio y debe ser un texto válido');
  }

  if (!datos.categoria || !categoriasValidas.includes(datos.categoria)) {
    errores.push(`categoria debe ser una de las siguientes: ${categoriasValidas.join(', ')}`);
  }

  if (!datos.unidad || !unidadesValidas.includes(datos.unidad)) {
    errores.push(`unidad debe ser una de las siguientes: ${unidadesValidas.join(', ')}`);
  }

  // Regla 400 según la tabla oficial: precio > 0
  if (datos.precio === undefined || typeof datos.precio !== 'number' || datos.precio <= 0) {
    errores.push('precio es obligatorio y debe ser un número mayor a 0');
  }

  return errores;
}

module.exports = { validarProducto };