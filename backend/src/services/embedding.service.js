require('dotenv').config();
const fetch = require("node-fetch");

// 1️⃣ HuggingFace API Token
const HF_API = process.env.HF_API_KEY; 

// 2️⃣ Best 768-dim model for embeddings
const MODEL = "BAAI/bge-base-en-v1.5";
const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL}`;

async function generateEmbedding(text) {
  try {
    // ✅ HF expects inputs as array
    const payload = { inputs: [text] };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true"
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.error) {
      console.error("❌ API ERROR:", result.error);
      return null;
    }

    // ✅ Flatten nested arrays if necessary
    if (Array.isArray(result)) {
      let vector = result;
      while (Array.isArray(vector[0])) vector = vector[0];
      return vector; // 🔥 768-dim embedding
    }

    return null;
  } catch (err) {
    console.error("❌ Fetch Error:", err.message);
    return null;
  }
}



module.exports = { generateEmbedding };


