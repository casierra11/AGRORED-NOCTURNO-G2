// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/pedidos.controller');

const router = Router();

router.get('/', controller.listar);      // listar todos los pedidos
router.get('/:id', controller.obtener);  // obtener un pedido por id
router.post('/', controller.crear);      // crear un pedido

// Rutas agregadas para actualizar y eliminar
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;