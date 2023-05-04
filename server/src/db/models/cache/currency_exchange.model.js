const { DataTypes } = require("sequelize");
const sequelize = require("../../config");

const mCurrencyExchange = sequelize.define('_currenciesexchange', {
    currency_rate: DataTypes.DECIMAL(60, 2),
    currency_fromId: DataTypes.INTEGER,
    currency_toId: DataTypes.INTEGER,
})

module.exports = mCurrencyExchange