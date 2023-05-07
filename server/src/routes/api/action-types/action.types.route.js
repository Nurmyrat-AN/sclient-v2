const { Router } = require("express");
const ActionTypesService = require("../../../services/action.types.service");
const CustomError = require("../../../errors");
const triggers = require("./triggers.route");

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
        if (!req.isAdmin) throw CustomError.accessDeniedequest()

        const task = req.body.id ? new ActionTypesService().update(req.body) : new ActionTypesService().create(req.body)
        res.json(await task)
    } catch (e) {
        next(e)
    }
})

actionTypes.delete('/:id', async (req, res, next) => {
    try {
        if (!req.isAdmin) throw CustomError.accessDeniedequest()

        res.json(await new ActionTypesService().delete(req.params.id))
    } catch (e) {
        next(e)
    }
})

actionTypes.use('/:actionTypeId([0-9]+)/triggers', (req, rex, next) => {
    req.actionTypeId = req.params.actionTypeId
    next()
})
actionTypes.use('/:actionTypeId([0-9]+)/triggers', triggers)

module.exports = actionTypes