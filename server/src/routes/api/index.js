const { Router } = require("express");
const customers = require("./customers.route");
const actionTypes = require("./action.types.route");
const customerGroups = require("./customer-groups.route");
const actions = require("./actions.route");
const settings = require("./settings.route");
const aish = require("./aish.route");
const devices = require("./devices.route");

const api = Router()

api.use('/action-types', actionTypes)
api.use('/actions', actions)
api.use('/aish', aish)
api.use('/customer-groups', customerGroups)
api.use('/customers', customers)
api.use('/devices', devices)
api.use('/settings', settings)

module.exports = api