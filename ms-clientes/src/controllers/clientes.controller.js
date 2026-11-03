// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/clientes.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /clientes
//Get/clientes/Getclientes?tipo=distribuidor,Get/clientees?ids=1,3
async function listar(req, res) {
const filtros={tipo:req.query.tipo};
if(req.query.ids){ //ids 1,3
  filtros.ids=String(req.query.ids).split(',').map(Number);
if(filtros.ids.some((id => !Number.isInteger(id) || id <= 0))) {
  throw new HttpError(400, 'Los ids deben ser enteros positivos');

}
}
  const clientes = await service.listar(filtros);
  res.status(200).json(clientes);
}

// GET /clientes/:id
async function obtener(req, res) {
  const cliente = await service.obtener(leerId(req));
  res.status(200).json(cliente);
}

// POST /clientes
async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

//actualizar cliente 
async function actualizar(req, res) {
  const id = leerId(req);
  const actualizado = await service.actualizar(id, req.body);
  res.status(200).json(actualizado);
}
//eliminar cliente
async function eliminar(req, res) {
  const id = leerId(req);
  await service.eliminar(id);
  res.status(204).send(); // sin cuerpo, solo el código de estado 204 No Content
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
