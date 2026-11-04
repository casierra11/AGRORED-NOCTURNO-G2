const express = require('express');
const morgan = require('morgan');
const productosRoutes = require('./routes/productos.routes');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

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