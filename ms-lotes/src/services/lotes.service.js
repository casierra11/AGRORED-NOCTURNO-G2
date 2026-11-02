// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/lotes.repository');
const { validarLote, construirLote } = require('../models/lote');
const HttpError = require('../utils/http-error');

async function obtenerTodos() {
  return await repo.findAll();
}

async function obtenerPorId(id) {
  const lote = await repo.findById(id);
  if (!lote) {
    throw new HttpError(404, `No existe el lote con id ${id}`);
  }
  return lote;
}

async function crear(datos) {
  // 1. Validar que vengan todos los campos obligatorios
  const errores = validarLote(datos);
  if (errores.length > 0) {
    throw new HttpError(400, errores.join(', '));
  }

  // 2. Regla de negocio: No pueden existir dos lotes con el mismo código
  const existe = await repo.findByCodigoLote(datos.codigo_lote);
  if (existe) {
    throw new HttpError(409, `Ya existe un lote con el código ${datos.codigo_lote}`);
  }

  // 3. Limpiar los datos y mandarlos a guardar
  const loteLimpio = construirLote(datos);
  return await repo.create(loteLimpio);
}

module.exports = { obtenerTodos, obtenerPorId, crear };