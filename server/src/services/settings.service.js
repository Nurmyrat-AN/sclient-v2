const mSettings = require("../db/models/settings.model")

class SettingsService {
    _host_url = 'http://127.0.0.1:5959/aish5/api/v1'

    set_host_url = async (_host_url) => {
        const _settings = (await mSettings.findOrCreate({ where: { _name: '_host_url' } }))[0]
        await _settings.update({ _value: _host_url || this._host_url })
    }

    get_host_url = async () => {
        const _settings = await mSettings.findOne({ where: { _name: '_host_url' } })
        return _settings?._value
    }

    set_sequence_number = async (_sequence_number = 0) => {
        const _settings = (await mSettings.findOrCreate({ where: { _name: '_sequence_number' } }))[0]
        await _settings.update({ _value: _sequence_number })
    }

    get_transaction_sequence_number = async () => {
        const _settings = await mSettings.findOne({ where: { _name: '_transaction_sequence_number' } })
        return _settings?._value || 0
    }

    set_transaction_sequence_number = async (_transaction_sequence_number = 0) => {
        const _settings = (await mSettings.findOrCreate({ where: { _name: '_transaction_sequence_number' } }))[0]
        await _settings.update({ _value: _transaction_sequence_number })
    }

    get_request_interval = async () => {
        const _settings = await mSettings.findOne({ where: { _name: '_request_interval' } })
        return _settings?._value || 10000
    }

    set_request_interval = async (_request_interval = 10000) => {
        const _settings = (await mSettings.findOrCreate({ where: { _name: '_request_interval' } }))[0]
        await _settings.update({ _value: _request_interval })
    }
}

module.exports = SettingsService