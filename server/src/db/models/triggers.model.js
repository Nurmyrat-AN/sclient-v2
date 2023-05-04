const { DataTypes } = require("sequelize")
const sequelize = require("../config")


const mTrigger = sequelize.define('action-trigger', {
    onAction: DataTypes.ENUM(['onDelete', 'onInsert']),
    minAmount: { type: DataTypes.DOUBLE, defaultValue: 0 },
    maxAmount: { type: DataTypes.DOUBLE, defaultValue: 0 },
    actions: DataTypes.JSON     /* {
                type: 'CREATE_ACTION' | 'ADD_TO_GROUP' | 'REMOVE_FROM_GROUP'
                actionAmountCalculation: string
                attachToAllCustomers: { type: DataTypes.BOOLEAN, defaultValue: false },
            }[] */
})

module.exports = mTrigger