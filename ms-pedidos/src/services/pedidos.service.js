// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones de pedidos.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/pedidos.repository');
const { validarPedido, construirPedido } = require('../models/pedido');
const { existeProducto } = require('../clients/productos.client');
const { existeCliente } = require('../clients/clientes.client');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const pedido = await repo.findById(id);
  if (!pedido) throw new HttpError(404, `No existe el pedido con id ${id}`);
  return pedido;
}

async function crear(datos, token) {
  // 1. Validar formato de datos básicos
  const errores = validarPedido(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  // 2. Validar que el cliente exista en ms-clientes
  const clienteExiste = await existeCliente(datos.cliente_id, token);
  if (!clienteExiste) {
    throw new HttpError(400, `El cliente con ID ${datos.cliente_id} no existe`);
  }

  // 3. Validar que el producto exista en ms-productos
  const productoExiste = await existeProducto(datos.producto_id, token);
  if (!productoExiste) {
    throw new HttpError(400, `El producto con ID ${datos.producto_id} no existe`);
  }

  const pedido = construirPedido(datos);
  return repo.create(pedido);
}

async function actualizar(id, datos, token) {
  const errores = validarPedido(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  // Si se envía cliente_id, validamos que exista
  if (datos.cliente_id) {
    const clienteExiste = await existeCliente(datos.cliente_id, token);
    if (!clienteExiste) {
      throw new HttpError(400, `El cliente con ID ${datos.cliente_id} no existe`);
    }
  }

  // Si se envía producto_id, validamos que exista
  if (datos.producto_id) {
    const productoExiste = await existeProducto(datos.producto_id, token);
    if (!productoExiste) {
      throw new HttpError(400, `El producto con ID ${datos.producto_id} no existe`);
    }
  }

  const actualizado = await repo.update(id, datos);
  if (!actualizado) throw new HttpError(404, `No existe el pedido con id ${id}`);
  
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el pedido con id ${id}`);
  
  return true;
}

module.exports = { listar, obtener, crear, actualizar, eliminar };