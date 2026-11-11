// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const router = Router();
const controller = require('../controllers/lotes.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

// 1. TODAS las rutas exigen token válido (Casos 14, 15 y 16)
router.use(verificarToken);

// 2. Rutas de consulta (Lectura)
router.get('/', controller.obtenerTodos);
router.get('/:id', controller.obtenerPorId);

// 3. Rutas de modificación (Escritura restringida por rol: Casos 17 y 18)
router.post('/', requiereRol('administrador', 'produccion'), controller.crear);
router.put('/:id', requiereRol('administrador', 'produccion'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'produccion'), controller.eliminar);

module.exports = router;