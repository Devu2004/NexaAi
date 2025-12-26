const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const router = express.Router()
const chatController = require('../controllers/chat.controller')

// chat api -> http://localhost:3000/api/chat/
router.post('/', authMiddleware.authuser,chatController.createchat)

module.exports = router