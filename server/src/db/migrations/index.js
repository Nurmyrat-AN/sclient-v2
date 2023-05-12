const sequelize = require("../config")
const fs = require('fs')
const mysql = require('mysql2');
const mActionType = require("../models/action-type.model");
const mTrigger = require("../models/triggers.model");
const mCustomerGroup = require("../models/customer-group.model");
const mCustomer = require("../models/customer.model");
const mAction = require("../models/action.model");
const mMessage = require("../models/message.model");
const mSettings = require("../models/settings.model");
const mTransaction = require("../models/cache/transaction.model");
const TriggersService = require("../../services/triggers.service");
const mActionTypeTransactions = require("../models/action-type.transactions");



const initializeDB = async () => {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    })
    connection.on('error', function (err) {
        console.log('db error', err);
    });

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
    mCustomerGroup.belongsToMany(mCustomer, { as: 'customers', through: 'zzz_customer_vs_groups' })
    mCustomer.belongsToMany(mCustomerGroup, { as: 'groups', through: 'zzz_customer_vs_groups' })
    mActionType.hasMany(mActionTypeTransactions, { as: 'transactions', foreignKey: 'actionTypeId' })
    mActionTypeTransactions.belongsToMany(mCustomerGroup, { as: 'attachedGroups', through: 'zzz_action_type_transactions_vs_customer_groups' })

    mTrigger.belongsToMany(mCustomerGroup, { as: 'attachedGroups', through: 'zzz_trigger_vs_customer_groups' })

    mAction.belongsTo(mCustomer, { as: 'customer', foreignKey: 'customerId' })
    mAction.belongsTo(mActionType, { as: 'actionType', foreignKey: 'actionTypeId' })
    mAction.hasMany(mAction, { as: 'subActions', foreignKey: 'actionId' })
    mAction.belongsTo(mAction, { as: 'parentAction', foreignKey: 'actionId' })
    mAction.belongsTo(mMessage, { as: 'message', foreignKey: 'messageId' })
    mAction.belongsTo(mTransaction, { as: 'transaction', foreignKey: 'transactionId' })

    mAction.afterCreate(new TriggersService().onCreateAction)
    mAction.afterBulkCreate(actions => actions.map(action => new TriggersService().onCreateAction(action)))

    mAction.afterDestroy(new TriggersService().onDestroyAction)
    mAction.afterBulkDestroy(actions => actions.map(action => new TriggersService().onDestroyAction(action)))
    //****************************************** MIGRATIONS ******************************************* */


    await sequelize.authenticate()

    await sequelize.sync({ alter: true })


    const password = await mSettings.findOne({ where: { _name: 'device-app-key' } })
    if (!password) {
        await mSettings.create({ _name: 'device-app-key', _value: 'boss' })
    }


    const mainPassword = await mSettings.findOne({ where: { _name: 'main-app-key' } })
    if (!mainPassword) {
        await mSettings.create({ _name: 'main-app-key', _value: 'boss' })
    }
}

module.exports = initializeDB