const AishService = require("../../services/aish.service");
const CustomersService = require("../../services/customers.service");
const { Router } = require("express");
const mCurrency = require("../../db/models/cache/currency.model");
const mCustomer = require("../../db/models/customer.model");
const mCustomerGroup = require("../../db/models/customer-group.model");
const mActionType = require("../../db/models/action-type.model");
const CustomError = require("../../errors");

const customers = new Router()

customers.post('/', async (req, res, next) => {
    try {
        const customersService = new CustomersService()
        if (req.query.ids) {
            return res.json(await customersService.getIDS(req.body))
        }
        const data = await customersService.getAll(req.body)
        const balance = await customersService.getSumOfBalances(req.body)
        const extras = {
            balance,
            directLinks: await mActionType.findAll({ where: { isMenuOption: true } })
        }
        if (req.body.groupId) {
            extras.group = await mCustomerGroup.findByPk(req.body.groupId)
        }
        res.json({
            ...data,
            extras
        })
    } catch (e) {
        next(e)
    }
})

customers.get('/:id/aish-balance', async (req, res, next) => {
    try {
        const { id } = req.params
        const customer = await mCustomer.findByPk(id)

        const aish_balance = await new CustomersService().getAishBalance(customer._id)
        const mainCurrency = (await mCurrency.findOne({ where: { main: true } }))?.name
        return res.send(`${aish_balance} ${mainCurrency}`)
    } catch (e) {
        next(e)
    }
})

customers.put('/:id/', async (req, res, next) => {
    try {
        if (!req.isAdmin) throw CustomError.accessDeniedequest()
        
        await new CustomersService().update({ ...req.body, id: req.params.id })
        res.json({ status: 'SUCCESS', message: 'Customer is successfully updated' })
    } catch (e) {
        next(e)
    }
})

module.exports = customers