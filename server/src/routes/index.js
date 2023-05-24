const { Router } = require("express");
const api = require("./api");

const appRoute = new Router()

appRoute.use('/api', api)

module.exports = appRoute