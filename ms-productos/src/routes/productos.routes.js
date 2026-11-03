const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

// Ruta /health pública para monitoreo de la arquitectura
router.get('/health', controller.health);

// Proteger todas las rutas REST con JWT
router.use(verificarToken);

// Consulta: cualquier rol autenticado (administrador, comercial, produccion)
router.get('/', controller.listar);
router.get('/:id', controller.obtener);

// Escritura: solo administrador y comercial (o producción según matriz de AgroRed)
router.post('/', requiereRol('administrador', 'comercial'), controller.crear);
router.put('/:id', requiereRol('administrador', 'comercial'), controller.actualizar);
router.delete('/:id', requiereRol('administrador'), controller.eliminar);

module.exports = router;