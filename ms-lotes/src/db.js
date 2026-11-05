// src/db.js
const mysql = require('mysql2/promise');

// Creamos un pool de conexiones usando las variables del .env
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Configuraciones recomendadas por la docente
  dateStrings: true, 
  decimalNumbers: true, 
});

module.exports = pool;