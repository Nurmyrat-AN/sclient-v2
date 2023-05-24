const { Router } = require("express");
const AutomaticTransactionsService = require("../../../services/automatictransactions.service");

const automatictransactions = new Router()

automatictransactions.post('/', async (req, res, next) => {
    try {
        res.json(await new AutomaticTransactionsService(req.actionTypeId).getAll({}))
    } catch (e) {
        next(e)
    }
})

automatictransactions.put('/', async (req, res, next) => {
    try {
        const service = new AutomaticTransactionsService(req.actionTypeId)
        const task = req.body.id ? service.update(req.body) : service.create(req.body)
        res.json(await task)
    } catch (e) {
        next(e)
    }
})



automatictransactions.delete('/:id', async (req, res, next) => {
    try {
        res.json(await new AutomaticTransactionsService(req.actionTypeId).delete(req.params.id))
    } catch (e) {
        next(e)
    }
})

module.exports = automatictransactions