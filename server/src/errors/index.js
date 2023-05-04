class CustomError {
    status = 200
    message = ''
    messageCode = 0

    constructor({ status, message, messageCode = 0 }) {
        this.status = status
        this.message = message
        this.messageCode = messageCode
    }

    static notFound = () => new CustomError({ status: 404, message: 'Not found!' })
    static badRequest = ({ status, message, messageCode }) => new CustomError({ status, message, messageCode })
}

module.exports = CustomError