const { default: axios } = require("axios")
const SettingsService = require("./settings.service")
const mSettings = require("../db/models/settings.model")
const mActionType = require("../db/models/action-type.model")
const mCustomer = require("../db/models/customer.model")
const mCustomerGroup = require("../db/models/customer-group.model")
const { Op, Sequelize } = require("sequelize")
const mTransaction = require("../db/models/cache/transaction.model")
const ActionsSevice = require("./actions.service")
const mAction = require("../db/models/action.model")

class AishTransactionsService {
    timer = null
    start = () => {
        if (this.timer) clearTimeout(this.timer)
        this.getData()
    }

    getData = async () => {
        const settingsService = new SettingsService()
        const host = await settingsService.get_host_url()
        let _transaction_sequence_number = (await mSettings.findOne({ where: { _name: '_transaction_sequence_number' } }))?._value
        const bridge = (await mSettings.findOne({ where: { _name: 'bridgeKey' } }))?._value
        if (_transaction_sequence_number === undefined || bridge !== undefined) return;
        let _transaction_sequence_number_result = 0
        try {
            const { data: rows } = await axios.get(`${host}/transactions?since=${_transaction_sequence_number}`)
            _transaction_sequence_number_result = await this.saveRows(rows)
            await settingsService.set_transaction_sequence_number(_transaction_sequence_number > _transaction_sequence_number_result ? _transaction_sequence_number : _transaction_sequence_number_result)
        } catch (e) {
            console.log('TRANSACTION AISH:  ', e)
        }
        const _request_interval = await settingsService.get_request_interval()
        this.timer = setTimeout(this.getData, _transaction_sequence_number_result === 0 ? _request_interval : 300)
    }

    saveRows = async (rows) => {
        let _transaction_sequence_number = 0
        const rowsCopy = [...rows]
        while (rowsCopy.length) {
            const transaction = rowsCopy.shift()
            if (!transaction) continue;

            const _transactions = [...transaction.lst_invoices, ...transaction.lst_cashtransactions]
            while (_transactions.length) {
                const _tr = _transactions.shift()
                const actionTypes = await mActionType.findAll({
                    where: {
                        isAutomatic: true,
                        transactionType: _tr.transaction_type,
                    }
                })
                if (actionTypes.length === 0) continue;
                while (actionTypes.length) {
                    const _aType = actionTypes.shift()

                    console.log('start checking...')

                    /*---------------------------*/
                    if (_tr.payment_type && !_aType.paymentTypes.includes(_tr.payment_type)) continue;
                    const _customer = await mCustomer.findOne({ where: { _id: _aType.mainCustomer === 2 ? _tr.customer_2 : _tr.customer_1 } })
                    if (!_customer) continue;
                    if (_aType.secondCustomer && _aType !== (_aType.mainCustomer === 2 ? _tr.customer_2 : _tr.customer_1)) continue;
                    if (!_aType.attachToAllCustomers) {
                        const group = await mCustomerGroup.findOne({
                            where: {
                                [Op.and]: [
                                    Sequelize.where(Sequelize.literal(`(SELECT COUNT(*) FROM zzz_customer_vs_groups WHERE zzz_customer_vs_groups.customerGroupId=\`customer-group\`.id AND zzz_customer_vs_groups.customerId=${_customer.id})`), '>', Sequelize.literal('0')),
                                    Sequelize.where(Sequelize.literal(`(SELECT COUNT(*) FROM zzz_action_type_vs_customer_groups WHERE zzz_action_type_vs_customer_groups.customerGroupId=\`customer-group\`.id AND zzz_action_type_vs_customer_groups.actionTypeId=${_aType.id})`), '>', Sequelize.literal('0')),
                                ]
                            }
                        })
                        if (!group) continue;
                    }
                    /*---------------------------*/


                    const _dbTransactions = (await mTransaction.findOrCreate({ where: { _id: _tr._id } }))[0]
                    await _dbTransactions.update({ ...([...transaction.lst_invoices, ...transaction.lst_cashtransactions].find(t => t._id === _tr.parent_invoice) || {}), ..._tr, })

                    console.log('Ready!')
                    const isCreated = await mAction.findOne({ where: { customerId: _customer.id, transactionId: _dbTransactions.id, }, paranoid: false })
                    if (_tr.markedasinvalid_date && isCreated) {
                        await isCreated.update({ deletedNote: _tr.markedasinvalid_note })
                        await isCreated.destroy()
                        continue;
                    }
                    if (isCreated) continue;
                    new ActionsSevice().createActions({ actionType: _aType, customers: [_customer], note: _dbTransactions.note, owner: 'AISH-AUTOMATIC', transactionId: _dbTransactions.id, amount: _tr.total_sum })
                    console.log('Created!')
                }
            }


            _transaction_sequence_number = _transaction_sequence_number > transaction._sequence_number ? _transaction_sequence_number : transaction._sequence_number
        }
        return _transaction_sequence_number
    }

}

const aishTransactionsService = new AishTransactionsService()
module.exports = aishTransactionsService