const { Router } = require("express");
const __cookieConfig = require("../../config/cookie-config");

const devices = new Router()

devices.get('/verify', (req, res) => {
    res.json({ pc_name: req.owner, isAdmin: req.isAdmin })
})


devices.put('/cookies', (req, res, next) => {
    try {
        res.cookie(req.body._key, req.body._value, __cookieConfig).json({ status: 'SUCCESS', message: 'Cookie is successfully saved' })
    } catch (e) {
        next(e)
    }
})

module.exports = devices