const { Op, HasOne, Sequelize } = require("sequelize")
const mActionType = require("../db/models/action-type.model")
const mCustomer = require("../db/models/customer.model")
const mCustomerGroup = require("../db/models/customer-group.model")

class ActionTypesService {
    getAll = async ({ isGlobal, name = '', message = '', action_type, limit = 10, offset = 0, hideDeleted = true }) => {
        const andArr = [{
            name: { [Op.like]: `%${name}%` },
            message: { [Op.like]: `%${message}%` },
        }]
        if (action_type) andArr.push({ action_type })

        if (isGlobal !== undefined) andArr.push({ isGlobal })

        return await mActionType.findAndCountAll({
            where: andArr,
            paranoid: hideDeleted,
            limit,
            offset,
            order: ['tertip']
        })
    }

    update = async ({ id, ...props }) => {
        await mActionType.update({ ...props, deletedAt: null }, { where: { id }, paranoid: false })
        const aType = await mActionType.findByPk(id)
        console.log(aType)
//	const groups = await aType.getAttachedGroups()
//        await aType.removeAttachedGroups(groups)
//        const groups2 = await mCustomerGroup.findAll({ where: { id: { [Op.in]: props.attachedGroups.map(a => a.id) } } })
//        await aType.addAttachedGroups(groups2)
        return aType
    }

    create = (props) => mActionType.create(props)

    delete = (id) => mActionType.destroy({ where: { id } })

}

module.exports = ActionTypesService
