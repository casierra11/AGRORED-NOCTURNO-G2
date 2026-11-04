// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1 y adaptación inicial del Taller 2 (en memoria).
// =====================================================================
const pedidos = [
  { id: 1, cliente_id: 1, producto_id: 2, cantidad: 50, centro_distribucion: 'Cali', estado: 'recibido', fecha: '2026-10-25' },
  { id: 2, cliente_id: 2, producto_id: 1, cantidad: 120, centro_distribucion: 'Bogotá', estado: 'despachado', fecha: '2026-10-26' },
  { id: 3, cliente_id: 3, producto_id: 3, cantidad: 80, centro_distribucion: 'Cali', estado: 'entregado', fecha: '2026-10-24' },
];
let siguienteId = 4;

// 1. Listar con soporte de filtros (por centro de distribución y por lotes con ?ids=)
async function findAll(filtros = {}) {
  let resultado = pedidos;

  if (filtros.centro_distribucion) {
    resultado = resultado.filter((p) => p.centro_distribucion === filtros.centro_distribucion);
  }

  if (filtros.ids && filtros.ids.length > 0) {
    resultado = resultado.filter((p) => filtros.ids.includes(p.id));
  }

  return resultado;
}

async function findById(id) {
  return pedidos.find((p) => p.id === Number(id)) || null;
}

async function create(pedido) {
  const nuevo = { id: siguienteId++, ...pedido };
  pedidos.push(nuevo);
  return nuevo;
}

// 2. Función para actualizar (PUT) en memoria
async function update(id, datosNuevos) {
  const index = pedidos.findIndex((p) => p.id === Number(id));
  if (index === -1) {
    return null; // No existe el pedido
  }
  // Mantiene el id original y actualiza el resto de los campos
  pedidos[index] = { ...pedidos[index], ...datosNuevos, id: Number(id) };
  return pedidos[index];
}

// 3. Función para eliminar (DELETE) en memoria
async function remove(id) {
  const index = pedidos.findIndex((p) => p.id === Number(id));
  if (index === -1) {
    return false; // No existe el pedido
  }
  pedidos.splice(index, 1);
  return true;
}

module.exports = { 
  findAll, 
  findById, 
  create, 
  update, 
  remove 
};