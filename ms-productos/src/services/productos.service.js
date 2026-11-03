const repo = require('../repositories/productos.repository');
const { validarProducto } = require('../models/producto.model');
const HttpError = require('../utils/http-error');

async function listar(filtros = {}) {
  return await repo.findAll(filtros);
}

async function obtenerPorId(id) {
  const producto = await repo.findById(id);
  if (!producto) {
    throw new HttpError(404, `No existe el producto con id ${id}`);
  }
  return producto;
}

async function crear(datos) {
  const errores = validarProducto(datos);
  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  // Regla 409 según la tabla oficial: Unicidad por nombre
  const existente = await repo.findByNombre(datos.nombre);
  if (existente) {
    throw new HttpError(409, `Ya existe un producto registrado con el nombre '${datos.nombre}'`);
  }

  return await repo.create(datos);
}

async function actualizar(id, datos) {
  const errores = validarProducto(datos);
  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  const productoExistente = await repo.findById(id);
  if (!productoExistente) {
    throw new HttpError(404, `No existe el producto con id ${id}`);
  }

  const duplicado = await repo.findByNombre(datos.nombre);
  if (duplicado && duplicado.id !== Number(id)) {
    throw new HttpError(409, `Ya existe otro producto con el nombre '${datos.nombre}'`);
  }

  return await repo.update(id, datos);
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) {
    throw new HttpError(404, `No existe el producto con id ${id}`);
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};