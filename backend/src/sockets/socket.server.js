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
      origin: ["http://localhost:5173", "https://your-vercel-link.vercel.app"], // Apna Vercel link dalo
      credentials: true,
    },
  });

  // 🔐 AUTH MIDDLEWARE (FIXED FOR DEPLOYMENT)
  io.use(async (socket, next) => {
    try {
      // 1. Token check: Cookies se ya Authorization Header se ya Auth Object se
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      const token = cookies.token || socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        console.log("❌ Socket Auth Failed: No Token");
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id).lean(); // lean() for performance
      
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      console.error("❌ Socket JWT Error:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🚀 Neural Node Connected: ${socket.user.fullName.firstName}`);

    socket.on("ai-message", async ({ chat, content }) => {
      try {
        console.log(`📩 Message received for chat: ${chat}`);

        /**
         * STEP 1: Save User Message & Generate Vector
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

        console.log("✅ Message saved & Vector generated");

        /**
         * STEP 2: Query Pinecone Memory
         */
        let memoryContext = "";
        try {
            const memories = await queryMemory({
                queryVector: vectors,
                limit: 5,
                metadata: { chat: chat.toString() },
            });
            memoryContext = memories.map((m) => m.metadata?.text).filter(Boolean).join("\n");
        } catch (memErr) {
            console.error("⚠️ Pinecone Query Failed:", memErr.message);
        }

        /**
         * STEP 3: Chat History
         */
        const chatHistory = (
          await messageModel
            .find({ chat })
            .sort({ createdAt: -1 })
            .limit(6) // Thoda bada history for better context
            .lean()
        ).reverse();

        const messagesForAI = chatHistory.map((msg) => ({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.content,
        }));

        /**
         * STEP 4: Call AI
         */
        const systemPrompt = {
            role: "system",
            content: `You are Nexa AI. Help the user. \nContext: ${memoryContext}`
        };

        const aiResponse = await aiServices.genrateResponse([systemPrompt, ...messagesForAI]);

        /**
         * STEP 5: Save AI Response to DB
         */
        const savedAIResponse = await messageModel.create({
          chat,
          user: socket.user._id,
          content: aiResponse,
          role: "model",
        });

        console.log("✅ AI Response saved to MongoDB");

        /**
         * STEP 6: Store in Pinecone (Wait for it to ensure it saves)
         */
        await createMemory({
          vectors,
          messageId: userMessage._id.toString(),
          metadata: {
            chat: chat.toString(),
            user: socket.user._id.toString(),
            text: content,
            role: "user",
          },
        });

        console.log("✅ Memory stored in Pinecone");

        // Step 7: Final Emit
        socket.emit("ai-response", {
          chat,
          content: aiResponse,
        });

      } catch (error) {
        console.error("🔥 CRITICAL SOCKET ERROR:", error);
        socket.emit("ai-response", {
          chat,
          content: "⚠️ System failure. Check logs.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Node Disconnected: ${socket.user._id}`);
    });
  });
}

module.exports = initSocketServer;