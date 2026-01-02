const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const chatModel = require("../models/chat.model");
const aiServices = require("../services/ai.service");
const { generateVector } = require("../services/embedding.service");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
      credentials: true,
    },
  });

  /* =========================
     🔐 SOCKET AUTH
  ========================= */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  /* =========================
     🔌 CONNECTION
  ========================= */
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.user._id.toString());

    /* =========================
       📩 AI MESSAGE
    ========================= */
    socket.on("ai-message", async (payload) => {
      try {
        const { chat, content } = payload || {};
        if (!chat || !content) return;

        /* =========================
           1️⃣ VALIDATE CHAT
        ========================= */
        const chatDoc = await chatModel.findById(chat);
        if (!chatDoc) {
          console.log("❌ Chat not found");
          return;
        }

        /* =========================
           2️⃣ USER MESSAGE SAVE
           (Message Model + Chat Array)
        ========================= */
        const vectors = await generateVector(content);

        // ✅ Message collection (AI ke liye)
        const userMessage = await messageModel.create({
          chat,
          user: socket.user._id,
          content,
          role: "user",
        });

        // ✅ Chat.messages array (UI ke liye)
        chatDoc.messages.push({
          role: "user",
          content,
        });
        chatDoc.updatedAt = new Date();
        await chatDoc.save();

        /* =========================
           3️⃣ MEMORY + HISTORY
        ========================= */
        const [memories, history] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 3,
            metadata: { chat: chat.toString() },
          }),
          messageModel
            .find({ chat })
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
        ]);

        const memoryContext = memories
          .map((m) => m.metadata?.text)
          .filter(Boolean)
          .join("\n");

        /* =========================
           4️⃣ AI PROMPT
        ========================= */
        const messages = [
          {
            role: "system",
            content: `
You are Nexa AI, a smart developer assistant.
Reply in user's language (English/Hindi/Hinglish).
${memoryContext ? `Context:\n${memoryContext}` : ""}
Be concise.
            `,
          },
          ...history.reverse().map((m) => ({
            role: m.role === "model" ? "assistant" : "user",
            content: m.content,
          })),
        ];

        /* =========================
           5️⃣ AI RESPONSE
        ========================= */
        const aiReply = await aiServices.genrateResponse(messages);

        // ✅ Message collection
        const aiMessage = await messageModel.create({
          chat,
          user: socket.user._id,
          content: aiReply,
          role: "model",
        });

        // ✅ Chat.messages array
        chatDoc.messages.push({
          role: "ai", // frontend expects "ai"
          content: aiReply,
        });
        chatDoc.updatedAt = new Date();
        await chatDoc.save();

        /* =========================
           6️⃣ VECTOR MEMORY STORE
        ========================= */
        createMemory({
          vectors,
          messageId: userMessage._id.toString(),
          metadata: {
            chat: chat.toString(),
            text: content,
          },
        }).catch(() => {});

        /* =========================
           7️⃣ EMIT TO FRONTEND
        ========================= */
        socket.emit("ai-response", {
          chat,
          content: aiReply,
          messageId: aiMessage._id,
        });

      } catch (err) {
        console.log("❌ AI SOCKET ERROR:", err.message);
        socket.emit("ai-response", {
          chat: payload?.chat,
          content: "⚠️ AI unavailable",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.user._id.toString());
    });
  });
}

module.exports = initSocketServer;
