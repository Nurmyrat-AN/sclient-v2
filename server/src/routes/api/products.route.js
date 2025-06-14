const { Router } = require("express");
const { Op } = require("sequelize");
const mProduct = require("../../db/models/cache/product.model");

const products = new Router()

products.post('/', async (req, res, next) => {
    try {
        const {name = '', limit = 10, offset = 0} = req.body
        const where= {name: { [Op.like]: `%${name}%` } }

        res.json({
            count: await mProduct.count({where}),
            rows: await  mProduct.findAll({where, offset: offset, limit: limit, order: ['name'], logging: true})
        })
    } catch (e) {
         next(e)
    }
})


module.exports = products