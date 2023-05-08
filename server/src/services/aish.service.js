const { default: axios } = require("axios")
const SettingsService = require("./settings.service")
const mCustomer = require("../db/models/customer.model")
const mCurrency = require("../db/models/cache/currency.model")
const mCurrencyExchange = require("../db/models/cache/currency_exchange.model")
const mBook = require("../db/models/cache/book.model")
const mMeasure = require("../db/models/cache/measure.model")
const mProduct = require("../db/models/cache/product.model")
const mSettings = require("../db/models/settings.model")

class AishService {
    timer = null
    start = () => {
        if (this.timer) clearTimeout(this.timer)
        this.getData()
    }

    getData = async () => {
        const settingsService = new SettingsService()
        const host = await settingsService.get_host_url()
        if (!host) return;
        let _sequence_number = (await mSettings.findOne({ where: { _name: '_sequence_number' } }))?._value
        const bridge = (await mSettings.findOne({ where: { _name: 'bridgeKey' } }))?._value
        if (_sequence_number === undefined || bridge !== undefined) return;
        let _sequence_number_result = 0
        try {
            const { data: rows } = await axios.get(`${host}/cachedobjects?since=${_sequence_number}`)
            _sequence_number_result = await this.saveRows(rows)
            await settingsService.set_sequence_number(_sequence_number > _sequence_number_result ? _sequence_number : _sequence_number_result)
        } catch (e) {
            console.log('CACHING AISH:  ', e)
        }
        const _request_interval = await settingsService.get_request_interval()
        this.timer = setTimeout(this.getData, _sequence_number_result === 0 ? _request_interval : 300)
    }

    saveRows = async (rows) => {
        let _sequence_number = 0
        const rowsCopy = [...rows]
        while (rowsCopy.length) {
            const cachedobject = rowsCopy.shift()
            if (!cachedobject) continue;
            switch (cachedobject?.OBJECT_TYPE) {
                case 'customer':
                    const customer = await mCustomer.findOrCreate({ where: { _id: cachedobject._id } })
                    await customer[0].update({
                        _isactive: cachedobject._isactive === 'active',
                        _id: cachedobject._id,
                        barcodes: cachedobject.barcodes,
                        name: cachedobject.name,
                        phone_number: cachedobject.phone_number
                    })
                    break
                case 'currency':
                    const currency = await mCurrency.findOrCreate({ where: { _id: cachedobject._id } })
                    await currency[0].update({
                        name: cachedobject.name
                    })
                    break
                case 'currencyexchangerate':
                    const currencyFrom = await mCurrency.findOrCreate({ where: { _id: cachedobject.currency_from } })
                    const currencyTo = await mCurrency.findOrCreate({ where: { _id: cachedobject.currency_to } })

                    const exchangeRate = await mCurrencyExchange.findOrCreate({
                        where: {
                            currency_fromId: currencyFrom[0].id,
                            currency_toId: currencyTo[0].id
                        }
                    })
                    await exchangeRate[0].update({
                        currency_rate: cachedobject.rate
                    })

                    break
                case 'globalsettings':
                    const currencyMain = await mCurrency.findOrCreate({ where: { name: cachedobject.main_currency_name } })
                    await mCurrency.update({ main: false }, { where: { main: true } })
                    await currencyMain[0].update({
                        name: cachedobject.main_currency_name,
                        main: true
                    })
                    break
                case 'book':
                    const book = await mBook.findOrCreate({ where: { _id: cachedobject._id } })
                    await book[0].update({
                        name: cachedobject.name,
                        currencyId: cachedobject.currency,
                    })
                    break
                case 'measure':
                    const measure = await mMeasure.findOrCreate({ where: { _id: cachedobject._id } })
                    await measure[0].update({
                        name: cachedobject.name,
                    })
                    break
                case 'product':
                    const product = await mProduct.findOrCreate({ where: { _id: cachedobject._id } })

                    await product[0].update({
                        _isactive: cachedobject._isactive === 'active',
                        code: cachedobject.code,
                        currency: cachedobject.currency,
                        lstBarcodes: cachedobject.lstBarcodes,
                        measure: cachedobject.measure,
                        name: cachedobject.name,
                        price_base_for_buying: cachedobject.price_base_for_buying,
                        price_base_for_sale: cachedobject.price_base_for_sale,
                        price_minimum_for_sale: cachedobject.price_minimum_for_sale,
                        property_1: cachedobject.property_1,
                        property_2: cachedobject.property_2,
                        property_3: cachedobject.property_3,
                        property_4: cachedobject.property_4,
                        property_5: cachedobject.property_5,
                    })
                    break
                default:
                    break
            }
            _sequence_number = _sequence_number > cachedobject._sequence_number ? _sequence_number : cachedobject._sequence_number
        }
        return _sequence_number
    }

}

const aishService = new AishService()

module.exports = aishService