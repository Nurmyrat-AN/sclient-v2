const { default: axios } = require("axios")
const SettingsService = require("./settings.service")
const mSettings = require("../db/models/settings.model")
const sequelize = require("../db/config")
const mActionType = require("../db/models/action-type.model")
const mCustomer = require("../db/models/customer.model")
const mCustomerGroup = require("../db/models/customer-group.model")
const { Op, Sequelize } = require("sequelize")
const mTransaction = require("../db/models/cache/transaction.model")
const ActionsSevice = require("./actions.service")
const mAction = require("../db/models/action.model")
const mActionTypeTransactions = require("../db/models/action-type.transactions")
const aishService = require("./aish.service")

class AishTransactionsService {
    users = {}
    timer = null
    start = () => {
        if (this.timer) clearTimeout(this.timer)
        this.getData()
    }

    getData = async () => {
        const settingsService = new SettingsService()
        const host = await settingsService.get_host_url()
        if (!host) return;
        let _transaction_sequence_number = (await mSettings.findOne({ where: { _name: '_transaction_sequence_number' } }))?._value
        const bridge = (await mSettings.findOne({ where: { _name: 'bridgeKey' } }))?._value
        if (_transaction_sequence_number === undefined || bridge !== undefined) return;
        let _transaction_sequence_number_result = 0
        try {
            const { data: rows } = await axios.get(`${host}/transactions?with_items=true&since=${_transaction_sequence_number}`)
            _transaction_sequence_number_result = await this.saveRows(rows)
            await settingsService.set_transaction_sequence_number(_transaction_sequence_number > _transaction_sequence_number_result ? _transaction_sequence_number : _transaction_sequence_number_result)
        } catch (e) {
            console.log('TRANSACTION AISH:  ', e)
        }
        const _request_interval = await settingsService.get_request_interval()
        this.timer = setTimeout(this.getData, _transaction_sequence_number_result === 0 ? _request_interval : 300)
    }

