const { Router } = require("express");
const CustomerGroups = require("../../services/customer-groups.service");
const CustomError = require("../../errors");

const customerGroups = new Router()
customerGroups.post('/', async (req, res, next) => {
    try {
        res.json(await new CustomerGroups().getAll(req.body))
    } catch (e) {
        next(e)
    }
})

customerGroups.put('/', async (req, res, next) => {
    try {
        if (!req.isAdmin) throw CustomError.accessDeniedequest()
        
        const task = req.body.id ? new CustomerGroups().update(req.body) : new CustomerGroups().create(req.body)
        res.json(await task)
    } catch (e) {
        next(e)
    }
})

customerGroups.delete('/:id', async (req, res, next) => {
    try {
        if (!req.isAdmin) throw CustomError.accessDeniedequest()
        
        res.json(await new CustomerGroups().delete(req.params.id))
    } catch (e) {
        next(e)
    }
})

customerGroups.put('/customers', async (req, res, next) => {
    try {
        if (!req.isAdmin) throw CustomError.accessDeniedequest()
        
        res.json(await new CustomerGroups().addCustomer(req.body))
    } catch (e) {
        next(e)
    }
})

module.exports = customerGroups