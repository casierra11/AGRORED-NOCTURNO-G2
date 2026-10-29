//import { error } from '../red/respuestas';

const mysql = require('mysql')
const config = require('../config');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
}

let conexion;

function health() {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT 1', (error) => {
            if (error) return reject(error);
            resolve(true);
        });
    });
}

function conMysql(){
    conexion = mysql.createConnection(dbconfig);

    conexion.connect((err)=>{
        if(err){
            console.log('[db error]', err);
            setTimeout(conMysql, 200);
        }else{
            console.log('DB Conectada!! ')
        }
    });

    conexion.on('error', err => {
        console.log('[db error]', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            conMysql();
        }else{
            throw err;
        }
    })
}

conMysql();

function all(tabla){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

function one(tabla, nombre) {
    return new Promise((resolve, reject) => {
        conexion.query(
            `SELECT * FROM ${tabla} WHERE LOWER(nombre) = LOWER(?) LIMIT 1`,
            [nombre],
            (error, result) => {
                if (error) return reject(error);
                resolve(result[0] || null);
            }
        );
    });
}

function insert(tabla, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

function update(tabla, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`UPDATE ${tabla} SET ? WHERE id = ?`,[data, data.id] , (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}



async function add(tabla, data) {
    if (!data) {
        const error = new Error('No se recibieron datos');
        error.status = 400;
        throw error;
    }

    // Validar categoría y unidad antes de guardar
    validarProducto(data);

    const esNuevo = data.id == null || data.id == 0;

    if (data.nombre) {
        const existe = await existeProducto(
            data.nombre,
            esNuevo ? null : data.id
        );

        if (existe) {
            const error = new Error(
                'Ya existe un producto con ese nombre'
            );
            error.status = 409;
            throw error;
        }
    }

    if (esNuevo) {
        return insert(tabla, data);
    }

    return update(tabla, data);
}



function eliminar(tabla, nombre) {
    return new Promise((resolve, reject) => {
        conexion.query(
            `DELETE FROM ${tabla} WHERE LOWER(nombre) = LOWER(?) LIMIT 1`,
            [nombre],
            (error, result) => {
                if (error) return reject(error);

                if (result.affectedRows === 0) {
                    const err = new Error('Producto no encontrado');
                    err.status = 404;
                    return reject(err);
                }

                resolve(result);
            }
        );
    });
}

function existeProducto(nombre, idExcluir = null) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT id FROM productos WHERE nombre = ?';
        const params = [nombre];

        // Al actualizar, excluir el producto que estamos editando
        if (idExcluir !== null) {
            sql += ' AND id != ?';
            params.push(idExcluir);
        }

        conexion.query(sql, params, (error, resultado) => {
            if (error) return reject(error);
            resolve(resultado.length > 0);
        });
    });
}

function validarProducto(data) {
    const categoriasPermitidas = [
        'fruta',
        'hortaliza',
        'procesado'
    ];

    const unidadesPermitidas = [
        'kg',
        'caja'
    ];

    if (!categoriasPermitidas.includes(data.categoria)) {
        const error = new Error(
            'Categoría inválida. Valores permitidos: fruta, hortaliza, procesado'
        );
        error.status = 400;
        throw error;
    }

    if (!unidadesPermitidas.includes(data.unidad)) {
        const error = new Error(
            'Unidad inválida. Valores permitidos: kg, caja'
        );
        error.status = 400;
        throw error;
    }
}

module.exports = {health, all, one, add, eliminar, insert, update, existeProducto, validarProducto}