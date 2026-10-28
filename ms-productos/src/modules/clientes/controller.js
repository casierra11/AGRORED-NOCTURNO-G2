const db = require('../../DB/mysql.js');

const TABLA = 'productos';

function all(){
    return db.all(TABLA);
}

function one(id){
    return db.one(TABLA, id);
}

function add(body){
    return db.add(TABLA, body);
}

function eliminar(body){
    return db.eliminar(TABLA, body);
}

module.exports= {all, one, add, eliminar};