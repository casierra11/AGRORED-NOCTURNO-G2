// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/lotes.service');

async function obtenerTodos(req, res, next) {
  try {
    // Cambiamos estado_cultivo por resultado_calidad
    const filtros = { resultado_calidad: req.query.resultado_calidad };
    const lotes = await service.obtenerTodos(filtros);
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
    // Si todo sale bien (éxito), devuelve 201 y los datos
    res.status(201).json(nuevoLote);
  } catch (error) {
    // Si la validación falla, atrapa el error aquí y devuelve el JSON estructurado
    res.status(error.status || 500).json({
      error: error.message,
      detalles: error.detalles
    });
  }
}

async function actualizar(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const actualizado = await service.actualizar(id, req.body);
    res.status(200).json(actualizado);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message, detalles: error.detalles });
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