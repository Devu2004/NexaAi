require('dotenv').config()
const server = require('./src/app')
const connectToDB = require('./src/db/db')
const initSocketServer = require('./src/sockets/socket.server')
const httpServer = require('http').createServer(server)
connectToDB()
initSocketServer(httpServer)
httpServer.listen(process.env.PORT , ()=>{
    console.log(`Server is Running on port - ${process.env.PORT}`);
})