const chatModel = require('../models/chat.model');
const aiService = require('../services/ai.service');

// --- 1. CREATE NEW CHAT ---
async function createChat(req, res) {
    try {
        const { title } = req.body;
        const userId = req.user.id;
        const newChat = new chatModel({ 
            title: title || "New Broadcast", 
            user: userId,
            messages: [] // Khali messages array se shuru karo
        });
        await newChat.save();
        res.status(201).json({ message: "Stream Initialized", chat: newChat });
    } catch (error) {
        console.error("Create Chat Error:", error);
        res.status(500).json({ message: "Error creating chat" });
    }
}

// --- 2. GET ALL CHATS (Sidebar ke liye) ---
async function getAllChats(req, res) {
    try {
        const userId = req.user.id;
        const chats = await chatModel.find({ user: userId }).sort({ updatedAt: -1 });
        res.status(200).json({ chats });
    } catch (error) {
        res.status(500).json({ message: "Error fetching chats" });
    }
}

// --- 3. FETCH HISTORY (Ye fix karega empty chat wala issue) ---
async function getMessages(req, res) {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        // Chat dhoondo aur uske messages return karo
        const chat = await chatModel.findOne({ _id: chatId, user: userId });
        if (!chat) return res.status(404).json({ message: "Neural stream not found" });

        res.status(200).json({ messages: chat.messages || [] });
    } catch (error) {
        res.status(500).json({ message: "History retrieval failed" });
    }
}

// --- 4. RENAME CHAT ---
async function renameChat(req, res) {
    try {
        const { chatId } = req.params;
        const { title } = req.body;
        const userId = req.user.id;
        const chat = await chatModel.findOneAndUpdate({ _id: chatId, user: userId }, { title }, { new: true });
        if (!chat) return res.status(404).json({ message: "Chat not found" });
        res.status(200).json({ message: "Renamed", chat });
    } catch (error) {
        res.status(500).json({ message: "Rename Error" });
    }
}

// --- 5. SEND MESSAGE & PERSIST (Save to DB) ---
async function sendMessage(req, res) {
    try {
        const { chatId, content } = req.body;
        const userId = req.user.id;

        const chat = await chatModel.findOne({ _id: chatId, user: userId });
        if (!chat) return res.status(404).json({ message: "Stream connection lost" });

        chat.messages.push({ role: 'user', content: content });
        await chat.save(); 

        const aiReply = await aiService.genrateResponse([{ role: "user", content: content }]);

        chat.messages.push({ role: 'ai', content: aiReply });
        await chat.save();

        res.status(200).json({ aiContent: aiReply });
    } catch (error) {
        console.error("AI Broadcast Error:", error);
        res.status(500).json({ message: "Failed to reach AI Core" });
    }
}

module.exports = {
    createChat,
    getAllChats,
    renameChat,
    sendMessage,
    getMessages 
};