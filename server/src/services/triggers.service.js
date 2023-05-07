const { Op, Sequelize } = require("sequelize")
const mCustomerGroup = require("../db/models/customer-group.model")
const mTrigger = require("../db/models/triggers.model")
const mActionType = require("../db/models/action-type.model")
const ActionsSevice = require("./actions.service")
const CustomerGroups = require("./customer-groups.service")

class TriggersService {
    constructor(actionTypeId) {
        this.actionTypeId = actionTypeId
    }

    getAll = async () => {
        const result = await mTrigger.findAndCountAll({ where: { actionTypeId: this.actionTypeId }, include: ['attachedGroups'] })

        return {
            count: result.count,
            rows: await Promise.all(result.rows.map(r => new Promise(async (resolve, reject) => {
                resolve({
                    ...r.toJSON(),
                    actions: await Promise.all((r.toJSON().actions || []).map(a => new Promise(async (resolve, reject) => {
                        try {
                            resolve({
                                ...a,
                                customerGroup: a.customerGroupId ? (await mCustomerGroup.findByPk(a.customerGroupId)).toJSON() : null,
                                actionType: a.actionTypeId ? (await mActionType.findByPk(a.actionTypeId)).toJSON() : null,
                            })
                        } catch (e) {
                            resolve(a)
                        }
                    })))
                })
            })))
        }
    }

    create = ({ id, ...props }) => mTrigger.create({ ...props, actionTypeId: this.actionTypeId }, { include: ['attachedGroups'] })

    update = async ({ id, ...props }) => {
        const trigger = await mTrigger.findByPk(id)
        await trigger.update({ ...props, actionTypeId: this.actionTypeId })

        await trigger.removeAttachedGroups()
        const attachedGroups = await mCustomerGroup.findAll({ where: { id: { [Op.in]: (props.attachedGroups || []).map(a => a.id) } } })
        await trigger.addAttachedGroups(attachedGroups)
        return trigger
    }

    delete = (id) => mTrigger.destroy({ where: { id } })

    actionCalculate = ({ action, actionAmountCalculation }) => {
        while (actionAmountCalculation.includes('a')) {
            actionAmountCalculation = actionAmountCalculation.replace('a', action.amount || 0)
        }

        while (actionAmountCalculation.includes('r')) {
            actionAmountCalculation = actionAmountCalculation.replace('r', action.res || 0)
        }

        while (actionAmountCalculation.includes(' ')) {
            actionAmountCalculation = actionAmountCalculation.replace(' ', '')
        }

        if (actionAmountCalculation.length === 0) return 0

        const calculate = (calc) => {
            try {
                const received = calc
                const acykYayIdx = calc.indexOf('(')
                if (acykYayIdx >= 0) {
                    let yapykYay = acykYayIdx + 1
                    let found = 1
                    while (yapykYay < calc.length && found > 0) {
                        const ch = calc.substring(yapykYay, yapykYay + 1)
                        if (ch === '(') found++
                        if (ch === ')') found--
                        yapykYay++
                    }
                    const calculated = calculate(calc.substring(acykYayIdx + 1, yapykYay - 1))
                    calc = calc.replace(calc.substring(acykYayIdx, yapykYay), `${calculated}`)
                }

                const patterns = ['*', '/', '+', '-', '%']
                const getLast = (str) => {
                    let idx = str.length - 1
                    while (idx >= 0) {
                        const ch = str.substring(idx, idx + 1)
                        if (patterns.includes(ch)) break
                        idx--
                    }
                    return str.substring(idx + 1)
                }
                const getStart = (str) => {
                    let idx = 0
                    while (idx < str.length) {
                        const ch = str.substring(idx, idx + 1)
                        if (patterns.includes(ch)) break
                        idx++
                    }
                    return str.substring(0, idx)
                }

                while (calc.includes('*')) {
                    const idx = calc.indexOf('*')
                    const left = getLast(calc.substring(0, idx))
                    const right = getStart(calc.substring(idx + 1))
                    calc = calc.replace(`${left}*${right}`, left * right)
                    break
                }


                while (calc.includes('/')) {
                    const idx = calc.indexOf('/')
                    const left = getLast(calc.substring(0, idx))
                    const right = getStart(calc.substring(idx + 1))
                    calc = calc.replace(`${left}/${right}`, left / right)
                    break
                }


                while (calc.includes('%')) {
                    const idx = calc.indexOf('%')
                    const left = getLast(calc.substring(0, idx))
                    const right = getStart(calc.substring(idx + 1))
                    calc = calc.replace(`${left}%${right}`, left * right / 100)
                    break
                }



                while (calc.includes('+')) {
                    const idx = calc.indexOf('+')
                    const left = getLast(calc.substring(0, idx))
                    const right = getStart(calc.substring(idx + 1))
                    calc = calc.replace(`${left}+${right}`, +left + +right)
                    break
                }



                while (calc.includes('-')) {
                    const idx = calc.indexOf('-')
                    const left = getLast(calc.substring(0, idx))
                    const right = getStart(calc.substring(idx + 1))
                    calc = calc.replace(`${left}-${right}`, +left - +right)
                    break
                }
                // console.log(`${received}  ==>>  ${calc}`)
                return calc
            } catch (e) {
                return 0
            }
        }

        return calculate(actionAmountCalculation)
    }

