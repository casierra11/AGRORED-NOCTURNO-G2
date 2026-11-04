const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), // <- Corregido a 'Number' en minúscula
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dateStrings: true, // para que las fechas se devuelvan como strings y no como objetos Date
    decimalNumbers: true, // para que los números decimales se devuelvan como números y no como strings
});

module.exports = pool;