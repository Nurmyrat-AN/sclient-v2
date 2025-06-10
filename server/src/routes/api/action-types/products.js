const { Router } = require("express");
const { Op, Sequelize } = require("sequelize");
const mActionType = require("../../../db/models/action-type.model");
const mProduct = require("../../../db/models/cache/product.model");
const TriggersService = require("../../../services/triggers.service");

const products = new Router()

products.post('/', async (req, res, next) => {
    try {
        const where = { id: { [Op.in]: Sequelize.literal(`(SELECT ProductId FROM zzz_action_type_excepted_products WHERE actionTypeId=${req.actionTypeId})`) } }
        res.json(await mProduct.findAndCountAll({ where }))
    } catch (e) {
        next(e)
    }
})

products.put('/:id', async (req, res, next) => {
    try {
        const aType = await mActionType.findByPk(req.actionTypeId)
        const pModel = await mProduct.findByPk(req.params.id)
        if (!aType || !pModel) {
            throw "Object not found"
        }
        await aType.addExceptedProducts(pModel)
        res.json({})
    } catch (e) {
        next(e)
    }
})


products.delete('/:id', async (req, res, next) => {
    try {
        const aType = await mActionType.findByPk(req.actionTypeId)
        const pModel = await mProduct.findByPk(req.params.id)
        if (!aType || !pModel) {
            throw "Object not found"
        }
        await aType.removeExceptedProducts(pModel)
        res.json({})
    } catch (e) {
        next(e)
    }
})



products.delete('/:id', async (req, res, next) => {
    try {
        // res.json(await new TriggersService(req.actionTypeId || 0).delete(req.params.id))
    } catch (e) {
        next(e)
    }
})


products.post('/testcalculation', async (req, res, next) => {
    try {
        res.json(new TriggersService(0).actionCalculate(req.body))
    } catch (e) {
        next(e)
    }
})

module.exports = products