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

function one(tabla, id){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT * FROM ${tabla} WHERE id=${id}`, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
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
        throw new Error('No se recibieron datos');
    }

    const esNuevo = data.id == null || data.id == 0;

    // Validar el nombre tanto al crear como al actualizar
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



function eliminar(tabla, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, data.id, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
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

module.exports = {all, one, add, eliminar, insert, update, existeProducto}