// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/lotes.service');

async function obtenerTodos(req, res, next) {
  try {
    const filtros = { resultado_calidad: req.query.resultado_calidad };
    const token = req.headers.authorization;
    const lotes = await service.obtenerTodos(filtros, token);
    res.status(200).json(lotes);
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const token = req.headers.authorization;
    const lote = await service.obtenerPorId(id, token);
    res.status(200).json(lote);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const token = req.headers.authorization;
    const nuevoLote = await service.crear(req.body, token);
    res.status(201).json(nuevoLote);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const token = req.headers.authorization;
    const actualizado = await service.actualizar(id, req.body, token);
    res.status(200).json(actualizado);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await service.eliminar(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };