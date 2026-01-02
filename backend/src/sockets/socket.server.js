const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const aiServices = require("../services/ai.service");
const { generateVector } = require("../services/embedding.service");
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
        /**
         * STEP 1: Parallel Tasks
         * 1. Save User Message to Mongoose
         * 2. Generate Vectors for RAG
         */
        const [userMessage, vectors] = await Promise.all([
          messageModel.create({
            chat,
            user: socket.user._id,
            content,
            role: "user",
          }),
          generateVector(content),
        ]);

        if (!vectors || !Array.isArray(vectors)) {
          throw new Error("Vector generation failed");
        }

        /**
         * STEP 2: Fetch Context
         * 1. Query Pinecone for relevant memories
         * 2. Get recent Mongoose chat history (excluding the message we just saved to avoid duplicates)
         */
        const [memories, rawHistory] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 3,
            metadata: { chat: chat.toString() },
          }),
          messageModel
            .find({ chat, _id: { $ne: userMessage._id } }) // Exclude current message
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ]);

        const memoryContext = memories
          .map((m) => m.metadata?.text)
          .filter(Boolean)
          .join("\n");

        const chatHistory = rawHistory.reverse().map((msg) => ({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.content,
        }));

        /**
         * STEP 3: AI Prompt Construction
         */
        const messagesWithContext = [
          {
            role: "system",
            content: `
You are Nexa AI, a smart and friendly developer assistant. 
Reply in the language the user uses (English/Hindi/Hinglish).

${memoryContext ? `Relevant context from past: ${memoryContext}` : ""}

Instruction: Use context only if relevant. Be concise and helpful.`
          },
          ...chatHistory,
          { role: "user", content: content }, // Add current message at the end
        ];

        /**
         * STEP 4: Generate & Store AI Response
         */
        const aiResponse = await aiServices.genrateResponse(messagesWithContext);

        const savedAiMsg = await messageModel.create({
          chat,
          user: socket.user._id,
          content: aiResponse,
          role: "model",
        });

        /**
         * STEP 5: Async Pinecone Store (Don't await to keep socket fast)
         */
        createMemory({
          vectors,
          messageId: userMessage._id.toString(),
          metadata: {
            chat: chat.toString(),
            text: content,
            role: "user",
          },
        }).catch((err) => console.error("Pinecone storage error:", err));

        // Emit final response
        socket.emit("ai-response", {
          chat,
          content: aiResponse,
          messageId: savedAiMsg._id
        });

      } catch (error) {
        console.error("AI SOCKET ERROR:", error.message);
        socket.emit("ai-response", {
          chat,
          content: "⚠️ Sorry, I'm having trouble connecting right now.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user._id}`);
    });
  });
}

module.exports = initSocketServer;