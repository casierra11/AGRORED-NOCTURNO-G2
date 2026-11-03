const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM productos';
  const condiciones = [];
  const valores = [];

  // Filtro por categoría (Atributo elegido)
  if (filtros.categoria) {
    condiciones.push('categoria = ?');
    valores.push(filtros.categoria);
  }

  // Consulta por lotes ?ids=1,3,8 (Exigido para microservicios consultados)
  if (filtros.ids && filtros.ids.length > 0) {
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }

  sql += ' ORDER BY id';

  const [filas] = await pool.query(sql, valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByNombre(nombre) {
  const [filas] = await pool.query('SELECT * FROM productos WHERE LOWER(nombre) = LOWER(?)', [nombre]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(producto) {
  const [resultado] = await pool.query(
    'INSERT INTO productos (nombre, categoria, unidad, precio) VALUES (?, ?, ?, ?)',
    [producto.nombre, producto.categoria, producto.unidad, producto.precio]
  );
  return findById(resultado.insertId);
}

async function update(id, producto) {
  const [resultado] = await pool.query(
    'UPDATE productos SET nombre = ?, categoria = ?, unidad = ?, precio = ? WHERE id = ?',
    [producto.nombre, producto.categoria, producto.unidad, producto.precio, id]
  );
  if (resultado.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByNombre,
  create,
  update,
  remove,
};