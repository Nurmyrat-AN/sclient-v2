const { Router } = require("express");
const ActionTypesService = require("../../services/action.types.service");

const actionTypes = new Router()

actionTypes.post('/', async (req, res, next) => {
    try {
        res.json(await new ActionTypesService().getAll(req.body))
    } catch (e) {
        next(e)
    }
})

actionTypes.put('/', async (req, res, next) => {
    try {
        // if (req.body.id === 1) {
        //     throw new Error('Access denied')
        // }

        const task = req.body.id ? new ActionTypesService().update(req.body) : new ActionTypesService().create(req.body)
        res.json(await task)
    } catch (e) {
        next(e)
    }
})

actionTypes.delete('/:id', async (req, res, next) => {
    try {
        // if (req.params.id === 1) {
        //     throw new Error('Access denied')
        // }
        
        res.json(await new ActionTypesService().delete(req.params.id))
    } catch (e) {
        next(e)
    }
})

module.exports = actionTypes