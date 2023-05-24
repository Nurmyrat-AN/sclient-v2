const { Op, Sequelize } = require("sequelize")
const mCustomerGroup = require("../db/models/customer-group.model")
const CustomError = require("../errors")
const mCustomer = require("../db/models/customer.model")

class CustomerGroups {
    getAll = ({ name }) => {
        return mCustomerGroup.findAndCountAll({
            where: {
                name: { [Op.like]: `%${name}%` }
            },
            attributes: {
                include: [
                    [Sequelize.literal('(SELECT COUNT(customerGroupId) FROM zzz_customer_vs_groups WHERE customerGroupId=`customer-group`.id)'), 'customerCount']
                ]
            },
            order: ['name']
        })
    }

    update = ({ id, ...props }) => mCustomerGroup.update({ ...props, deletedAt: null }, { where: { id }, paranoid: false })

    create = (props) => mCustomerGroup.create(props)

    delete = (id) => mCustomerGroup.destroy({ where: { id } })

    addCustomer = async ({ groupId, customerIds, clearAll, action = 'add' }) => {
        const group = await mCustomerGroup.findByPk(groupId)
        if (!group) throw CustomError.notFound()
        if (clearAll) {
            await group.removeCustomers(await group.getCustomers())
        } else if (action === 'add') {
            const customers = await mCustomer.findAll({ where: { id: { [Op.in]: customerIds } } })

            await group.addCustomers(customers)
        } else if (action === 'remove') {
            const customers = await mCustomer.findAll({ where: { id: { [Op.in]: customerIds } } })

            await group.removeCustomers(customers)
        }

        return { status: 'SUCCESS', message: 'Operation is successfully saved' }
    }
}

module.exports = CustomerGroups