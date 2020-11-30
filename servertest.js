const io = require('socket.io')


const socket = io.connect('localhost:3000')

socket.emit('new-user', "servertest", 100, 100)