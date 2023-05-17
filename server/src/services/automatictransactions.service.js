const { Op, HasOne, Sequelize } = require("sequelize")
const mCustomerGroup = require("../db/models/customer-group.model")
const mActionTypeTransactions = require("../db/models/action-type.transactions")
const mCustomer = require("../db/models/customer.model")

class AutomaticTransactionsService {
    constructor(actionTypeId) {
        this.actionTypeId = actionTypeId
    }

    getAll = () => mActionTypeTransactions.findAndCountAll({
        where: { actionTypeId: this.actionTypeId },
        include: ['attachedGroups', {
            association: new HasOne(mCustomer, mActionTypeTransactions, { as: 'customer', foreignKey: 'id' }),
            on: {
                _id: { [Op.eq]: Sequelize.literal('`action-type-transaction`.`secondCustomer`') }
            }
        }]
    })

    create = async ({ id, ...props }) => {
        const aType = await mActionTypeTransactions.create({ ...props, actionTypeId: this.actionTypeId })
        const attachedGroups = await mCustomerGroup.findAll({ where: { id: { [Op.in]: (props.attachedGroups || []).map(a => a.id) } } })
        aType.addAttachedGroups(attachedGroups)
    }

    update = async ({ id, ...props }) => {
        const trigger = await mActionTypeTransactions.findByPk(id)
        await trigger.update({ ...props, actionTypeId: this.actionTypeId })

        await trigger.removeAttachedGroups()
        const attachedGroups = await mCustomerGroup.findAll({ where: { id: { [Op.in]: (props.attachedGroups || []).map(a => a.id) } } })
        await trigger.addAttachedGroups(attachedGroups)
        return trigger
    }

    delete = (id) => mActionTypeTransactions.destroy({ where: { id } })
}

module.exports = AutomaticTransactionsService