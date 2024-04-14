const { Sequelize, Op, HasMany } = require("sequelize")
const mAction = require("../db/models/action.model")
const mActionType = require("../db/models/action-type.model")
const mCustomer = require("../db/models/customer.model")
const CustomError = require("../errors")
const numberQuerySql = require("../utils/numbersql.utils")
const moment = require('moment')
const socketService = require("./socket.service")
const CustomersService = require("./customers.service")

class ActionsSevice {
    getAndArr = props => {
        const { sendableMessages, customerId, actionTypeId, aish_balance, amount, balance, customer = '', percent, res, note = '', owner = '', enddate, startdate, isSent, customerIds } = props

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
            }, {
                [Op.or]: [
                    Sequelize.where(Sequelize.literal('`action`.note'), 'LIKE', `%${note}%`),
                ]
            }
        ]

        if (sendableMessages) {
            andArr.push({
                hasMessage: true,
                messageId: { [Op.eq]: null },
            })
            andArr.push(Sequelize.where(Sequelize.literal(`customer.phone_number`), 'LIKE', `+993%`))
        }

        if (actionTypeId) andArr.push({ actionTypeId })

        if (customerId) andArr.push({ customerId })

        const balanceCol = Sequelize.literal(`(SELECT SUM(res) FROM actions subActions WHERE subActions.deletedAt IS NULL AND subActions.customerId=ActionModel.customerId AND subActions.createdAt<=ActionModel.createdAt)`)

        if (amount) andArr.push(numberQuerySql({ col: Sequelize.literal('`action`.amount'), num: amount }))
        if (res) andArr.push(numberQuerySql({ col: Sequelize.literal('`action`.res'), num: res }))
        if (percent) andArr.push(numberQuerySql({ col: Sequelize.literal('`action`.percent'), num: percent }))
        if (balance) andArr.push(numberQuerySql({ col: balanceCol, num: balance }))
        if (aish_balance) andArr.push(numberQuerySql({ col: Sequelize.literal('`action`.aish_balance'), num: aish_balance }))
        if (isSent !== 'undefined') andArr.push({ messageId: { [isSent === 'true' ? Op.ne : Op.eq]: null } })
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

    createActions = async ({ actionType, amount, customers, transactionId = null, note, owner, actionId, ...rest }) => {
        const _actionType = await mActionType.findByPk(actionType.id)
        const _customers = await mCustomer.findAll({ where: { id: { [Op.in]: customers.map(c => c.id) } } })

        if (!_actionType) throw CustomError.notFound()
        if (_customers.length === 0) throw CustomError.notFound()

        if (_actionType.action_type !== 'NONE' && (!amount || amount <= 0)) throw CustomError.notFound() //|| _customers.find(c => !c._isactive)  AKTIWLERI YAPMAK


        if (_actionType.action_type === 'REMOVE' && _customers.find(c => c.balance < amount)) throw CustomError.badRequest({ status: 400, messageCode: 400, message: 'Not enough balance' })

        if (_actionType.action_type === 'REMOVE_PERCENT' && _customers.find(c => c.balance < amount * (c.percent * 0.01))) throw CustomError.notFound({ status: 400, messageCode: 400, message: 'Not enough balance' })

		if(_actionType.action_type.includes('ADD') && _customers.find(c => !c._isactive)) throw CustomError.badRequest({ status: 400, messageCode: 400, message: 'Customer is not active' })

        const actions = []
        while (_customers.length) {
            const c = _customers.shift()
            let aish_balance = 0
            if (actionType.action_type === 'NONE') {
                aish_balance = await new CustomersService().getAishBalance(c._id)
            } else {
                try {
                    aish_balance = await new CustomersService().getAishBalance(c._id)
                } catch (e) { }
            }
            actions.push({
                ...rest,
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
                note: note || '',
                owner: owner,
                actionId
            })
        }

        const result = await mAction.bulkCreate(actions)
        socketService.emitNewMessage()
        return result
    }

    getAll = (props) => {
        const where = this.getAndArr(props)
        return mAction.findAndCountAll({
            where,
            logging: props.sendableMessages === true,
            attributes: {
                include: [
                    [Sequelize.literal(`(SELECT SUM(res) FROM actions a1 WHERE a1.deletedAt IS NULL AND a1.id<=\`action\`.id AND a1.customerId=\`action\`.customerId)`), 'balance']
                ]
            },
            include: ['customer', {
                association: 'actionType',
                paranoid: false
            }, 'message', 'transaction', {
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
            order: [['id', 'DESC']]
        })
    }

    getReports = async ({ name = '', startdate = new Date(), enddate = new Date() }) => {

        const actionsSql = `FROM actions WHERE actions.deletedAt IS NULL AND actions.actionTypeId=\`action-type\`.id AND actions.createdAt>='${moment(startdate).format('YYYY-MM-DD 00:00:00')}' AND actions.createdAt<='${moment(enddate).format('YYYY-MM-DD 23:23:59')}'`

        const result = await mActionType.findAndCountAll({
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

        const rows = []

        while (result.rows.length) {
            const row = result.rows.shift()
            const actionsOwnerGrouppedSql = `FROM actions WHERE actions.deletedAt IS NULL AND owner=action.owner AND actions.actionTypeId=${row.id} AND actions.createdAt>='${moment(startdate).format('YYYY-MM-DD 00:00:00')}' AND actions.createdAt<='${moment(enddate).format('YYYY-MM-DD 23:23:59')}'`
            rows.push({
                ...row.toJSON(),
                grouppedActions: await mAction.findAll({
                    where: {
                        [Op.and]: [
                            { createdAt: { [Op.gte]: moment(startdate).format('YYYY-MM-DD 00:00:00') } },
                            { createdAt: { [Op.lte]: moment(enddate).format('YYYY-MM-DD 23:23:59') } },
                            { actionTypeId: row.id }
                        ]
                    },
                    attributes: {
                        exclude: [
                            "id",
                            "amount",
                            "percent",
                            "res",
                            "actionTypeId",
                            "customerId",
                            "messageId",
                            "action_type",
                            "aish_balance",
                            "transactionId",
                            "hasMessage",
                            "note",
                            "deletedNote",
                            "createdAt",
                            "updatedAt",
                            "deletedAt",
                            "actionId",
                            "count",
                            "sumBalance",
                            "sumAmount",
                        ],
                        include: [
                            [Sequelize.literal(`(SELECT COUNT(id) ${actionsOwnerGrouppedSql})`), 'count'],
                            [Sequelize.literal(`(SELECT SUM(res) ${actionsOwnerGrouppedSql})`), 'sumBalance'],
                            [Sequelize.literal(`(SELECT SUM(amount) ${actionsOwnerGrouppedSql})`), 'sumAmount'],
                        ]
                    },
                    group: 'owner'
                })
            })
        }

        return {
            count: result.count,
            rows
        }
    }
}

module.exports = ActionsSevice
