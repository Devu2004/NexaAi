const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const aiServices = require("../services/ai.service");
const { generateEmbedding } = require("../services/embedding.service");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  // 🔐 AUTH MIDDLEWARE
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      if (!cookies.token) return next(new Error("Token missing"));

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // 🔌 SOCKET CONNECTION
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user._id}`);

    socket.on("ai-message", async ({ chat, content }) => {
      try {
        // 1️⃣ Save USER message
        await messageModel.create({
          chat,
          user: socket.user._id,
          content,
          role: "user",
        });

        // 2️⃣ Generate embedding ONCE
        const embeddingVector = await generateEmbedding(content);

        if (!Array.isArray(embeddingVector) || embeddingVector.length === 0) {
          throw new Error("Embedding generation failed");
        }

        const queryVector = await generateEmbedding(content);

        // 3️⃣ Query Pinecone memory
        const memories = await queryMemory({
          queryVector,
          limit: 5,
          chatId: chat.toString(),
        });

        const memoryContext = memories.map((m) => m.metadata?.text).filter(Boolean).join("\n");

        // 4️⃣ Fetch chat history
        const chatHistory = (
          await messageModel
            .find({ chat })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean()
        ).reverse();

        const messagesForAI = chatHistory.map((msg) => ({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.content,
        }));

        // 5️⃣ Inject memory as system prompt
        const messagesWithContext = [
          {
            role: "system",
            content: memoryContext
              ? `Use this memory if relevant:\n${memoryContext}`
              : "You are a helpful AI assistant.",
          },
          ...messagesForAI,
        ];

        // 6️⃣ Call AI
        const aiResponse = await aiServices.genrateResponse(
          messagesWithContext
        );

        // 7️⃣ Save AI response
        await messageModel.create({
          chat,
          user: socket.user._id,
          content: aiResponse,
          role: "model",
        });

        // 8️⃣ Store USER memory in Pinecone
        await createMemory({
          vectors: embeddingVector,
          messageId: `msg-${Date.now()}`,
          metadata: {
            chat: chat.toString(),
            user: socket.user._id.toString(),
            text: content,
            role: "user",
          },
        });

        // 9️⃣ Emit response
        socket.emit("ai-response", { chat, content: aiResponse });
      } catch (error) {
        console.error("AI SOCKET ERROR:", error.message);
        socket.emit("ai-response", {
          chat,
          content:
            "⚠️ Bhai AI abhi available nahi hai, thodi der baad try kar!",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user._id}`);
    });
  });
}

module.exports = initSocketServer;
