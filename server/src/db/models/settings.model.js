const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const mSettings = sequelize.define('_settings', {
    _name: DataTypes.STRING,
    _value: DataTypes.STRING,
}, { indexes: [{ name: '_name', fields: ['_name'], unique: true }] })

module.exports = mSettings