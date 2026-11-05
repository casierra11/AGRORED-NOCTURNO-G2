// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const express = require('express');
const router = express.Router();
const controller = require('../controllers/lotes.controller');
const { verificarTokenAdmin } = require('../middlewares/auth.middleware'); // Importamos el guardia de seguridad

// Definición de los endpoints para la entidad Lotes

// Rutas PÚBLICAS (cualquiera puede consultar sin token)
router.get('/', controller.obtenerTodos);
router.get('/:id', controller.obtenerPorId);

// Rutas PROTEGIDAS (inyectamos el middleware antes del controlador)
router.post('/', verificarTokenAdmin, controller.crear);
router.put('/:id', verificarTokenAdmin, controller.actualizar);
router.delete('/:id', verificarTokenAdmin, controller.eliminar);

module.exports = router;