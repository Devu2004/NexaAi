const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 1. Create New Chat
router.post('/create', authMiddleware.authuser, chatController.createChat);

// 2. Get All User Chats 
router.get('/all', authMiddleware.authuser, chatController.getAllChats);

// 3. GET MESSAGES (History Fetch) 
// URL: GET http://localhost:3000/api/chat/:chatId/messages
router.get('/:chatId/messages', authMiddleware.authuser, chatController.getMessages);

// 4. Rename Specific Chat
router.patch('/rename/:chatId', authMiddleware.authuser, chatController.renameChat);

// 5. Send Message (AI Connection & Save)
router.post('/message', authMiddleware.authuser, chatController.sendMessage);

module.exports = router;