const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function genrateResponse(messages) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}

module.exports = { genrateResponse };


