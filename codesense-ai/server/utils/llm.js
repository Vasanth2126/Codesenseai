import axios from "axios";

const AI_SERVICE_URL = process.env.CODESENSE_AI_URL || "https://survive-graphical-tumor-markets.trycloudflare.com/generate";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

let extractor = null;

/**
 * Lazy-load HuggingFace Transformers.js.
 * Generates local 384-dimensional embeddings for RAG.
 */
async function getExtractor() {
  if (!extractor) {
    try {
      const { pipeline } = await import("@xenova/transformers");

      extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    } catch (err) {
      console.warn(
        "[Embeddings] Transformers.js load failed, using fallback vectorizer:",
        err.message
      );
    }
  }

  return extractor;
}

/**
 * Generate embeddings for text.
 */
export async function embedText(text) {
  try {
    const pipe = await getExtractor();

    if (pipe) {
      const output = await pipe(text, {
        pooling: "mean",
        normalize: true,
      });

      return Array.from(output.data);
    }
  } catch (err) {
    console.error(
      "[Embeddings] Model error, using fallback vectorizer:",
      err.message
    );
  }

  return fallbackEmbedding(text, 384);
}

/**
 * Fallback embedding using token hashing.
 */
function fallbackEmbedding(text, dims = 384) {
  const vec = new Array(dims).fill(0);
  const tokens = text.toLowerCase().match(/[a-z0-9_]+/g) || [];

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    vec[hash % dims] += 1;
  }

  const norm =
    Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0)) || 1;

  return vec.map((value) => value / norm);
}

/**
 * Calculate cosine similarity between two vectors.
 */
export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Clean model response.
 */
function cleanResponse(text) {
  if (!text) return "";
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  text = text.replace(/\*\*\*Reasoning\*\*\*[\s\S]*?\*\*\*Answer\*\*\*/i, "").trim();
  return text;
}

/**
 * Build repository context chunks.
 */
function buildContext(contextChunks = []) {
  if (!Array.isArray(contextChunks) || contextChunks.length === 0) return "";
  return contextChunks
    .map((chunk, index) => `[Chunk ${index + 1} — ${chunk.filePath}]\n${chunk.content}`)
    .join("\n\n");
}

function buildPromptMessages(question, contextChunks) {
  const contextBlock = buildContext(contextChunks);
  const systemPrompt =
    "You are CodeSense AI, a software engineering assistant for professional developers. " +
    "Answer questions about a codebase using only the provided context chunks. " +
    "Be direct and concise — cite file paths inline where relevant. " +
    "If the context doesn't contain the answer, state that clearly instead of speculating.";

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Context from repository:\n\n${contextBlock}\n\nQuestion: ${question}`,
    },
  ];
}

/**
 * Send a question to custom Python backend if configured.
 */
async function callCustomAIService(question, contextChunks = []) {
  if (!AI_SERVICE_URL) return null;
  const context = buildContext(contextChunks);

  const response = await axios.post(
    AI_SERVICE_URL,
    { question, context },
    { headers: { "Content-Type": "application/json" }, timeout: 120000 }
  );

  const answer = response.data?.answer;
  if (!answer) throw new Error("Custom AI service returned an empty answer.");
  return cleanResponse(answer);
}

/**
 * Generate a normal, non-streaming AI response.
 */
export async function askAI({ question, contextChunks = [] }) {
  // 1. Try Custom Python AI Service if configured
  if (AI_SERVICE_URL) {
    try {
      const customAnswer = await callCustomAIService(question, contextChunks);
      if (customAnswer) return customAnswer;
    } catch (err) {
      console.warn("[LLM] Custom AI service failed, attempting Groq fallback:", err.message);
    }
  }

  // 2. Try Groq API
  if (process.env.GROQ_API_KEY) {
    const messages = buildPromptMessages(question, contextChunks);
    let lastError;
    for (const model of GROQ_MODELS) {
      try {
        const response = await axios.post(
          GROQ_URL,
          { model, max_tokens: 2048, messages },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              "content-type": "application/json",
            },
            timeout: 60000,
          }
        );
        const raw = response.data?.choices?.[0]?.message?.content || "No answer returned.";
        return cleanResponse(raw);
      } catch (err) {
        const msg = err.response?.data?.error?.message || err.message || "";
        console.error(`[LLM] Groq ${model} failed:`, msg);
        lastError = new Error(msg);
      }
    }
    if (lastError) throw lastError;
  }

  // 3. Informative fallback when no LLM provider is configured
  return (
    "⚠️ **AI Key Not Configured on Render**\n\n" +
    "To enable AI answers, please add `GROQ_API_KEY` (Free from https://console.groq.com/keys) or `CODESENSE_AI_URL` in your Render Web Service Environment settings.\n\n" +
    "**Retrieved Context Chunks:**\n" +
    contextChunks
      .slice(0, 3)
      .map((c) => `- **${c.filePath}**:\n\`\`\`\n${c.content.slice(0, 200)}...\n\`\`\``)
      .join("\n\n")
  );
}

/**
 * Stream AI response over SSE
 */
export async function streamAI({
  question,
  contextChunks = [],
  onToken,
  onComplete,
  onError,
}) {
  // 1. If Custom AI service is configured
  if (AI_SERVICE_URL) {
    try {
      const answer = await callCustomAIService(question, contextChunks);
      if (answer) {
        onToken(answer);
        return await onComplete(answer);
      }
    } catch (err) {
      console.warn("[LLM Stream] Custom AI service failed, falling back to Groq:", err.message);
    }
  }

  // 2. If Groq API key is configured
  if (process.env.GROQ_API_KEY) {
    const messages = buildPromptMessages(question, contextChunks);

    for (const model of GROQ_MODELS) {
      try {
        const response = await axios.post(
          GROQ_URL,
          { model, max_tokens: 2048, messages, stream: true },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              "content-type": "application/json",
            },
            responseType: "stream",
            timeout: 60000,
          }
        );

        let fullAnswer = "";

        response.data.on("data", (chunk) => {
          const lines = chunk.toString().split("\n").filter((l) => l.trim() !== "");
          for (const line of lines) {
            if (line.includes("[DONE]")) continue;
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.replace("data: ", ""));
                const token = parsed.choices?.[0]?.delta?.content || "";
                if (token) {
                  fullAnswer += token;
                  onToken(token);
                }
              } catch (e) {
                // Ignore partial JSON chunks
              }
            }
          }
        });

        response.data.on("end", () => {
          onComplete(cleanResponse(fullAnswer));
        });

        response.data.on("error", (err) => {
          if (onError) onError(err);
        });

        return;
      } catch (err) {
        console.error(`[LLM Stream] Model ${model} failed:`, err.message);
      }
    }
  }

  // 3. Fallback when keys are missing
  const fallbackMsg =
    "⚠️ `GROQ_API_KEY` is not configured in Render Environment Variables. Please set `GROQ_API_KEY` (Free from console.groq.com) to enable streaming answers.";
  onToken(fallbackMsg);
  await onComplete(fallbackMsg);
}