const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');
const aiService = require('../services/ai.service');

// --- 1. CREATE NEW CHAT ---
async function createChat(req, res) {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const chat = await chatModel.create({
      user: userId,
      title: title || 'New Broadcast'
    });

    res.status(201).json({ chat });
  } catch (err) {
    res.status(500).json({ message: 'Chat create failed' });
  }
}

// --- 2. GET ALL CHATS ---
async function getAllChats(req, res) {
  try {
    const chats = await chatModel
      .find({ user: req.user.id })
      .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch {
    res.status(500).json({ message: 'Fetch chats failed' });
  }
}

// --- 3. GET MESSAGES (FROM MESSAGE COLLECTION) ---
async function getMessages(req, res) {
  try {
    const { chatId } = req.params;

    const messages = await messageModel
      .find({ chatId })
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch {
    res.status(500).json({ message: 'Message fetch failed' });
  }
}

// --- 4. RENAME CHAT ---
async function renameChat(req, res) {
  try {
    const chat = await chatModel.findOneAndUpdate(
      { _id: req.params.chatId, user: req.user.id },
      { title: req.body.title },
      { new: true }
    );

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    res.json({ chat });
  } catch {
    res.status(500).json({ message: 'Rename failed' });
  }
}

// --- 5. SEND MESSAGE (REAL FIX) ---
async function sendMessage(req, res) {
  try {
    const { chatId, content } = req.body;
    const userId = req.user.id;

    // validate chat
    const chat = await chatModel.findOne({ _id: chatId, user: userId });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // 1️⃣ save USER message
    await messageModel.create({
      chatId,
      userId,
      role: 'user',
      content
    });

    // 2️⃣ AI response
    const aiReply = await aiService.genrateResponse([
      { role: 'user', content }
    ]);

    // 3️⃣ save AI message
    await messageModel.create({
      chatId,
      userId,
      role: 'ai',
      content: aiReply
    });

    // 4️⃣ update chat meta
    chat.lastMessage = aiReply;
    chat.updatedAt = new Date();
    await chat.save();

    res.json({ aiContent: aiReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI failed' });
  }
}

module.exports = {
  createChat,
  getAllChats,
  getMessages,
  renameChat,
  sendMessage
};
