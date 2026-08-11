import axios from "axios";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function embedText(text) {
  return localHashEmbedding(text);
}

function localHashEmbedding(text, dims = 256) {
  const vec = new Array(dims).fill(0);
  const tokens = text.toLowerCase().match(/[a-z0-9_]+/g) || [];
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    vec[hash % dims] += 1;
  }
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function askAI({ question, contextChunks }) {
  if (!process.env.GROQ_API_KEY) {
    return (
      "GROQ_API_KEY is not set on the server, so I can't reach the model yet. " +
      "Add it to server/.env to enable real answers. Here's what retrieval found:\n\n" +
      contextChunks.map((c) => `File: ${c.filePath}\n${c.content.slice(0, 200)}...`).join("\n\n")
    );
  }

  const contextBlock = contextChunks
    .map((c, i) => `[Chunk ${i + 1} — ${c.filePath}]\n${c.content}`)
    .join("\n\n");

  const systemPrompt =
    "You are CodeSense AI, a software engineering assistant for professional developers. " +
    "Answer questions about a codebase using only the provided context chunks. " +
    "Be direct and concise — no restating the question, no summary paragraph at the end, " +
    "no repeating which files were used after already citing them inline. " +
    "Use short paragraphs or a tight numbered list only if the steps are genuinely sequential. " +
    "Cite a file path inline the first time you reference it, not again afterward. " +
    "If the context doesn't contain the answer, say so in one line instead of guessing.";
  
  let data;
  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          // Few-shot examples: these teach the model the exact answer shape
          // we want (short, direct, one inline citation per file, no trailing
          // summary) far more reliably than instructions alone.
          {
            role: "user",
            content:
              "Context from the repository:\n\n[Chunk 1 — utils/hash.js]\nfunction hashPassword(pw) {\n  return bcrypt.hash(pw, 10);\n}\n\nQuestion: How are passwords stored?",
          },
          {
            role: "assistant",
            content:
              "Passwords are hashed with bcrypt at a cost factor of 10 before storage (utils/hash.js). Nothing else in the given context touches password storage.",
          },
          {
            role: "user",
            content:
              "Context from the repository:\n\n[Chunk 1 — routes/health.js]\nrouter.get('/health', (req, res) => res.send('ok'));\n\nQuestion: Where is the payment logic?",
          },
          {
            role: "assistant",
            content: "The provided context doesn't include any payment-related code — only a health check route (routes/health.js).",
          },
          {
            role: "user",
            content: `Context from the repository:\n\n${contextBlock}\n\nQuestion: ${question}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "content-type": "application/json",
        },
      }
    );
    data = response.data;
  } catch (err) {
    console.error("Groq API error:", JSON.stringify(err.response?.data) || err.message);
    throw new Error(err.response?.data?.error?.message || err.message);
  }

  return data.choices?.[0]?.message?.content || "No answer was returned.";
}