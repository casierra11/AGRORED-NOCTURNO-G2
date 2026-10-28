// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/lotes.service');

async function obtenerTodos(req, res, next) {
  try {
    const lotes = await service.obtenerTodos();
    res.status(200).json(lotes);
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    // Convertimos el id de la URL (que es texto) a número
    const id = parseInt(req.params.id, 10);
    const lote = await service.obtenerPorId(id);
    res.status(200).json(lote);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const nuevoLote = await service.crear(req.body);
    res.status(201).json(nuevoLote);
  } catch (error) {
    next(error);
  }
}

module.exports = { obtenerTodos, obtenerPorId, crear };