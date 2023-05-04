require('dotenv').config()
const axios = require('axios')

const host = process.env.host
const bridgeKey = process.env.bridgeKey

const upload = async (props) => {
    const { rows, isTransaction, interval } = props
    try {
        const { data } = await axios.post(host, { rows, bridgeKey, isTransaction })
        if (rows.length > 0) {
            setTimeout(() => download(data), 3000)
        } else {
            setTimeout(() => download(data), interval)
        }
    } catch (e) {
        if (e.response?.status !== 403) {
            setTimeout(() => upload(props), 5000)
        } else setTimeout(start, 5000)
    }
}

const download = async (props) => {
    const { url, sequence_number = 0, interval = 5000, isTransaction } = props
    try {
        const { data: rows } = await axios.get(`${url}?since=${sequence_number}`)
        await upload({ rows, isTransaction, interval })
    } catch (e) {
        setTimeout(() => download(props), interval)
    }
}

const start = async () => {
    try {
        const { data } = await axios.get(`${host}?bridgeKey=${bridgeKey}`)
        const filtered = data.filter(d => d.sequence_number !== undefined)
        filtered.map(d => download(d))
        if (filtered.length === 0) {
            setTimeout(start, 5000)
        }
    } catch (e) {
        setTimeout(start, 30000)
    }
}

start()