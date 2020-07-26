const express = require('express')

const http = require("http")

const path = require('path')

const socketio = require('socket.io')

const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')

const { addUser, removeUser,  getUser,    getUsersInRoom} = require('./utils/users')

const app = express();



const port = process.env.PORT || 3000

const server = http.createServer(app)

const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath));

const io = socketio(server)

let count = 0;

io.on('connection', (socket) => {
    console.log("New websocket connection")


   

    socket.on('join', ({username ,room } ,callback) => {

        const { error ,user } = addUser({ id: socket.id, username, room } ,callback)

        if (error) {

            return callback(error)

        }



        socket.join(user.room)

        socket.emit('message', generateMessage('Admin' , "Welcome !!"))

        socket.broadcast.to(user.room).emit('message', generateMessage('Admin' ,`${ user.username } has joined`))

        io.to(user.room).emit('roomData', {

            room: user.room,

            users: getUsersInRoom(user.room)


        })

        callback()

    })



    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id)

        const filter = new Filter()

        if (filter.isProfane()) {
            return callback('Profanity not allow')
        }


        io.to(user.room).emit('message', generateMessage(user.username, message))

        callback()

    })

    socket.on('sendlocation', (cords ,callback) => {

        const user = getUser(socket.id)

        io.to(user.room).emit('locationmessage', generateLocationMessage(user.username, "https://google.com/maps?q=" + encodeURIComponent(cords.latitude) + "," + encodeURIComponent(cords.longitude)))

        callback()
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('admin', ` ${user.username} has left`))

            io.to(user.room).emit('roomData', {

                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }



       
    })




})

server.listen(port, () => {
    console.log("server is running at port" + port)
})

