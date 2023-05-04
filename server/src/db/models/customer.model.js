const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const mCustomer = sequelize.define('customer', {
    _id: DataTypes.STRING,
    _isactive: DataTypes.BOOLEAN,
    barcodes: DataTypes.JSON,
    name: DataTypes.STRING,
    percent: { type: DataTypes.DECIMAL(60, 2), defaultValue: 0 },
    phone_number: DataTypes.STRING,
    isBonusedCustomer: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { indexes: [{ name: '_id', fields: ['_id'], unique: true }] })

module.exports = mCustomer