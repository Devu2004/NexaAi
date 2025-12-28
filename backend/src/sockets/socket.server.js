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
     * STEP 1️⃣
     * Save user message + generate embedding in parallel
     */
    const [userMessage, vectors] = await Promise.all([
      messageModel.create({
        chat,
        user: socket.user._id,
        content,
        role: "user",
      }),
      generateVector(content), // embedding generation
    ]);

    // Safety check 
    if (!Array.isArray(vectors) || vectors.length === 0) {
      throw new Error("Embedding generation failed");
    }

    /**
     * STEP 2️⃣
     * Query Pinecone using SAME vector
     */
    const memories = await queryMemory({
      queryVector: vectors,
      limit: 5,
      metadata: { chat: chat.toString() },
    });

    // Extract text from memory
    const memoryContext = memories
      .map((m) => m.metadata?.text)
      .filter(Boolean)
      .join("\n");

    /**
     * STEP 3️⃣
     * Fetch recent chat history 
     */
    const chatHistory = (
      await messageModel
        .find({ chat })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean()
    ).reverse();

    // Convert DB → LLM format
    const messagesForAI = chatHistory.map((msg) => ({
      role: msg.role === "model" ? "assistant" : "user",
      content: msg.content,
    }));

    /**
     * STEP 4️⃣
     * Inject vector memory as SYSTEM prompt
     */
    const messagesWithContext = [
  {
    role: "system",
    content: `
You are **Nexa AI** — a smart, friendly, playful and supportive AI assistant.

Personality:
- Fun, friendly, slightly witty (never rude).
- Explain things clearly, step-by-step, like a senior dev helping a friend.
- Use light humor when appropriate.
- Always supportive and motivating.

Language:
- Fluent in English, Hindi, and Hinglish.
- Reply in the same language/style the user uses.
- Keep responses natural, human-like, and simple.

Behavior:
- If user is confused, slow down and explain with examples.
- If user makes mistakes, correct politely.
- Encourage learning and curiosity.
- Be practical, not robotic.

Identity:
- Your name is Nexa AI.
- You help users build, debug, and grow as developers.

${memoryContext ? `
Important Memory (use ONLY if relevant):
${memoryContext}
` : ""}

Instruction:
- Use memory only when it clearly helps the answer.
- Do NOT mention memory explicitly unless required.
- Be concise but helpful.
`
  },
  ...messagesForAI,
];


    /**
     * STEP 5️⃣
     * Call AI model 
     */
    const aiResponse = await aiServices.genrateResponse(
      messagesWithContext
    );

    /**
      STEP 6️⃣
      Save AI response in DB
     */
    await messageModel.create({
      chat,
      user: socket.user._id,
      content: aiResponse,
      role: "model",
    });

    /**
      STEP 7️⃣
      Store USER memory in Pinecone
     */
    createMemory({
      vectors,
      messageId: userMessage._id.toString(),
      metadata: {
        chat: chat.toString(),
        user: socket.user._id.toString(),
        text: content,
        role: "user",
      },
    }).catch((err) =>
      console.error("Vector store failed:", err.message)
    );

    /*
      STEP 8️⃣
      Emit response immediately
     */
    socket.emit("ai-response", {
      chat,
      content: aiResponse,
    });

  } catch (error) {
    console.error("AI SOCKET ERROR:", error.message);

    socket.emit("ai-response", {
      chat,
      content:
        "⚠️ Try after sometime ai is not availiable!",
    });
  }
});


    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user._id}`);
    });
  });
}

module.exports = initSocketServer;
