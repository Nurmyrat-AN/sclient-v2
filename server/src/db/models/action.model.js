const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const mAction = sequelize.define('action', {
    amount: { type: DataTypes.DECIMAL(60, 2), defaultValue: 0 },
    percent: DataTypes.DECIMAL(60, 2),
    res: { type: DataTypes.DECIMAL(60, 2), defaultValue: 0 },
    actionTypeId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER,
    messageId: DataTypes.INTEGER,
    action_type: { type: DataTypes.ENUM('NONE', 'REMOVE', 'ADD', 'REMOVE_PERCENT', 'ADD_PERCENT'), defaultValue: 'NONE' },
    aish_balance: DataTypes.DECIMAL(60, 2),
    transactionId: DataTypes.INTEGER,
    hasMessage: { type: DataTypes.BOOLEAN, defaultValue: true },
    note: DataTypes.STRING,
    deletedNote: DataTypes.STRING,
    owner: DataTypes.STRING,
}, { paranoid: true })

module.exports = mAction