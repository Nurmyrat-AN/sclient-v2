const { DataTypes } = require("sequelize");
const sequelize = require("../../config");

const mCurrency = sequelize.define('_currency', {
    _id: DataTypes.STRING,
    name: DataTypes.STRING,
    main: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { indexes: [{ name: '_id', fields: ['_id'], unique: true }] })

module.exports = mCurrency