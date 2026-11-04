// =====================================================================
// CAPA DE SERVICIO (lógica de negocio) - ms-clientes
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/clientes.repository');
const { validarCliente, construirCliente } = require('../models/cliente');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const cliente = await repo.findById(id);
  if (!cliente) throw new HttpError(404, `No existe el cliente con id ${id}`);
  return cliente;
}

async function crear(datos) {
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const cliente = construirCliente(datos);

  // Regla de negocio: no puede haber dos clientes con el mismo NIT
  // (el NIT es el identificador tributario único). 409 = Conflict.
  if (await repo.findByNit(cliente.nit)) {
    throw new HttpError(409, `Ya existe un cliente con el NIT ${cliente.nit}`);
  }

  return repo.create(cliente);
}

async function actualizar(id, datos) {
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  // Regla de negocio: el cliente puede conservar su NIT, pero no puede cambiarlo 
  // a uno que ya exista en otro cliente.
  const otros= await repo.findByNit(datos.nit);
  if (otros && otros.id !== id) {
    throw new HttpError(409, `Ya existe otro cliente con el NIT ${datos.nit}`);
  }
  // AQUÍ ESTABA EL ERROR: Cambia 'cliente' por 'datos'
  const actualizado = await repo.update(id, datos);
  
  if (!actualizado) throw new HttpError(404, `No existe el cliente con id ${id}`);
  return actualizado;
}

//nueva funcion para eliminar un cliente existente
async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el cliente con id ${id}`);
  return eliminado;
}

module.exports = { listar, obtener, crear, actualizar, eliminar };