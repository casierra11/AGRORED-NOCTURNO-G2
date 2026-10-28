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

function add(tabla, data){
    if(data && data.id == 0){
        return insertar(tabla, data);
    }else{
        return actualizar(tabla, data);
    }
}

function eliminar(tabla, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, data.id, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

module.exports = {all, one, add, eliminar,}