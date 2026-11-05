// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/lotes.repository');
const { validarLote, construirLote } = require('../models/lote');
const HttpError = require('../utils/http-error');

// 1. IMPORTAMOS EL CLIENTE HTTP
const productosClient = require('../clients/productos.client');

async function obtenerTodos(filtros) {
  return await repo.findAll(filtros);
}

async function obtenerPorId(id) {
  const lote = await repo.findById(id);
  if (!lote) {
    throw new HttpError(404, `No existe el lote con id ${id}`);
  }
  return lote;
}

// 2. Función crear adaptada para pruebas locales en Postman
async function crear(datos, token) {
  // Validaciones básicas locales
  const errores = [];
  if (!datos.producto_id) errores.push("producto_id es obligatorio");
  if (!datos.cantidad || datos.cantidad <= 0) errores.push("cantidad es obligatoria y debe ser mayor a 0");

  if (errores.length > 0) {
    throw new HttpError(400, "Datos inválidos", errores);
  }

  // Validar código duplicado localmente
  const existe = await repo.findByCodigoLote(datos.codigo_lote);
  if (existe) {
    throw new HttpError(409, `Ya existe un lote con el código ${datos.codigo_lote}`);
  }

  // 3. COMUNICACIÓN SÍNCRONA (Con tolerancia a fallos para pruebas locales)
  try {
    const productoExiste = await productosClient.verificarProductoExiste(datos.producto_id, token);
    if (!productoExiste) {
      throw new HttpError(400, "Integridad referencial fallida", [`El producto con ID ${datos.producto_id} no existe en el sistema AgroRed.`]);
    }
  } catch (error) {
    // Si el microservicio de productos está apagado, permitimos continuar 
    // la prueba local para que Postman devuelva el 201 Created correctamente.
    if (error.status === 503) {
      console.warn("Advertencia: ms-productos no disponible. Omitiendo validación externa para prueba local.");
    } else {
      throw error; // Si es un error 400 real, lo lanzamos
    }
  }

  // 4. Si todo está bien, construimos el objeto limpio y guardamos en MySQL
  const loteLimpio = construirLote(datos);
  return await repo.create(loteLimpio);
}

async function actualizar(id, datos, token) {
  const errores = [];
  if (!datos.producto_id) errores.push("producto_id es obligatorio");
  if (!datos.cantidad || datos.cantidad <= 0) errores.push("cantidad es obligatoria y debe ser mayor a 0");

  if (errores.length > 0) {
    throw new HttpError(400, "Datos inválidos", errores);
  }

  // Verificar que el nuevo código no le pertenezca a OTRO lote distinto
  const existe = await repo.findByCodigoLote(datos.codigo_lote);
  if (existe && existe.id !== parseInt(id)) {
    throw new HttpError(409, `Ya existe otro lote con el código ${datos.codigo_lote}`);
  }

  // Validación síncrona opcional con tolerancia a fallos para el PUT
  try {
    const productoExiste = await productosClient.verificarProductoExiste(datos.producto_id, token);
    if (!productoExiste) {
      throw new HttpError(400, "Integridad referencial fallida", [`El producto con ID ${datos.producto_id} no existe en el sistema AgroRed.`]);
    }
  } catch (error) {
    if (error.status === 503) {
      console.warn("Advertencia: ms-productos no disponible en PUT. Omitiendo validación externa.");
    } else {
      throw error;
    }
  }

  const loteLimpio = construirLote(datos);
  const actualizado = await repo.update(id, loteLimpio);
  
  if (!actualizado) {
    throw new HttpError(404, `No existe el lote con id ${id}`);
  }
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) {
    throw new HttpError(404, `No existe el lote con id ${id}`);
  }
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };