const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
    retry: { timeout: 60, max: 100 }
});


module.exports = sequelize