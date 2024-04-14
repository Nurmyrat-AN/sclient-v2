const { Router } = require("express");
const customers = require("./customers.route");
const actionTypes = require("./action-types/action.types.route");
const customerGroups = require("./customer-groups.route");
const actions = require("./actions.route");
const settings = require("./settings.route");
const aish = require("./aish.route");
const devices = require("./devices.route");
const messageService = require("../../services/message.service");
const zipService = require("../../services/zip.service");
const ActionsSevice = require("../../services/actions.service");
const ostatok = require("./ostatok.route");

const api = Router()

api.use('/action-types', actionTypes)
api.use('/actions', actions)
api.use('/aish', aish)
api.use('/customer-groups', customerGroups)
api.use('/customers', customers)
api.use('/devices', devices)
api.use('/settings', settings)
api.use('/ostatok', ostatok)

api.get('/getSendableMessages', async (req, res, next) => {
    try {
        return res.send(await zipService.zip({ data: await messageService.getSendableMassages({ actions: (await new ActionsSevice().getAll({ sendableMessages: true })).rows }) }))
    } catch (e) {
        next(e)
    }
})

module.exports = api