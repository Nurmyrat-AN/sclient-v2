const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const mActionTypeTransactions = sequelize.define('action-type-transaction', {
    hasParentInvoice: { type: DataTypes.BOOLEAN, defaultValue: false },
    transactionType: { type: DataTypes.STRING, defaultValue: null, allowNull: true },
    mainCustomer: { type: DataTypes.INTEGER, defaultValue: null, allowNull: true },
    secondCustomer: { type: DataTypes.STRING, defaultValue: null, allowNull: true },
    paymentTypes: DataTypes.JSON,
    attachToAllCustomers: { type: DataTypes.BOOLEAN, defaultValue: false },
})

module.exports = mActionTypeTransactions