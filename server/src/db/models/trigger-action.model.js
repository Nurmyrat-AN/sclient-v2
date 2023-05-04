const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const mTriggerAction = sequelize.define('action-trigger-action', {
    actionType: DataTypes.ENUM(['CREATE_ACTION', 'ADD_TO_GROUP', 'REMOVE_FROM_GROUP']),
    actionAmountCalculation: DataTypes.TEXT,
    attachToAllCustomers: { type: DataTypes.BOOLEAN, defaultValue: false },
})

module.exports = mTriggerAction