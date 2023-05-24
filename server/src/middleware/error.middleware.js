const CustomError = require("../errors")

const errorMiddleware = async (err, req, res, next) => {
    console.log(err)
    if (err instanceof CustomError) {
        return res.status(err.status).json({ message: err.message, messageCode: err.messageCode })
    } else {
        return res.status(500).send(err.message)
    }
}

module.exports = errorMiddleware