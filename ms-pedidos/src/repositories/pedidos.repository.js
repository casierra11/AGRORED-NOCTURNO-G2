const pool = require('../db');

// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio con MySQL)
// Única capa que sabe DÓNDE se guardan los datos.
// =====================================================================

// 1. Listar con soporte de filtros (por centro de distribución y por ids con ?ids=)
async function findAll(filtros = {}) {
    let query = 'SELECT * FROM orders WHERE 1=1';
    let params = [];

    if (filtros.centro_distribucion) {
        query += ' AND centro_distribucion = ?';
        params.push(filtros.centro_distribucion);
    }

    if (filtros.ids && filtros.ids.length > 0) {
        query += ' AND id IN (?)';
        params.push(filtros.ids);
    }

    const [rows] = await pool.query(query, params);
    return rows;
}

// 2. Buscar por ID
async function findById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0] || null;
}

// 3. Crear un nuevo pedido
async function create(pedido) {
    const { cliente_id, producto_id, cantidad, centro_distribucion, estado, fecha } = pedido;
    const [result] = await pool.query(
        'INSERT INTO orders (cliente_id, producto_id, cantidad, centro_distribucion, estado, fecha) VALUES (?, ?, ?, ?, ?, ?)',
        [cliente_id, producto_id, cantidad, centro_distribucion, estado, fecha]
    );
    
    return {
        id: result.insertId,
        ...pedido
    };
}

// 4. Actualizar un pedido (PUT)
async function update(id, datosNuevos) {
    const pedidoExistente = await findById(id);
    if (!pedidoExistente) {
        return null; // No existe el pedido
    }

    // Combinamos los datos anteriores con los nuevos para asegurar que no se pierdan campos
    const cliente_id = datosNuevos.cliente_id !== undefined ? datosNuevos.cliente_id : pedidoExistente.cliente_id;
    const producto_id = datosNuevos.producto_id !== undefined ? datosNuevos.producto_id : pedidoExistente.producto_id;
    const cantidad = datosNuevos.cantidad !== undefined ? datosNuevos.cantidad : pedidoExistente.cantidad;
    const centro_distribucion = datosNuevos.centro_distribucion !== undefined ? datosNuevos.centro_distribucion : pedidoExistente.centro_distribucion;
    const estado = datosNuevos.estado !== undefined ? datosNuevos.estado : pedidoExistente.estado;
    const fecha = datosNuevos.fecha !== undefined ? datosNuevos.fecha : pedidoExistente.fecha;

    await pool.query(
        'UPDATE orders SET cliente_id = ?, producto_id = ?, cantidad = ?, centro_distribucion = ?, estado = ?, fecha = ? WHERE id = ?',
        [cliente_id, producto_id, cantidad, centro_distribucion, estado, fecha, Number(id)]
    );

    return await findById(id);
}

// 5. Eliminar un pedido (DELETE)
async function remove(id) {
    const pedido = await findById(id);
    if (!pedido) {
        return false; // No existe el pedido
    }
    await pool.query('DELETE FROM orders WHERE id = ?', [Number(id)]);
    return true;
}

module.exports = { 
    findAll, 
    findById, 
    create, 
    update, 
    remove 
};