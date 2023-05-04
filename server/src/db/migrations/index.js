const sequelize = require("../config")
const fs = require('fs')
const mysql = require('mysql2');
const mActionType = require("../models/action-type.model");
const mTrigger = require("../models/triggers.model");
const mCustomerGroup = require("../models/customer-group.model");
const mCustomer = require("../models/customer.model");
const mTriggerAction = require("../models/trigger-action.model");
const mAction = require("../models/action.model");
const mMessage = require("../models/message.model");



const initializeDB = async () => {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    })

    await new Promise((resolve, reject) => {
        connection.query(`
                #DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`;
                CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;
            `, (err, value) => {
            if (err) {
                reject(err)
            } else {
                resolve(value)
            }
        })
    })

    const scanDir = (out_path) => {
        const paths = fs.readdirSync(out_path)
        paths.forEach(path => {
            if (fs.statSync(`${out_path}/${path}`).isDirectory()) {
                scanDir(`${out_path}/${path}`)
            } else {
                if (path.includes('.js')) {
                    try {
                        require(`${out_path}/${path}`.replace('src/db', '..'))
                    } catch (e) {
                        console.log(`${out_path}/${path}`, e.message)
                    }
                }
            }
        })
    }

    scanDir(`src/db/models`)

    //****************************************** MIGRATIONS ******************************************* */
    mActionType.hasMany(mTrigger, { as: 'triggers', foreignKey: 'actionTypeId' })
    mTrigger.hasMany(mTriggerAction, { as: 'triggerActions', foreignKey: 'triggerId' })
    mTriggerAction.belongsToMany(mCustomerGroup, { as: 'attachedGroups', through: 'zzz_trigger_action_vs_customer_groups' })
    mCustomerGroup.belongsToMany(mCustomer, { as: 'customers', through: 'zzz_customer_vs_groups' })
    mCustomer.belongsToMany(mCustomerGroup, { as: 'groups', through: 'zzz_customer_vs_groups' })
    mActionType.belongsToMany(mCustomerGroup, { as: 'attachedGroups', through: 'zzz_action_type_vs_customer_groups' })

    mAction.belongsTo(mCustomer, { as: 'customer', foreignKey: 'customerId' })
    mAction.belongsTo(mActionType, { as: 'actionType', foreignKey: 'actionTypeId' })
    mAction.hasMany(mAction, { as: 'subActions', foreignKey: 'actionId' })
    mAction.belongsTo(mAction, { as: 'parentAction', foreignKey: 'actionId' })
    mAction.belongsTo(mMessage, { as: 'message', foreignKey: 'messageId' })
    //****************************************** MIGRATIONS ******************************************* */


    await sequelize.authenticate()

    await sequelize.sync({ alter: true })

}

module.exports = initializeDB