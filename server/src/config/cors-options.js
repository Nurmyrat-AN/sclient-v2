
const corsOptions = {
    origin: (origin, callback) => {
        callback(null, true)
        return true
    },
    optionsSuccessStatus: 200,
    maxAge: 50000,
    credentials: true,
    methods: ['PUT', 'POST', 'GET', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Origin',
        'device',
        'token',
    ],
    header: {
        'Content-Type': 'application/json, text/plain, text/html'
    }
}

module.exports = { corsOptions }