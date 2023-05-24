const { DataTypes } = require("sequelize");
const sequelize = require("../../config");

const mTransaction = sequelize.define('_transaction', {
    _id: DataTypes.STRING,
    _isactive: DataTypes.STRING,
    book_1: DataTypes.STRING,
    book_2: DataTypes.STRING,
    code: DataTypes.STRING,
    customer_1: DataTypes.STRING,
    customer_2: DataTypes.STRING,
    discount_direction: DataTypes.STRING,
    lastediton: DataTypes.STRING,
    markedasinvalid_note: DataTypes.STRING,
    note: DataTypes.STRING,
    payment_type: DataTypes.STRING,
    transaction_date: DataTypes.STRING,
    transaction_type: DataTypes.STRING,
    warehouse_1: DataTypes.STRING,
    warehouse_2: DataTypes.STRING,
    discount_percent: DataTypes.DOUBLE,
    sum_received: DataTypes.DOUBLE,
    total_sum_before_discount: DataTypes.DOUBLE,
    total_sum: DataTypes.DOUBLE,

})

module.exports = mTransaction