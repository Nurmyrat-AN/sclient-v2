require('dotenv').config()

const logger = require('morgan');
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require('cors')
const path = require('path')
const { Server: io } = require('socket.io')
const http = require('http');

const { corsOptions } = require("./src/config/cors-options");
const errorMiddleware = require("./src/middleware/error.middleware");
const appRoute = require('./src/routes');
const initializeDB = require('./src/db/migrations');
const aishService = require('./src/services/aish.service');
const aishTransactionsService = require('./src/services/transactions.service');

async function start() {
    await initializeDB()

    const PORT = process.env.PORT || 3000

    const app = express()


    app.use(logger('dev'));

    app.use(cors(corsOptions))
    app.use(express.json({ limit: '50mb' }))
    app.use(cookieParser())

    app.use('/', appRoute)
    app.use(errorMiddleware)

    aishService.start()
    aishTransactionsService.start()

    const server = http.createServer(app)
    const socket = new io(server, {
        cors: corsOptions,
        cookie: true
    })

    server.listen(PORT, () => {
        console.log(`Node app is running on port ${PORT}`)
    })

    server.on('uncaughtException', err => {
        console.log('something terrible happened..', err)
    })

    socket.on('connection', socket => {
        console.log(`Connected user: ${socket.id}`)
    })
}

start()