const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const mCustomerGroup = sequelize.define('customer-group', {
    name: DataTypes.STRING,
})

module.exports = mCustomerGroup