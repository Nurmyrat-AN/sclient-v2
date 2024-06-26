const mSettings = require("../db/models/settings.model")
const sequelize = require("../db/config")
const CustomError = require("../errors")

const authMiddleware = async (req, res, next) => {
    try {
        try {
            await sequelize.authenticate()
        } catch (e) {
            console.log(e)
        }
        if (req._parsedUrl.pathname.indexOf('/api/ostatok') === 0 || req._parsedUrl.pathname.indexOf('/api/aish/products') === 0) {
            return next()
        }

        req.owner = req.cookies['pc_name']
        const mainPassword = await mSettings.findOne({ where: { _name: 'main-app-key' } })
        req.hasAccessToApp = mainPassword?._value === req.cookies['main-app-key']
        if (
            req._parsedUrl.pathname.indexOf('/api/devices/') !== 0 &&
            req._parsedUrl.pathname.indexOf('/api/aish/') !== 0 &&
            req._parsedUrl.pathname.indexOf('/api/getSendableMessages') !== 0 &&
            req._parsedUrl.pathname.indexOf('/api') === 0 &&
            !req.hasAccessToApp
        ) throw CustomError.badRequest({ status: 403, message: 'Access denied!' })
        const password = await mSettings.findOne({ where: { _name: 'device-app-key' } })
        req.isAdmin = password?._value === req.cookies['device-app-key']
        next()

    } catch (e) {
        next(e)
    }
}


module.exports = authMiddleware
