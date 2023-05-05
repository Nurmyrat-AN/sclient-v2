const { Router } = require("express");
const CustomersService = require("../../services/customers.service");
const ActionTypesService = require("../../services/action.types.service");
const mSettings = require("../../db/models/settings.model");
const mActionType = require("../../db/models/action-type.model");
const ActionsSevice = require("../../services/actions.service");
const mCurrency = require("../../db/models/cache/currency.model");
const mAction = require("../../db/models/action.model");
const CustomError = require("../../errors");

const actions = new Router()
actions.post('/datas', async (req, res, next) => {
    try {
        const customers = (await new CustomersService().getAll({ ids: req.body.customers, barcodes: req.body.barcodes, limit: req.body.customers.length || 1000 })).rows
        const actionTypes = (await new ActionTypesService().getAll({
            isGlobal: (await mSettings.count({ where: { _name: 'device-app-key', _value: req.cookies['device-app-key'] } })) <= 0 ? true : undefined
        })).rows
        let actionTypeId = req.body.actionTypeId
        if (!actionTypeId) {
            actionTypeId = (await mSettings.findOne({ where: { _name: 'default-action-type-id' }, }))?._value
        }

        let initialActionType = null
        if (actionTypeId) {
            initialActionType = await mActionType.findByPk(actionTypeId)
        }

        res.json({
            customers,
            actionTypes,
            initialActionType: initialActionType || actionTypes[0]
        })
    } catch (e) {
        next(e)
    }
})

actions.put('/', async (req, res, next) => {
    try {
        res.json(await new ActionsSevice().createActions({ ...req.body, owner: req.cookies['pc_name'] }))
    } catch (e) {
        next(e)
    }
})


actions.post('/', async (req, res, next) => {
    try {
        const mainCurrency = await mCurrency.findOne({ where: { main: true } })
        const actionTypes = (await new ActionTypesService().getAll({
            isGlobal: (await mSettings.count({ where: { _name: 'device-app-key', _value: req.cookies['device-app-key'] || null } })) <= 0 ? true : undefined
        })).rows

        const options = { where: new ActionsSevice().getAndArr(req.body), include: [{ association: 'customer', attributes: [] }, { association: 'actionType', attributes: [] }] }
        res.json({
            ...await new ActionsSevice().getAll({ ...req.body, ...(req.isAdmin ? {} : { owner: req.owner }) }),
            extras: {
                mainCurrency: mainCurrency.name,
                actionTypes,
                actionType: req.body.actionTypeId ? await mActionType.findByPk(req.body.actionTypeId) : null,
                amountSum: await mAction.sum('amount', options),
                resSum: await mAction.sum('res', options),
                aishSum: await mAction.sum('aish_balance', options),
            }
        })
    } catch (e) {
        next(e)
    }
})

actions.post('/reports', async (req, res, next) => {
    try {
        if (!req.isAdmin) throw CustomError.accessDeniedequest()

        res.json({
            ...await new ActionsSevice().getReports(req.body)
        })
    } catch (e) {
        next(e)
    }
})

module.exports = actions