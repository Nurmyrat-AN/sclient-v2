const mAction = require("../db/models/action.model")
const mMessage = require("../db/models/message.model")
const moment = require('moment')

class MessageService {
    createMessage = async (props) => {
        const action = await mAction.findByPk(props.id)
        const isHasMessage = await mMessage.findByPk(props.id)
        if (action && !isHasMessage) {
            const message = await mMessage.create({
                id: props.id,
                message: props.message,
                isSent: props.send
            })
            await action.setMessage(message, {})
        }
    }

    deletseMessage = async id => {
        await mMessage.destroy({ where: { id } })
        return true
    }

    getSendableMassages = async ({ actions }) => actions.map(action => ({
        client_name: action.customer.name,
        id: action.id,
        message: getMessage(action.toJSON()),
        phone: action.customer.phone_number
    }))

}


const patterns = {
    date: '{date}',
    client: '{client}',
    balance: '{balance}',
    amount: '{amount}',
    res: '{res}',
    aish_balance: '{aish_balance}',
    note: '{note}',
    owner: '{owner}',
    code: '{code}',
}

const getMessage = (action) => {
    let message = action.actionType.message

    message = replacePattern(message, 'date', moment(action.createdAt).format('DD.MM.YYYY HH:mm:ss'))
    message = replacePattern(message, 'client', action.customer.name)
    message = replacePattern(message, 'balance', `${action.balance}`)
    message = replacePattern(message, 'amount', `${action.amount}`)
    message = replacePattern(message, 'res', `${action.res}`)
    message = replacePattern(message, 'aish_balance', `${action.aish_balance || '0.00'}`)
    message = replacePattern(message, 'note', `${action.note || ''}`)
    message = replacePattern(message, 'owner', `${action.owner || ''}`)
    message = replacePattern(message, 'code', `${action.transaction?.code || ''}`)


    if (action.actionType.message === message) {
        return message
    } else {
        action.actionType.message = message
        return getMessage(action)
    }
}

const replacePattern = (message, patternKey, replacement) => {
    if (message.includes(patterns[patternKey])) {
        return message.replace(patterns[patternKey], replacement);
    }

    return message;
}

const messageService = new MessageService()

module.exports = messageService