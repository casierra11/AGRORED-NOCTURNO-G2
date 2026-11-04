// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio Lotes)
// =====================================================================

const lotes = [
  { id: 1, codigo_lote: 'LOT-1001', producto_id: 10, fecha_produccion: '2026-10-25', cantidad: 500, resultado_calidad: 'aprobado' },
  { id: 2, codigo_lote: 'LOT-1002', producto_id: 15, fecha_produccion: '2026-10-26', cantidad: 350, resultado_calidad: 'pendiente' },
  { id: 3, codigo_lote: 'LOT-1003', producto_id: 22, fecha_produccion: '2026-10-27', cantidad: 120, resultado_calidad: 'rechazado' }
];
let siguienteId = 4;

async function findAll(filtros = {}) {
  let resultado = lotes;
  
  // Si viene un filtro por estado de cultivo, filtramos el arreglo
  if (filtros.estado_cultivo) {
    resultado = resultado.filter((l) => l.estado_cultivo === filtros.estado_cultivo);
  }
  return resultado;
}

async function findById(id) {
  return lotes.find((l) => l.id === id) || null;
}

async function findByCodigoLote(codigo) {
  return lotes.find((l) => l.codigo_lote === codigo) || null;
}

async function create(lote) {
  const nuevo = { id: siguienteId++, ...lote };
  lotes.push(nuevo);
  return nuevo;
}

async function update(id, datos) {
  const index = lotes.findIndex((l) => l.id === id);
  if (index === -1) return null; // No existe
  
  lotes[index] = { ...lotes[index], ...datos, id };
  return lotes[index];
}

async function remove(id) {
  const index = lotes.findIndex((l) => l.id === id);
  if (index === -1) return false; // No existe
  
  lotes.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, findByCodigoLote, create, update, remove };