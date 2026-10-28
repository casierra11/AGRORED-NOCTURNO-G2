// =====================================================================
// CAPA DE MODELO (entidad) - ms-clientes
// Define qué campos tiene un Cliente y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// =====================================================================

// Los tipos válidos para los clientes de AgroRed
function tiposValidos() {
  return ['distribuidor', 'comercio'];
}

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarCliente(datos) {
  const errores = [];
  
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del cliente'];
  }
  
  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('nombre es obligatorio');
  }
  
  if (!datos.nit || typeof datos.nit !== 'string' || datos.nit.trim() === '') {
    errores.push('nit es obligatorio');
  }
  
  if (!datos.ciudad || typeof datos.ciudad !== 'string' || datos.ciudad.trim() === '') {
    errores.push('ciudad es obligatoria');
  }
  
  if (!datos.telefono || typeof datos.telefono !== 'string' || datos.telefono.trim() === '') {
    errores.push('telefono es obligatorio');
  }
  
  if (!datos.tipo || typeof datos.tipo !== 'string' || datos.tipo.trim() === '') {
    errores.push('tipo es obligatorio');
  } else {
    const tipos = tiposValidos();
    if (!tipos.includes(datos.tipo.trim().toLowerCase())) {
      errores.push(`tipo debe ser uno de: ${tipos.join(', ')}`);
    }
  }
  
  return errores;
}

// Construye un cliente "limpio" solo con los campos permitidos
function construirCliente(datos) {
  return {
    nombre: datos.nombre.trim(),
    nit: datos.nit.trim(),
    ciudad: datos.ciudad.trim(),
    telefono: datos.telefono.trim(),
    tipo: datos.tipo.trim().toLowerCase(),
  };
}

module.exports = {
  validarCliente,
  construirCliente
};

module.exports = { validarCliente, construirCliente };
