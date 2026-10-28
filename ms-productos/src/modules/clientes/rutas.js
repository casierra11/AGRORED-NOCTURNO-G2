const express = require('express');

const respuesta = require('../../red/respuestas');
const controller = require('./controller');

const router = express.Router();

router.get('/', todos);
router.get('/:id', one);
router.post('/', add);
router.put('/', eliminar);

async function todos (req, res, next){
    try {
        const items = await controller.all();
        respuesta.success(req, res, items, 200); 
    } catch (error) {
        next(err);
    }
    
};

async function one (req, res, next){
    try {
        const items = await controller.one(req.params.id);
        respuesta.success(req, res, items, 200); 
    } catch (error) {
        next(err);
    }
    
};

async function add (req, res, next){
    try {
        const items = await controller.eliminar(req.body);
        if(req.body.id == 0){
            mensaje = 'Item guardado con exito';
        }else{
            mensaje = 'Item actualizado con exito';
        }
        respuesta.success(req, res, 'item eliminado satisfactoriamente', 201); 
    } catch (error) {
        next(err);
    }
    
};

async function eliminar (req, res, next){
    try {
        const items = await controller.eliminar(req.body);
        respuesta.success(req, res, 'item eliminado satisfactoriamente', 200); 
    } catch (error) {
        next(err);
    }
    
};

module.exports = router;