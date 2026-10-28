const express = require('express');

const respuesta = require('../../red/respuestas');
const controller = require('./controller');

const router = express.Router();

router.get('/', todos);
router.get('/:id', one);
router.post('/', add);
router.delete('/', eliminar);

async function todos (req, res, next){
    try {
        const items = await controller.all();
        respuesta.success(req, res, items, 200); 
    } catch (error) {
        next(error);
    }
    
};

async function one (req, res, next){
    try {
        const items = await controller.one(req.params.id);
        respuesta.success(req, res, items, 200); 
    } catch (error) {
        next(error);
    }
    
};


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
        if (error.status === 409) {
            return res.status(409).json({
                error: error.message
        });
    }

    next(error);
}
}


async function eliminar (req, res, next){
    try {
        const items = await controller.eliminar(req.body);
        respuesta.success(req, res, 'item eliminado satisfactoriamente', 200); 
    } catch (error) {
        next(err);
    }
    
};

module.exports = router;