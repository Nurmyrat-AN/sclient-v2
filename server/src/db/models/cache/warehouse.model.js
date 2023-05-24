const { DataTypes } = require("sequelize");
const sequelize = require("../../config");

const mWarehouse = sequelize.define('_warehouse', {
    _id: DataTypes.STRING,
    name: DataTypes.STRING,

}, { indexes: [{ name: '_id', fields: ['_id'], unique: true }] })

module.exports = mWarehouse