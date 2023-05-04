const { Router } = require("express");
const customers = require("./customers.route");
const actionTypes = require("./action.types.route");
const customerGroups = require("./customer-groups.route");
const actions = require("./actions.route");
const settings = require("./settings.route");
const aish = require("./aish.route");

const api = Router()

api.use('/aish', aish)
api.use('/settings', settings)
api.use('/actions', actions)
api.use('/customers', customers)
api.use('/action-types', actionTypes)
api.use('/customer-groups', customerGroups)

module.exports = api