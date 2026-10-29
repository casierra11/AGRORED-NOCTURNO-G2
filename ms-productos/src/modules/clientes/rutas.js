const express = require('express');

const respuesta = require('../../red/respuestas');
const controller = require('./controller');

const router = express.Router();

router.get('/health', health);
router.get('/', todos);
router.get('/:nombre', one);
router.post('/', add);
router.delete('/:nombre', eliminar);

async function todos (req, res, next){
    try {
        const items = await controller.all();
        respuesta.success(req, res, items, 200); 
    } catch (error) {
        next(error);
    }
    
};

async function one(req, res, next) {
    try {
        const items = await controller.one(req.params.nombre);

        if (!items) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        respuesta.success(req, res, items, 200);
    } catch (error) {
        next(error);
    }
}


async function add(req, res, next) {
    try {
        const items = await controller.add(req.body);

        const mensaje = req.body.id == 0 || req.body.id == null
            ? 'Producto guardado con éxito'
            : 'Producto actualizado con éxito';

        respuesta.success(req, res, {
            mensaje,
            data: items
        }, 201);

    } catch (error) {
            if (error.status === 400 || error.status === 409) {
                return res.status(error.status).json({
                    error: error.message
            });
        }

        next(error);
    }

    next(error);
}


async function eliminar(req, res, next) {
    try {
        await controller.eliminar(req.params.nombre);

        respuesta.success(
            req,
            res,
            'Producto eliminado correctamente',
            200
        );
    } catch (error) {
        if (error.status === 404) {
            return res.status(404).json({
                error: error.message
            });
        }

        next(error);
    }
}


async function health(req, res) {
    try {
        await controller.health();

        res.status(200).json({
            status: 'ok',
            message: 'API y base de datos funcionando'
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'La base de datos no está disponible'
        });
    }
}


module.exports = router;