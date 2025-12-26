const express = require('express')
const cookieParser = require('cookie-parser')

// Auth routes
const authRoutes = require('./routes/auth.routes')
// Chat Routes
const chatRoutes = require('./routes/chat.routes')

const app = express()
// Middleware
app.use(express.json())
app.use(cookieParser())


app.use('/api/auth', authRoutes)
app.use('/api/chat',chatRoutes)

module.exports = app