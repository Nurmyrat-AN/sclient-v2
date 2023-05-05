const { Router } = require("express");
const customers = require("./customers.route");
const actionTypes = require("./action.types.route");
const customerGroups = require("./customer-groups.route");
const actions = require("./actions.route");
const settings = require("./settings.route");
const aish = require("./aish.route");
const devices = require("./devices.route");
const messageService = require("../../services/message.service");
const zipService = require("../../services/zip.service");

const api = Router()

api.use('/action-types', actionTypes)
api.use('/actions', actions)
api.use('/aish', aish)
api.use('/customer-groups', customerGroups)
api.use('/customers', customers)
api.use('/devices', devices)
api.use('/settings', settings)

api.get('/getSendableMessages', async (req, res, next) => {
    try {
        return res.send(await zipService.zip({ data: await messageService.getSendableMassages() }))
        res.status(404).json()
    } catch (e) {
        next(e)
    }
})

module.exports = api