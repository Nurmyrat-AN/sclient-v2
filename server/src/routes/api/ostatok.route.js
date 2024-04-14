const { Router } = require("express");
const { BelongsTo, Op } = require("sequelize");
const mCurrency = require("../../db/models/cache/currency.model");
const mMeasure = require("../../db/models/cache/measure.model");
const mProduct = require("../../db/models/cache/product.model");
const SettingsService = require("../../services/settings.service");
const { default: axios } = require("axios")

const ostatok = new Router()
ostatok.get('/', async (req, res, next) => {
    try {
        const HOST = await new SettingsService().get_host_url()
        const { data: result } = await axios.get(`${HOST}/stocksofproducts`)

        const data = await mProduct.findAndCountAll({
            where: {
                [Op.or]: [{
                    _id: { [Op.in]: result.map(r => r.product_id) }
                }, {
                    _isactive: true
                }]
            },
            include: [{
                association: new BelongsTo(mProduct, mCurrency, { as: 'product_currency', foreignKey: 'currency', targetKey: '_id' }),
                // attributes: [],
            }, {
                association: new BelongsTo(mProduct, mMeasure, { as: 'product_measure', foreignKey: 'measure', targetKey: '_id' }),
                // attributes: [],

            }],
            // limit: 1
        })
        // console.log(result)
        res.send({
            count: data.count, products: data.rows.map(r => ({
                ...r.toJSON(),
                currency: r.product_currency,
                measure: r.product_measure,
                stock: result.find(p => p.product_id === r._id)?.stock_in_main_measure || 0
            }))
        })
    } catch (e) {
        next(e)
    }
})

module.exports = ostatok