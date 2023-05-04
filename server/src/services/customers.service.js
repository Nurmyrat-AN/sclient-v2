const { Op, Sequelize } = require("sequelize")
const mCustomer = require("../db/models/customer.model")
const formatEndDate = require("../utils/date.sql.utils")
const numberQuerySql = require("../utils/numbersql.utils")
const mAction = require("../db/models/action.model")
const SettingsService = require("./settings.service")
const mCurrency = require("../db/models/cache/currency.model")
const mCurrencyExchange = require("../db/models/cache/currency_exchange.model")
const mBook = require("../db/models/cache/book.model")
const { default: axios } = require("axios")

class CustomersService {

    getAndArr = async ({ name = '', barcodes, percent, enddate, balance, ids, groupId }) => {

        const andArr = [{
            [Op.or]: [
                { name: { [Op.like]: `%${name}%` } },
                { phone_number: { [Op.like]: `%${name}%` } },
            ],
        }]

        if (barcodes) {
            andArr.push(Sequelize.literal(`JSON_CONTAINS(barcodes, '"${barcodes}"', '$')`))
        }

        if (percent) {
            andArr.push(numberQuerySql({ col: Sequelize.col('percent'), num: percent.toString() }))
        }

        if (balance) {
            andArr.push(numberQuerySql({ col: Sequelize.literal(`COALESCE((SELECT SUM(res) FROM actions WHERE actions.deletedAt IS NULL AND customerId=customer.id ${enddate ? `AND actions.createdAt<='${formatEndDate(new Date(enddate))}'` : ''}),0)`), num: balance.toString() }))
        }

        if (ids && ids.length > 0) {
            andArr.push({
                id: { [Op.in]: ids }
            })
        }

        if (groupId) {
            andArr.push(Sequelize.where(Sequelize.literal(`(SELECT COUNT(customerId) FROM zzz_customer_vs_groups WHERE customerGroupId=${groupId} AND customerId=customer.id)`), '>', '0'))
        }

        return andArr
    }
    getAll = async (props) => {
        const { enddate, limit = 10, offset = 0 } = props

        return {
            count: await mCustomer.count({
                where: await this.getAndArr(props),
            }),
            rows: await mCustomer.findAll({
                where: await this.getAndArr(props),
                attributes: {
                    include: [
                        [Sequelize.literal(`COALESCE((SELECT SUM(res) FROM actions WHERE actions.deletedAt IS NULL AND customerId=customer.id ${enddate ? `AND actions.createdAt<='${formatEndDate(new Date(enddate))}'` : ''}),0)`), 'balance']
                    ]
                },
                include: ['groups'],
                offset: offset,
                limit: limit,
                order: ['name']
            })
        }
    }

    getIDS = async (props) => {
        const ids = (await mCustomer.findAll({ attributes: ['id'], where: await this.getAndArr(props) })).map(c => c.id)
        return ids
    }

    getSumOfBalances = async (props = {}) => {
        const ids = await this.getIDS({ ...props, enddate: undefined })
        const sum = await mAction.sum('res', {
            where: {
                createdAt: { [Op.lte]: new Date(props.enddate || new Date()) },
                customerId: { [Op.in]: ids },
            }
        })
        return sum || 0
    }

    update = async (props = {}) => {
        const customer = await mCustomer.findByPk(props.id)
        const { _id, id, ...received } = props
        await customer.update(received)
    }

    getAishBalance = async (_id) => {
        const host = await new SettingsService().get_host_url()
        const { data } = await axios.get(`${host}/balancesofcustomers?customer_id=${_id}`)

        const dataWithCurrency = []
        while (data.length > 0) {
            const o = data.shift()
            if (!o) continue;
            const book = await mBook.findOne({ where: { _id: o.book_id } })
            if (!book) throw new Error('Unknown Book')
            const currency = await mCurrency.findOne({ where: { _id: book.currencyId } })
            if (!currency) throw new Error('Unknown Currency')
            dataWithCurrency.push({
                balance_in_books_currency: o.balance_in_books_currency,
                currency
            })

        }


        const getRateToCurrency = async (props) => {
            const fromList = []
            let idx = 0

            if (props.fromList.length === 0) return { index: -1, rate: 1 }

            idx = 0
            while (props.fromList.length > idx) {
                const seperator = props.fromList[idx]
                if (seperator.id === props.to.id) {
                    return { index: idx, rate: 1 }
                }
                idx++;
            }

            idx = 0
            while (props.fromList.length > idx) {
                const seperator = props.fromList[idx]
                const fromListFromSeperator = await mCurrency.findAll({
                    where: {
                        [Op.and]: [
                            { id: { [Op.in]: Sequelize.literal(`(SELECT cexchange.currency_toId FROM _currenciesexchanges cexchange WHERE cexchange.currency_fromId=${seperator.id})`) } },
                            { id: { [Op.notIn]: props.fromList.map(f => f.id) } }
                        ]
                    }
                })
                fromList.push(...fromListFromSeperator.map(model => ({ idx, model })))
                const exchange = await mCurrencyExchange.findOne({ where: { currency_fromId: seperator?.id, currency_toId: props.to.id } })
                if (exchange) {
                    return {
                        index: idx,
                        rate: exchange.currency_rate
                    }
                }
                idx++;
            }


            const { index, rate } = await getRateToCurrency({ fromList: fromList.map(f => f.model), to: props.to })
            if (index !== -1 && fromList[index]) {
                const exchange = await mCurrencyExchange.findOne({ where: { currency_fromId: props.fromList[fromList[index].idx].id, currency_toId: fromList[index].model.id } })
                if (exchange) {
                    return {
                        index: fromList[index].idx,
                        rate: exchange.currency_rate * rate
                    }
                }
            }



            // new Array(20).fill('').forEach(() => console.log(''))
            // console.log(new Array(10).fill('*').toString(), '  NOT FOUND  ', new Array(10).fill('*').toString())
            return { index: -1, rate: 1 }
        }

        const mainCurrency = await mCurrency.findOne({ where: { main: true } })
        if (!mainCurrency) throw new Error('Not found Main Currency')

        let sum = 0
        while (dataWithCurrency.length > 0) {
            const balance = dataWithCurrency.shift()
            if (!balance) continue;
            const { index, rate } = await getRateToCurrency({ fromList: [balance.currency], to: mainCurrency })
            if (index !== -1) {
                sum += balance.balance_in_books_currency * rate
            } else {
                const { rate } = await getRateToCurrency({ fromList: [mainCurrency], to: balance.currency })
                sum += balance.balance_in_books_currency * rate
            }
        }
        try {
            return sum.toFixed(2)
        } catch (e) {
            return sum
        }
    }
}

module.exports = CustomersService