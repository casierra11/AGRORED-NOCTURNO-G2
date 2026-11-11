// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/pedidos.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /pedidos (con soporte para filtros y consulta por lotes ?ids=)
async function listar(req, res) {
  const filtros = { centro_distribucion: req.query.centro_distribucion };

  if (req.query.ids) {
    filtros.ids = String(req.query.ids).split(',').map(Number);
    if (filtros.ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new HttpError(400, 'ids debe ser una lista de enteros separados por comas');
    }
  }

  const token = req.headers.authorization;
  const pedidos = await service.listar(filtros, token);
  res.status(200).json(pedidos);
}

// GET /pedidos/:id
async function obtener(req, res) {
  const token = req.headers.authorization;
  const pedido = await service.obtener(leerId(req), token);
  res.status(200).json(pedido);
}

// POST /pedidos
async function crear(req, res) {
  const token = req.headers.authorization;
  const nuevo = await service.crear(req.body, token);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /pedidos/:id
async function actualizar(req, res) {
  const id = leerId(req);
  const token = req.headers.authorization;
  const actualizado = await service.actualizar(id, req.body, token);
  res.status(200).json(actualizado);
}

// DELETE /pedidos/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end(); // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };