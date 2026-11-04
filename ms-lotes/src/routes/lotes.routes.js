// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const express = require('express');
const router = express.Router();
const controller = require('../controllers/lotes.controller');

// Definición de los endpoints para la entidad Lotes
router.get('/', controller.obtenerTodos);
router.get('/:id', controller.obtenerPorId);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;