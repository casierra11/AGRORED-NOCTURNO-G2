// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) - ms-clientes
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
// src/repositories/clientes.repository.js — versión MySQL para ms-clientes
const pool = require('../db');

async function findAll(filtros = {}) {
    let sql = 'SELECT * FROM clientes';
    const condiciones = [];
    const valores = [];

    if (filtros.ciudad) {
        condiciones.push('ciudad = ?');
        valores.push(filtros.ciudad);
    }
    if (filtros.tipo) {
        condiciones.push('tipo = ?');
        valores.push(filtros.tipo);
    }
    if (filtros.ids) { // ?ids=1,2,3 → WHERE id IN (1, 2, 3)
        condiciones.push('id IN (?)');
        valores.push(filtros.ids);
    }

    if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
    
    const [filas] = await pool.query(sql + ' ORDER BY id', valores);
    return filas;
}

async function findById(id) {
    const [filas] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
    return filas.length > 0 ? filas[0] : null;
}

async function create(cliente) {
    const [resultado] = await pool.query(
        'INSERT INTO clientes (nombre, nit, ciudad, telefono, tipo) VALUES (?, ?, ?, ?, ?)',
        [cliente.nombre, cliente.nit, cliente.ciudad, cliente.telefono, cliente.tipo]
    );
    return findById(resultado.insertId);
}

// NUEVA: Función para buscar por NIT (necesaria para el registro)
async function findByNit(nit) {
    const [filas] = await pool.query('SELECT * FROM clientes WHERE nit = ?', [nit]);
    return filas.length > 0 ? filas[0] : null;
}


// actualiza un cliente existente
async function update(id, cliente) {
    const [resultado] = await pool.query(
        'UPDATE clientes SET nombre = ?, nit = ?, ciudad = ?, telefono = ?, tipo = ? WHERE id = ?',
        [cliente.nombre, cliente.nit, cliente.ciudad, cliente.telefono, cliente.tipo, id]
    );
    if (resultado.affectedRows === 0) return null;
    return findById(id);
}
//nueva funcion para eliminar un cliente existente
async function remove(id) {
    const clienteExistente = await findById(id);
    if (!clienteExistente) return null;

    const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
    return resultado.affectedRows > 0 ? clienteExistente : null;
}

module.exports = {
    findAll,
    findById,
    create,
    findByNit,
    
    update,
    remove
};