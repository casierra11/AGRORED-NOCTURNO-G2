const express = require('express');
const morgan = require('morgan');
const config = require('./config');

const productos = require('./modules/clientes/rutas.js');
const error = require('./red/errors.js');

const app = express();

//Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//Configuración
app.set('port', config.app.port);

//Rutas
app.use('/api/productos', productos)
app.use(error);

module.exports = app;