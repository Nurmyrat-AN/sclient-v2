const mSettings = require("../db/models/settings.model")

const authMiddleware = async (req, res, next) => {
    try {
        req.owner = req.cookies['pc_name']
        const password = await mSettings.findOne({ where: { _name: 'device-app-key' } })
        req.isAdmin = password?._value === req.cookies['device-app-key']
        next()
    } catch (e) {
        next(e)
    }
}


module.exports = authMiddleware