const { Sequelize, Op } = require("sequelize")
const mAction = require("../db/models/action.model")
const mActionType = require("../db/models/action-type.model")
const mCustomer = require("../db/models/customer.model")
const CustomError = require("../errors")
const numberQuerySql = require("../utils/numbersql.utils")
const moment = require('moment')

class ActionsSevice {
    getAndArr = props => {
        const { sendableMessages, customerId, actionTypeId, aish_balance, amount, balance, customer = '', percent, res, note, owner = '', enddate, startdate, isSent, customerIds } = props

        const andArr = [
            {
                [Op.or]: [
                    Sequelize.where(Sequelize.literal(`customer.name`), 'LIKE', `%${customer}%`),
                    Sequelize.where(Sequelize.literal(`customer.phone_number`), 'LIKE', `%${customer}%`)
                ]
            }, {
                [Op.or]: [
                    Sequelize.where(Sequelize.literal('`action`.owner'), 'LIKE', `%${owner}%`),
                ]
            }
        ]

        if (sendableMessages) {
            andArr.push({
                hasMessage: true,
                messageId: { [Op.eq]: null }
            })
        }

        if (actionTypeId) andArr.push({ actionTypeId })

        if (note) andArr.push({ note })

        if (customerId) andArr.push({ customerId })

        const balanceCol = Sequelize.literal(`(SELECT SUM(res) FROM actions subActions WHERE subActions.deletedAt IS NULL AND subActions.customerId=ActionModel.customerId AND subActions.createdAt<=ActionModel.createdAt)`)

        if (amount) andArr.push(numberQuerySql({ col: Sequelize.literal('`action`.amount'), num: amount }))
        if (res) andArr.push(numberQuerySql({ col: Sequelize.literal('`action`.res'), num: res }))
        if (percent) andArr.push(numberQuerySql({ col: Sequelize.literal('`action`.percent'), num: percent }))
        if (balance) andArr.push(numberQuerySql({ col: balanceCol, num: balance }))
        if (aish_balance) andArr.push(numberQuerySql({ col: Sequelize.literal('`action`.aish_balance'), num: aish_balance }))
        if (isSent) andArr.push({ messageId: { [isSent === 'true' ? Op.ne : Op.eq]: null } })
        if (startdate) {
            const start = new Date(startdate);
            start.setUTCHours(0, 0, 0, 0);
            andArr.push({
                createdAt: {
                    [Op.gte]: start
                }
            })
        }
        if (enddate) {
            const end = new Date(enddate);
            end.setUTCHours(23, 59, 59, 999);
            andArr.push({
                createdAt: {
                    [Op.lte]: end
                }
            })
        }
        if (customerIds && customerIds.length > 0) {
            andArr.push({
                customerId: { [Op.in]: customerIds }
            })
        }

        return andArr
    }

    createActions = async ({ actionType, amount, customers, transactionId = null, note, owner, actionId }) => {
        const _actionType = await mActionType.findByPk(actionType.id)
        const _customers = await mCustomer.findAll({ where: { id: { [Op.in]: customers.map(c => c.id) } } })

        if (!_actionType) throw CustomError.notFound()
        if (_customers.length === 0) throw CustomError.notFound()

        if (_actionType.action_type !== 'NONE' && (!amount || amount <= 0)) throw CustomError.notFound()


        if (_actionType.action_type === 'REMOVE' && _customers.find(c => c.balance < amount)) throw CustomError.badRequest({ status: 400, messageCode: 400, message: 'Not enough balance' })

        if (_actionType.action_type === 'REMOVE_PERCENT' && _customers.find(c => c.balance < amount * (c.percent * 0.01))) throw CustomError.notFound({ status: 400, messageCode: 400, message: 'Not enough balance' })


        const actions = []
        while (_customers.length) {
            const c = _customers.shift()
            let aish_balance = null
            if (actionType.action_type === 'NONE') {
                aish_balance = await new CustomersService().getAishBalance(c._id)
            } else {
                try {
                    aish_balance = await new CustomersService().getAishBalance(c._id)
                } catch (e) { }
            }
            actions.push({
                amount: amount,
                percent: c.percent,
                res: _actionType.action_type === 'REMOVE' ? -amount : _actionType.action_type === 'REMOVE_PERCENT' ? -(amount * (c.percent * 0.01)) : _actionType.action_type === 'ADD' ? amount : _actionType.action_type === 'ADD_PERCENT' ? (amount * (c.percent * 0.01)) : 0,
                actionTypeId: _actionType.id,
                customerId: c.id,
                messageId: null,
                hasMessage: _actionType.hasMessage,
                action_type: _actionType.action_type,
                aish_balance: aish_balance,
                transactionId: transactionId,
                note: note,
                owner: owner,
                actionId
            })
        }

        return await mAction.bulkCreate(actions)
    }

    getAll = (props) => {
        const where = this.getAndArr(props)
        return mAction.findAndCountAll({
            where,
            attributes: {
                include: [
                    [Sequelize.literal(`(SELECT SUM(res) FROM actions a1 WHERE a1.deletedAt IS NULL AND a1.id<=action.id AND a1.customerId=action.customerId)`), 'balance']
                ]
            },
            include: ['customer', 'actionType', 'message', 'transaction', {
                association: 'parentAction',
                attributes: {
                    include: [
                        [Sequelize.literal(`(SELECT SUM(res) FROM actions a1 WHERE a1.deletedAt IS NULL AND a1.id<=parentAction.id AND a1.customerId=parentAction.customerId)`), 'balance']
                    ]
                },
                paranoid: false
            }],
            paranoid: props.hideDeleted,
            limit: props.limit,
            offset: props.offset,
            order: [['createdAt', 'DESC']]
        })
    }

    getReports = async ({ name = '', startdate = new Date(), enddate = new Date() }) => {

        const actionsSql = `FROM actions WHERE actions.deletedAt IS NULL AND actions.actionTypeId=\`action-type\`.id AND actions.createdAt>='${moment(startdate).format('YYYY-MM-DD 00:00:00')}' AND actions.createdAt<='${moment(enddate).format('YYYY-MM-DD 23:23:59')}'`

        return await mActionType.findAndCountAll({
            where: {
                name: { [Op.like]: `%${name}%` }
            },
            attributes: {
                include: [
                    [Sequelize.literal(`(SELECT COUNT(id) ${actionsSql})`), 'count'],
                    [Sequelize.literal(`(SELECT SUM(res) ${actionsSql})`), 'sumBalance'],
                    [Sequelize.literal(`(SELECT SUM(amount) ${actionsSql})`), 'sumAmount'],
                ]
            },
            order: ['tertip']
        })
    }
}

module.exports = ActionsSevice