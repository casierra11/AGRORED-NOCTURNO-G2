// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No conoce HTTP (req/res) ni la base de datos directamente.
// =====================================================================
const repo = require('../repositories/lotes.repository');
const { construirLote } = require('../models/lote');
const HttpError = require('../utils/http-error');
const productosClient = require('../clients/productos.client');

// 1. RELACIÓN AL ESCRIBIR: Valida que el producto exista en ms-productos
// Si ms-productos está caído, existeProducto lanza un error 503 automáticamente (Caso 24)
async function validarProducto(productoId, token) {
  const existe = await productosClient.existeProducto(productoId, token);
  if (!existe) {
    throw new HttpError(400, `No existe el producto con id ${productoId}`);
  }
}

// 2. RELACIÓN AL LEER: Composición con UNA sola consulta ?ids= y degradación controlada
async function componer(lotes, token) {
  if (!lotes || lotes.length === 0) return [];

  // Extraemos los IDs únicos de producto presentes en la lista
  const ids = [...new Set(lotes.map((l) => l.producto_id).filter(Boolean))];
  const productos = await productosClient.productosPorIds(ids, token);

  // Si ms-productos está apagado -> Degradación controlada (producto: null + aviso)
  if (!productos) {
    return lotes.map((l) => ({
      ...l,
      producto: null,
      aviso: 'ms-productos no disponible'
    }));
  }

  // Si respondió -> Incrustamos el objeto producto correspondiente a cada lote
  return lotes.map((l) => ({
    ...l,
    producto: productos.get(l.producto_id) || null
  }));
}

async function obtenerTodos(filtros, token) {
  const lotes = await repo.findAll(filtros);
  return await componer(lotes, token);
}

async function obtenerPorId(id, token) {
  const lote = await repo.findById(id);
  if (!lote) {
    throw new HttpError(404, `No existe el lote con id ${id}`);
  }
  const [compuesto] = await componer([lote], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = [];
  if (!datos.producto_id) errores.push("producto_id es obligatorio");
  if (!datos.cantidad || datos.cantidad <= 0) errores.push("cantidad es obligatoria y debe ser mayor a 0");

  if (errores.length > 0) {
    throw new HttpError(400, "Datos inválidos", errores);
  }

  const existe = await repo.findByCodigoLote(datos.codigo_lote);
  if (existe) {
    throw new HttpError(409, `Ya existe un lote con el código ${datos.codigo_lote}`);
  }

  // Validación síncrona obligatoria: si ms-productos falla, lanza 400 o 503
  await validarProducto(datos.producto_id, token);

  const loteLimpio = construirLote(datos);
  const nuevoLote = await repo.create(loteLimpio);
  const [compuesto] = await componer([nuevoLote], token);
  return compuesto;
}

async function actualizar(id, datos, token) {
  const errores = [];
  if (!datos.producto_id) errores.push("producto_id es obligatorio");
  if (!datos.cantidad || datos.cantidad <= 0) errores.push("cantidad es obligatoria y debe ser mayor a 0");

  if (errores.length > 0) {
    throw new HttpError(400, "Datos inválidos", errores);
  }

  const existe = await repo.findByCodigoLote(datos.codigo_lote);
  if (existe && existe.id !== parseInt(id, 10)) {
    throw new HttpError(409, `Ya existe otro lote con el código ${datos.codigo_lote}`);
  }

  await validarProducto(datos.producto_id, token);

  const loteLimpio = construirLote(datos);
  const actualizado = await repo.update(id, loteLimpio);
  if (!actualizado) {
    throw new HttpError(404, `No existe el lote con id ${id}`);
  }

  const [compuesto] = await componer([actualizado], token);
  return compuesto;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) {
    throw new HttpError(404, `No existe el lote con id ${id}`);
  }
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };