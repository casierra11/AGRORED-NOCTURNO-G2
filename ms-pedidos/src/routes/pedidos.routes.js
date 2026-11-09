// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/pedidos.controller');
const { verificarToken, requiereRol } = require('../middleware/auth');

const router = Router();

// Rutas de consulta (Exigen token JWT válido de cualquier usuario autenticado)
router.get('/', verificarToken, controller.listar);      // listar todos los pedidos
router.get('/:id', verificarToken, controller.obtener);  // obtener un pedido por id

// Rutas de modificación (Exigen token Y pertenecer a los roles autorizados en AgroRed)
router.post('/', verificarToken, requiereRol('administrador', 'comercial'), controller.crear);      // crear un pedido
router.put('/:id', verificarToken, requiereRol('administrador', 'comercial'), controller.actualizar);  // actualizar un pedido
router.delete('/:id', verificarToken, requiereRol('administrador', 'comercial'), controller.eliminar); // eliminar un pedido

module.exports = router;