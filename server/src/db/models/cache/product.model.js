const { DataTypes } = require("sequelize");
const sequelize = require("../../config");

const mProduct = sequelize.define('_product', {
    _id: DataTypes.STRING,
    _isactive: DataTypes.BOOLEAN,
    code: DataTypes.STRING,
    currency: DataTypes.STRING,
    lstBarcodes: DataTypes.JSON,
    measure: DataTypes.STRING,
    name: DataTypes.STRING,
    price_base_for_buying: DataTypes.DOUBLE,
    price_base_for_sale: DataTypes.DOUBLE,
    price_minimum_for_sale: DataTypes.DOUBLE,
    property_1: DataTypes.STRING,
    property_2: DataTypes.STRING,
    property_3: DataTypes.STRING,
    property_4: DataTypes.STRING,
    property_5: DataTypes.STRING,
}, { indexes: [{ name: '_id', fields: ['_id'], unique: true }] })

module.exports = mProduct