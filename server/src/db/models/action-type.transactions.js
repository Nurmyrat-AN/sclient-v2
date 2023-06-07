const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const mActionTypeTransactions = sequelize.define('action-type-transaction', {
    hasParentInvoice: { type: DataTypes.ENUM('has', 'no', 'any'), defaultValue: 'any' },
    transactionType: { type: DataTypes.STRING, defaultValue: null, allowNull: true },
    mainCustomer: { type: DataTypes.INTEGER, defaultValue: null, allowNull: true },
    secondCustomer: { type: DataTypes.STRING, defaultValue: null, allowNull: true },
    paymentTypes: DataTypes.JSON,
    amountType: { type: DataTypes.ENUM('sum_received', 'total_sum', 'difference'), defaultValue: 'total_sum' },
    attachToAllCustomers: { type: DataTypes.BOOLEAN, defaultValue: false },
})

module.exports = mActionTypeTransactions