const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const aiServices = require("../services/ai.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // adjust for prod
      credentials: true,
    },
  });

  // 🔐 AUTH MIDDLEWARE
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

      if (!cookies.token) {
        return next(new Error("Authentication Error: Token missing"));
      }

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);

      if (!user) {
        return next(new Error("Authentication Error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication Error: Invalid token"));
    }
  });

  // 🔌 SOCKET CONNECTION
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user._id}`);

    // 🤖 AI MESSAGE EVENT
    socket.on("ai-message", async (messagePayload) => {
      try {
        const { chat, content } = messagePayload;

        // 1️⃣ Save USER message
        await messageModel.create({
          chat,
          user: socket.user._id,
          content,
          role: "user",
        });

        // 2️⃣ Fetch last 4 messages (context)
        const chatHistory = (
          await messageModel
            .find({ chat })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean()
        ).reverse();

        // 3️⃣ Convert DB → Groq format
        const messagesForAI = chatHistory.map((msg) => ({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.content,
        }));

        // 4️⃣ Call AI
        const aiResponse = await aiServices.genrateResponse(messagesForAI);

        // 5️⃣ Save AI response
        await messageModel.create({
          chat,
          user: socket.user._id,
          content: aiResponse,
          role: "model",
        });

        // 6️⃣ Send response to client
        socket.emit("ai-response", {
          chat,
          content: aiResponse,
        });

      } catch (error) {
        console.error("AI SOCKET ERROR:", error.message);

        socket.emit("ai-response", {
          chat: messagePayload.chat,
          content: "⚠️ Bhai AI abhi available nahi hai, thodi der baad try kar!",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user._id}`);
    });
  });
}

module.exports = initSocketServer;

