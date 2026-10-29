const db = require('../../DB/mysql.js');

const TABLA = 'productos';

function all(){
    return db.all(TABLA);
}

function one(nombre){
    return db.one(TABLA, nombre);
}

function add(body){
    return db.add(TABLA, body);
}

function eliminar(nombre) {
    return db.eliminar(TABLA, nombre);
}

function health() {
    return db.health();
}

module.exports= {all, one, add, eliminar, health};