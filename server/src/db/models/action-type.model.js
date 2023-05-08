const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const mActionType = sequelize.define('action-type', {
    name: DataTypes.STRING,
    keyCode: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    tertip: { type: DataTypes.INTEGER, defaultValue: 0 },
    actionColor: { type: DataTypes.STRING, defaultValue: '#ffffff' },
    actionAlertAmount: { type: DataTypes.DECIMAL(60, 2), defaultValue: 0 },
    isGlobal: { type: DataTypes.BOOLEAN, defaultValue: false },
    hasMessage: { type: DataTypes.BOOLEAN, defaultValue: false },
    isAutomatic: { type: DataTypes.BOOLEAN, defaultValue: false },
    isMenuOption: { type: DataTypes.BOOLEAN, defaultValue: false },
    hasParentInvoice: { type: DataTypes.BOOLEAN, defaultValue: false },
    transactionType: { type: DataTypes.STRING, defaultValue: null, allowNull: true },
    mainCustomer: { type: DataTypes.INTEGER, defaultValue: null, allowNull: true },
    secondCustomer: { type: DataTypes.STRING, defaultValue: null, allowNull: true },
    paymentTypes: DataTypes.JSON,
    attachToAllCustomers: { type: DataTypes.BOOLEAN, defaultValue: false },
    action_type: { type: DataTypes.ENUM('NONE', 'REMOVE', 'ADD', 'REMOVE_PERCENT', 'ADD_PERCENT'), defaultValue: 'NONE' },
}, { paranoid: true })

module.exports = mActionType