// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Usuario y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// Versión del Taller 1: todavía sin contraseña. La contraseña cifrada
// y el inicio de sesión se agregan en la versión completa (Taller 3).
// =====================================================================

// Los roles válidos vienen del archivo .env (cada empresa tiene los suyos)
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
  if (!datos.tipo || typeof datos.tipo !== 'string' || datos.tipo.trim() === '') {
    errores.push('tipo es obligatorio');
  }
  if (!datos.ciudad || typeof datos.ciudad !== 'string' || datos.ciudad.trim() === '') {
    errores.push('ciudad es obligatoria');
  }
  if (!datos.rol || typeof datos.rol !== 'string' || datos.rol.trim() === '') {
    errores.push('rol es obligatorio');
  }
  if (!datos.telefono || typeof datos.telefono !== 'string' || datos.telefono.trim() === '') {
    errores.push('telefono es obligatorio');
  }
  
  const tipos = tiposValidos();
  if (!tipos.includes(datos.tipo)) {
    errores.push(`tipo debe ser uno de: ${tipos.join(', ')}`);
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

module.exports = { validarCliente, construirCliente };
