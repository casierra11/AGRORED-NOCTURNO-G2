// =====================================================================
// Configuración de la aplicación Express.
// Aquí se registran los middlewares, las rutas y el manejo de errores.
// =====================================================================
const express = require('express');
// Importamos nuestro nuevo enrutador de lotes
const lotesRouter = require('./routes/lotes.routes');
const HttpError = require('./utils/http-error');

const app = express();

// Middleware para que Express entienda el formato JSON
app.use(express.json());

// Endpoint de prueba (Health check) requerido para la Semana 1
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Le decimos a la aplicación que dirija todas las peticiones /lotes a nuestro enrutador
app.use('/lotes', lotesRouter);

// Si el usuario pide una ruta que no existe en el menú, devolvemos 404
app.use((req, res, next) => {
  next(new HttpError(404, 'Ruta no encontrada'));
});

// Middleware final que atrapa los errores y los responde en formato JSON
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;