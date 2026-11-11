// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const router = Router();
const controller = require('../controllers/clientes.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth'); // Importamos el middleware de seguridad

// Definición de los endpoints para la entidad Clientes

// 1. Exigir token obligatorio a TODAS las rutas que estén debajo de esta línea
router.use(verificarToken);

// 2. Rutas de consulta (Cualquier usuario autenticado con token válido puede ver)
router.get('/', controller.listar);
router.get('/:id', controller.obtener);

// 3. Rutas de escritura protegidas por rol (exigen token + rol autorizado)
router.post('/', requiereRol('administrador', 'comercial'), controller.crear);
router.put('/:id', requiereRol('administrador', 'comercial'), controller.actualizar);
router.delete('/:id', requiereRol('administrador'), controller.eliminar);

module.exports = router;