const messageService = require("./message.service")

class SocketService {
    socket = null
    interval = null

    onConnect = (socket) => {
        if (!this.socket?.connected)
            this.socket = socket

        socket.on('sended-message', async (props, cb) => {
            try {
                const message = JSON.parse(props)
                await messageService.createMessage(message)
                cb()
            } catch (e) {
                cb('skip')
            }
        })
        socket.on('disconnect', () => {
            this.socket = null
        })
        this.emitNewMessage()
    }

    emitNewMessage = () => {
        if (this.socket?.connected)
            this.socket.emit('NEW-MESSAGES')
    }


}

const socketService = new SocketService()

module.exports = socketService