    runTriggers = async ({ action, triggerActionType }) => {
        try {
            if (action.actionId) return;

            const triggers = await mTrigger.findAll({
                where: {
                    [Op.and]: [
                        {
                            actionTypeId: action.actionTypeId,
                            onAction: triggerActionType
                        }, {
                            [Op.or]: [
                                { minAmount: 0 },
                                { minAmount: { [Op.gte]: action.amount } }
                            ]
                        }, {
                            [Op.or]: [
                                { maxAmount: 0 },
                                { maxAmount: { [Op.lte]: action.amount } }
                            ]
                        }, {
                            [Op.or]: [
                                { attachToAllCustomers: true },
                                Sequelize.where(Sequelize.literal(`(
                                    SELECT COUNT(*) FROM zzz_customer_vs_groups 
                                        WHERE customerId=${action.customerId} AND
                                            customerGroupId IN (
                                                    SELECT zzz_trigger_vs_customer_groups.customerGroupId FROM zzz_trigger_vs_customer_groups
                                                        WHERE 
                                                            zzz_trigger_vs_customer_groups.actionTriggerId=\`action-trigger\`.id
                                            )
                                )`), '>', Sequelize.literal('0'))
                            ]
                        }
                    ],
                },
            })
            const actionsSevice = new ActionsSevice()
            await Promise.all(triggers.map(trigger => new Promise(async (resolve, reject) => {
                await Promise.all(trigger.actions.map(triggerAction => new Promise(async (resolve, reject) => {
                    if (triggerAction.type === 'CREATE_ACTION' && triggerAction.actionTypeId) {
                        const amount = this.actionCalculate({ action, actionAmountCalculation: triggerAction.actionAmountCalculation })
                        const note = triggerActionType === 'onDelete' ? action.deletedNote : action.note
                        actionsSevice.createActions({ customers: [{ id: action.customerId }], actionType: { id: triggerAction.actionTypeId }, amount, note, actionId: action.id, owner: 'TRIGGER' })
                    }
                    if (triggerAction.customerGroupId && (triggerAction.type === 'ADD_TO_GROUP' || triggerAction.type === 'REMOVE_FROM_GROUP')) {
                        await new CustomerGroups().addCustomer({ groupId: triggerAction.customerGroupId, customerIds: [action.customerId], action: triggerAction.type === 'ADD_TO_GROUP' ? 'add' : 'remove' })
                    }

                    resolve(true)
                })))
                resolve(true)
            })))
        } catch (e) { console.log(e) }
    }

    onDestroyAction = (action) => this.runTriggers({ action, triggerActionType: 'onDelete' })


    onCreateAction = (action) => this.runTriggers({ action, triggerActionType: 'onInsert' })
}

module.exports = TriggersService