    saveRows = async (rows) => {
        try {
            await sequelize.authenticate()
        } catch (e) {
            console.log(e)
        }
        const settingsService = new SettingsService()
        const host = await settingsService.get_host_url()
        let _transaction_sequence_number = 0
        const rowsCopy = [...rows]
        while (rowsCopy.length) {
            const transaction = rowsCopy.shift()
            if (!transaction) continue;

            const _transactions = [...transaction.lst_invoices, ...transaction.lst_cashtransactions]
            while (_transactions.length) {
                const _tr = _transactions.shift()
                const automatictransactions = await mActionTypeTransactions.findAll({ where: { transactionType: _tr.transaction_type, } })


                if (automatictransactions.length === 0) continue;
                while (automatictransactions.length) {
                    const _aTransaction = automatictransactions.shift()

                    // Start checking...

                    /*---------------------------*/
                    // Check payments
                    if (_tr.payment_type && !(_aTransaction.paymentTypes || []).includes(_tr.payment_type)) continue;

                    // Check parent invoices
                    if (_aTransaction.hasParentInvoice === 'has' && (_tr.parent_invoice || '').length === 0) continue;
                    if (_aTransaction.hasParentInvoice === 'no' && (_tr.parent_invoice || '').length > 0) continue;

                    // Check existing customer
                    const _customer = await mCustomer.findOne({ where: { _id: _aTransaction.mainCustomer === 2 ? _tr.customer_2 : _tr.customer_1 } })
                    if (!_customer) continue;

                    // Check second customer
                    if (_aTransaction.secondCustomer && _aTransaction.secondCustomer !== (_aTransaction.mainCustomer === 2 ? _tr.customer_1 : _tr.customer_2)) continue;

                    // Check attachment
                    if (!_aTransaction.attachToAllCustomers) {
                        const group = await mCustomerGroup.findOne({
                            where: {
                                [Op.and]: [
                                    Sequelize.where(Sequelize.literal(`(SELECT COUNT(*) FROM zzz_customer_vs_groups WHERE zzz_customer_vs_groups.customerGroupId=\`customer-group\`.id AND zzz_customer_vs_groups.customerId=${_customer.id})`), '>', Sequelize.literal('0')),
                                    Sequelize.where(Sequelize.literal(`(SELECT COUNT(*) FROM zzz_action_type_transactions_vs_customer_groups WHERE zzz_action_type_transactions_vs_customer_groups.customerGroupId=\`customer-group\`.id AND zzz_action_type_transactions_vs_customer_groups.actionTypeTransactionId=${_aTransaction.id})`), '>', Sequelize.literal('0')),
                                ]
                            }
                        })
                        if (!group) continue;
                    }

                    // Check existing action type
                    const actionType = await mActionType.findByPk(_aTransaction.actionTypeId)
                    if (!actionType) continue;
                    /*---------------------------*/



                    const _dbTransactions = (await mTransaction.findOrCreate({ where: { _id: _tr._id } }))[0]
                    const parentInvoice = ([...transaction.lst_invoices, ...transaction.lst_cashtransactions].find(t => t._id === (_tr?.parent_invoice || '')) || {})
                    await _dbTransactions.update([...Object.keys(parentInvoice), ...Object.keys(_tr)].reduce((res, k) => ({ ...res, [k]: _tr[k] || parentInvoice[k] }), {}))

                    const isCreated = await mAction.findOne({ where: { customerId: _customer.id, transactionId: _dbTransactions.id, actionTypeId: _aTransaction.actionTypeId }, paranoid: false })
                    if (_tr.markedasinvalid_date) {
                        if (isCreated) {
                            await isCreated.update({ deletedNote: _tr.markedasinvalid_note })
                            await isCreated.destroy()
                        }
                        continue;
                    }

                    // Check creation dublicate
                    if (isCreated) continue;

                    let ownerUser = 'AISH'
                    if (this.users[_tr.lasteditby]) {
                        ownerUser = this.users[_tr.lasteditby]
                    } else {
                        try {
                            const { data } = await axios.get(`${host}/cachedobjects?id=${_tr.lasteditby}`)
                            ownerUser = data[0]?.name || data.name
                            if (ownerUser) this.users[_tr.lasteditby] = ownerUser
                        } catch (e) { }
                    }

                    let amount = _tr.total_sum

                    try {
                        if (_tr.payment_type === 'On credit') {
                            amount = _tr.total_sum
                        } else if (_aTransaction.amountType === 'sum_received') {
                            amount = _tr.sum_received > _tr.total_sum ? _tr.total_sum : _tr.sum_received
                        } else if (_aTransaction.amountType === 'difference') {
                            amount = _tr.total_sum - (_tr.sum_received > _tr.total_sum ? _tr.total_sum : _tr.sum_received)
                        } else {
                            amount = _tr.total_sum
                        }
                    } catch (e) {
                        console.log('AMOUNT_TYPE', e)
                    }


                    //excepted products
                    let calculatedExceptedProductsAmount = amount
                    try {

                        const exceptedProducts = (await actionType.getExceptedProducts()).map(p => p._id)
                        const lst_items = (parentInvoice?.lst_items || []).filter(p => exceptedProducts.includes(p.product))
                        calculatedExceptedProductsAmount = amount - lst_items.reduce((res, v) => res + v.price_total, 0);
                        if (calculatedExceptedProductsAmount === 0) continue
                    } catch (e) {
                        console.log(e)
                    }
                    // Ready creation!
                    const result = await new ActionsSevice().createActions({
                        createdAt: _tr.lastediton,
                        actionType,
                        customers: [_customer],
                        note: _dbTransactions.note,
                        owner: `${ownerUser} (AUTOMATIC)`,
                        transactionId: _dbTransactions.id,
                        amount,
                        calculatedExceptedProductsAmount
                    })
                    console.log('Created automatic action!', result.map(r => r.toJSON()))
                }
            }


            _transaction_sequence_number = _transaction_sequence_number > transaction._sequence_number ? _transaction_sequence_number : transaction._sequence_number
        }

        if (rows.find(r => r.lst_invoices.length > 0)) {
            aishService._syncAishProducts()
        }
        return _transaction_sequence_number
    }

}

const aishTransactionsService = new AishTransactionsService()
module.exports = aishTransactionsService
