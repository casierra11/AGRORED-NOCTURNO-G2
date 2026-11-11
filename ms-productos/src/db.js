const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'productos_db',
  user: process.env.DB_USER || 'productos_user',
  password: process.env.DB_PASSWORD ?? '',
  dateStrings: true,
  decimalNumbers: true,
});

module.exports = pool;