const { DataTypes } = require("sequelize");
const sequelize = require("../../config");

const mMeasure = sequelize.define('_measure', {
    _id: DataTypes.STRING,
    name: DataTypes.STRING
}, { indexes: [{ name: '_id', fields: ['_id'], unique: true }] })

module.exports = mMeasure