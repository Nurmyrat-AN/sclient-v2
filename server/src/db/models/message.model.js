const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const mMessage = sequelize.define('message', {
    message: DataTypes.TEXT,
    isSent: DataTypes.BOOLEAN,
})

module.exports = mMessage