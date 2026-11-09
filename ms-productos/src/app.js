const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // 1. Importamos cors
const path = require('path'); // Módulo nativo de Node
const productosRoutes = require('./routes/productos.routes');

const app = express();

app.use(cors()); // 2. Habilitamos cors
app.use(morgan('dev'));
app.use(express.json());

// 3. Servimos la carpeta public que creaste en la raíz del proyecto
app.use(express.static(path.join(__dirname, '../public')));

app.use('/productos', productosRoutes);

// Middleware global de manejo de errores estandarizado (400, 404, 409, 500)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const response = { error: err.message || 'Error interno del servidor' };

  if (err.detalles && err.detalles.length > 0) {
    response.detalles = err.detalles;
  }

  res.status(status).json(response);
});

module.exports = app;