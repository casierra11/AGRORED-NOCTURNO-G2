const service = require('../services/productos.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El ID debe ser un número entero positivo');
  }
  return id;
}

async function health(req, res) {
  res.status(200).json({ servicio: 'ms-productos', estado: 'ok' });
}

async function listar(req, res, next) {
  try {
    const filtros = {};

    if (req.query.categoria) {
      filtros.categoria = req.query.categoria;
    }

    // Procesamiento de ?ids=1,3,8
    if (req.query.ids) {
      filtros.ids = String(req.query.ids).split(',').map(Number);
      if (filtros.ids.some((id) => !Number.isInteger(id) || id <= 0)) {
        throw new HttpError(400, 'ids debe ser una lista de enteros separados por comas');
      }
    }

    const productos = await service.listar(filtros);
    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  try {
    const id = leerId(req);
    const producto = await service.obtenerPorId(id);
    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const nuevo = await service.crear(req.body);
    res.status(201).location(`/productos/${nuevo.id}`).json(nuevo);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = leerId(req);
    const actualizado = await service.actualizar(id, req.body);
    res.status(200).json(actualizado);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const id = leerId(req);
    await service.eliminar(id);
    // Exigencia del taller: 204 No Content sin cuerpo
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  health,
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
};