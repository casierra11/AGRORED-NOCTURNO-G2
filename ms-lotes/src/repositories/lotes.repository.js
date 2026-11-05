// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio Lotes con MySQL)
// =====================================================================
const db = require('../db'); // Importamos la conexión a la base de datos

async function findAll(filtros = {}) {
  let query = 'SELECT * FROM lotes';
  const values = [];

  // Usamos resultado_calidad porque es una columna que existe en tu tabla
  if (filtros.resultado_calidad) {
    query += ' WHERE resultado_calidad = ?';
    values.push(filtros.resultado_calidad);
  }

  // db.execute devuelve un arreglo donde la primera posición son las filas (rows)
  const [rows] = await db.execute(query, values);
  return rows;
}

async function findById(id) {
  const [rows] = await db.execute('SELECT * FROM lotes WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
}

async function findByCodigoLote(codigo) {
  const [rows] = await db.execute('SELECT * FROM lotes WHERE codigo_lote = ?', [codigo]);
  return rows.length > 0 ? rows[0] : null;
}

async function create(lote) {
  const query = `
    INSERT INTO lotes (codigo_lote, producto_id, fecha_produccion, cantidad, resultado_calidad) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    lote.codigo_lote,
    lote.producto_id,
    lote.fecha_produccion,
    lote.cantidad,
    lote.resultado_calidad
  ];

  // Ejecutamos el INSERT
  const [result] = await db.execute(query, values);

  // Usamos el insertId generado por MySQL para buscar y retornar el lote recién creado
  return await findById(result.insertId);
}

async function update(id, datos) {
  const query = `
    UPDATE lotes 
    SET codigo_lote = ?, producto_id = ?, fecha_produccion = ?, cantidad = ?, resultado_calidad = ? 
    WHERE id = ?
  `;
  const values = [
    datos.codigo_lote,
    datos.producto_id,
    datos.fecha_produccion,
    datos.cantidad,
    datos.resultado_calidad,
    id
  ];

  const [result] = await db.execute(query, values);

  // affectedRows indica cuántas filas se modificaron. Si es 0, el ID no existía.
  if (result.affectedRows === 0) return null;

  // Retornamos el lote actualizado
  return await findById(id);
}

async function remove(id) {
  const [result] = await db.execute('DELETE FROM lotes WHERE id = ?', [id]);
  // Retorna true si logró borrar la fila, false si no
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByCodigoLote, create, update, remove };