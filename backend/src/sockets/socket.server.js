const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const aiServices = require("../services/ai.service");
const { generateVector } = require("../services/embedding.service");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://YOUR_FRONTEND.vercel.app",
      ],
      credentials: true,
    },
  });

  // 🔐 SOCKET AUTH (FIXED)
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
      console.error("SOCKET AUTH ERROR:", err.message);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.user._id.toString());

    socket.on("ai-message", async ({ chat, content }) => {
      try {
        if (!chat || !content) return;

        // 1️⃣ Save user message + generate vector
        const [userMessage, vectors] = await Promise.all([
          messageModel.create({
            chat,
            user: socket.user._id,
            content,
            role: "user",
          }),
          generateVector(content),
        ]);

        // 2️⃣ Fetch memory + recent history
        const [memories, history] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 3,
            metadata: { chat: chat.toString() },
          }),
          messageModel
            .find({ chat })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        ]);

        const memoryContext = memories
          .map((m) => m.metadata?.text)
          .filter(Boolean)
          .join("\n");

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
          { role: "user", content },
        ];

        // 3️⃣ AI response
        const aiReply = await aiServices.genrateResponse(messages);

        const aiMessage = await messageModel.create({
          chat,
          user: socket.user._id,
          content: aiReply,
          role: "model",
        });

        // 4️⃣ Store memory async
        createMemory({
          vectors,
          messageId: userMessage._id.toString(),
          metadata: {
            chat: chat.toString(),
            text: content,
          },
        }).catch(console.error);

        // 5️⃣ Emit response
        socket.emit("ai-response", {
          chat,
          content: aiReply,
          messageId: aiMessage._id,
        });

      } catch (err) {
        console.error("AI SOCKET ERROR:", err);
        socket.emit("ai-response", {
          chat,
          content: "⚠️ AI is unavailable right now",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.user._id.toString());
    });
  });
}

module.exports = initSocketServer;
