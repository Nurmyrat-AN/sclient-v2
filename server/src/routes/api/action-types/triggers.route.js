const { Router } = require("express");
const TriggersService = require("../../../services/triggers.service");

const triggers = new Router()

triggers.post('/', async (req, res, next) => {
    try {
        res.json(await new TriggersService(req.actionTypeId).getAll())
    } catch (e) {
        next(e)
    }
})

triggers.put('/', async (req, res, next) => {
    try {
        const service = new TriggersService(req.actionTypeId)
        const task = req.body.id ? service.update(req.body) : service.create(req.body)
        res.json(await task)
    } catch (e) {
        next(e)
    }
})



triggers.delete('/:id', async (req, res, next) => {
    try {
        res.json(await new TriggersService(req.actionTypeId).delete(req.params.id))
    } catch (e) {
        next(e)
    }
})


triggers.post('/testcalculation', async (req, res, next) => {
    try {
        res.json(new TriggersService(0).actionCalculate(req.body))
    } catch (e) {
        next(e)
    }
})

module.exports = triggers