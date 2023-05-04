const { Router } = require("express");
const mSettings = require("../../db/models/settings.model");
const CustomError = require("../../errors");
const { Op } = require("sequelize");
const aishTransactionsService = require("../../services/transactions.service");
const aishService = require("../../services/aish.service");

const aish = new Router()

const isVallidBridgeKey = async (bridgeKey) => {
    const key = (await mSettings.findOne({ where: { _name: 'bridgeKey' } }))?._value
    if (key !== bridgeKey) {
        throw CustomError.badRequest({ message: 'Invalid bridge key', status: 403 })
    }
}

getSequenceDatas = async () => {
    const settings = (await mSettings.findAll({ where: { _name: { [Op.in]: ['_host_url', '_request_interval', '_transaction_sequence_number', '_sequence_number'] } } })).reduce((res, s) => ({ ...res, [s._name]: s._value }), {})
    if (settings['_host_url'] === undefined) throw CustomError.badRequest({ message: 'Import settings not setted', status: 402 })
    const result = [{
        url: `${settings['_host_url']}/cachedobjects`,
        interval: parseInt(settings['_request_interval'] || '5000'),
        sequence_number: settings['_sequence_number'],
        isTransaction: false
    }]
    if (settings['_transaction_sequence_number'] !== undefined) {
        result.push({
            url: `${settings['_host_url']}/transactions`,
            interval: parseInt(settings['_request_interval'] || '5000'),
            sequence_number: settings['_transaction_sequence_number'],
            isTransaction: true
        })
    }
    return result
}

aish.get('/upload', async (req, res, next) => {
    try {
        const { bridgeKey } = req.query
        await isVallidBridgeKey(bridgeKey)
        res.json(await getSequenceDatas())
    } catch (e) {
        next(e)
    }
})
aish.post('/upload', async (req, res, next) => {
    try {
        const { rows, bridgeKey, isTransaction } = req.body
        await isVallidBridgeKey(bridgeKey)
        if (isTransaction) {
            const sNumber = await mSettings.findOne({ where: { _name: '_transaction_sequence_number' } })
            if (!sNumber) throw CustomError.badRequest({ message: 'Access denied transactions', status: 403 })
            const _transaction_sequence_number = await aishTransactionsService.saveRows(rows)
            const _sNumberValue = parseInt(sNumber._value || '0')
            await sNumber.update({ _value: _sNumberValue > _transaction_sequence_number ? _sNumberValue : _transaction_sequence_number })
            const results = await getSequenceDatas()
            const result = results[1]
            if (result) {
                res.json(result)
            }
        } else {
            const sNumber = await mSettings.findOne({ where: { _name: '_sequence_number' } })
            if (!sNumber) throw CustomError.badRequest({ message: 'Access denied cachedobjects', status: 403 })
            const _sequence_number = await aishService.saveRows(rows)
            const _sNumberValue = parseInt(sNumber._value || '0')
            await sNumber.update({ _value: _sNumberValue > _sequence_number ? _sNumberValue : _sequence_number })
            const results = await getSequenceDatas()
            const result = results[0]
            res.json(result)
        }
    } catch (e) {
        next(e)
    }
})

module.exports = aish