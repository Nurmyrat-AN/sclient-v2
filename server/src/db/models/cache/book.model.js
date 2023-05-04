const { DataTypes } = require("sequelize");
const sequelize = require("../../config");

const mBook = sequelize.define('_book', {
    _id: DataTypes.STRING,
    name: DataTypes.STRING,
    currencyId: DataTypes.STRING,
}, { indexes: [{ name: '_id', fields: ['_id'], unique: true }] })

module.exports = mBook