const { Router } = require("express");
const mSettings = require("../../db/models/settings.model");
const mActionType = require("../../db/models/action-type.model");
const aishTransactionsService = require("../../services/transactions.service");
const aishService = require("../../services/aish.service");
const CustomError = require("../../errors");
const mCustomer = require("../../db/models/customer.model");

const settings = new Router()

settings.post('/', async (req, res, next) => {
    try {
        if (!req.isAdmin) throw CustomError.accessDeniedequest()

        const settings = (await mSettings.findAll()).reduce((res, s) => ({ ...res, [s._name]: s._value }), {})
        
        res.json({
            count: 0,
            rows: 0,
            extras: {
                settings,
                actionTypes: await mActionType.findAll({ where: { isGlobal: true } }),
                customers: await mCustomer.findAll({ where: { _id: settings['compare-customer-id'] || '???' } })
            }
        })
    } catch (e) {
        next(e)
    }
})

settings.put('/', async (req, res, next) => {
    try {
        if (!req.isAdmin) throw CustomError.accessDeniedequest()

        const s = await mSettings.findOrCreate({ where: { _name: req.body._key } })
        if (req.body.delete) {
            await s[0].destroy()
        } else {
            await s[0].update({ _value: req.body._value })
        }
        if (req.body._key === '_transaction_sequence_number') aishTransactionsService.start()
        if (req.body._key === '_sequence_number') aishService.start()
        if (req.body._key === 'bridgeKey' || req.body._key === '_host_url') {
            aishTransactionsService.start()
            aishService.start()
        }
        res.json({})
    } catch (e) {
        next(e)
    }
})

module.exports = settings