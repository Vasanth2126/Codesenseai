import axios from "axios";

export function getCustomAIUrl() {
  if (process.env.CODESENSE_AI_URL && process.env.CODESENSE_AI_URL.trim()) {
    return process.env.CODESENSE_AI_URL.trim();
  }
  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:8000/generate";
  }
  return null;
}

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
    "You are CodeSense AI, an expert software architecture and engineering assistant. " +
    "Analyze the codebase thoroughly and provide a rich, comprehensive, and well-structured explanation in clean Markdown. " +
    "Use clear headings (###), numbered steps, and bullet points. " +
    "Always cite specific source files and components with backticks (`path/to/file`). " +
    "Explain the complete end-to-end flow and architecture in detail with code examples where helpful. " +
    "If the repository lacks direct context for the question, state what is present in the codebase and explain the standard implementation pattern.";

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
async function callCustomAIService(question, contextChunks = [], options = {}) {
  const url = getCustomAIUrl();
  if (!url) return null;
  const context = buildContext(contextChunks);

  const response = await axios.post(
    url,
    {
      question,
      context,
      stream: false,
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.45,
    },
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
  const customUrl = getCustomAIUrl();
  let customError = null;

  // 1. Try Custom Python AI Service if configured
  if (customUrl) {
    try {
      const customAnswer = await callCustomAIService(question, contextChunks);
      if (customAnswer) return customAnswer;
    } catch (err) {
      customError = err.response?.data?.detail || err.message;
      console.warn(`[LLM] Custom fine-tuned AI at ${customUrl} failed:`, customError);
    }
  }

  // 2. Try Groq API as optional fallback if configured
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    const messages = buildPromptMessages(question, contextChunks);
    let lastError;
    for (const model of GROQ_MODELS) {
      try {
        const response = await axios.post(
          GROQ_URL,
          { model, max_tokens: 2048, messages },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`,
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

  // 3. Informative, honest diagnostics when no LLM provider responds
  if (customUrl) {
    return (
      `⚠️ **Could not connect to your Fine-Tuned Model**\n\n` +
      `Failed to reach AI service at \`${customUrl}\`\n` +
      `**Error:** ${customError || "Connection refused / tunnel offline"}\n\n` +
      `**To fix:** Ensure your Python AI service is running (\`python main.py\`) and your tunnel or \`CODESENSE_AI_URL\` is active.`
    );
  }

  return (
    "⚠️ **AI Service Not Configured**\n\n" +
    "Please set `CODESENSE_AI_URL` to your local or tunneled AI service (e.g. `http://127.0.0.1:8000/generate`), or add `GROQ_API_KEY` in environment variables."
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
  const customUrl = getCustomAIUrl();
  let customServiceError = null;

  // 1. Try Custom Fine-Tuned AI service first
  if (customUrl) {
    try {
      const context = buildContext(contextChunks);
      const response = await axios.post(
        customUrl,
        { question, context, stream: true, max_tokens: 1200, temperature: 0.45 },
        {
          headers: { "Content-Type": "application/json" },
          responseType: "stream",
          timeout: 120000,
        }
      );

      const contentType = response.headers["content-type"] || "";

      // Real-time SSE streaming from Python service
      if (contentType.includes("text/event-stream")) {
        let fullAnswer = "";

        await new Promise((resolve, reject) => {
          response.data.on("data", (chunk) => {
            const lines = chunk.toString().split("\n").filter((l) => l.trim() !== "");
            for (const line of lines) {
              if (line.includes("[DONE]")) continue;
              if (line.startsWith("data: ")) {
                try {
                  const parsed = JSON.parse(line.replace("data: ", ""));
                  const token = parsed.token || parsed.answer || "";
                  if (token) {
                    fullAnswer += token;
                    onToken(token);
                  }
                } catch (e) {
                  // Partial chunk buffer skip
                }
              }
            }
          });

          response.data.on("end", async () => {
            await onComplete(cleanResponse(fullAnswer));
            resolve();
          });

          response.data.on("error", (err) => {
            reject(err);
          });
        });

        return;
      } else {
        // Fallback for non-streaming response from custom service
        const answer = await callCustomAIService(question, contextChunks);
        if (answer) {
          onToken(answer);
          return await onComplete(answer);
        }
      }
    } catch (err) {
      customServiceError = err.response?.data?.detail || err.message;
      console.warn(`[LLM Stream] Custom fine-tuned AI at ${customUrl} failed:`, customServiceError);
    }
  }

  // 2. Try Groq API as optional fallback IF GROQ_API_KEY is configured
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    const messages = buildPromptMessages(question, contextChunks);

    for (const model of GROQ_MODELS) {
      try {
        const response = await axios.post(
          GROQ_URL,
          { model, max_tokens: 2048, messages, stream: true },
          {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`,
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
        console.error(`[LLM Stream] Groq model ${model} failed:`, err.message);
      }
    }
  }

  // 3. Clear, diagnostic guidance for user
  let failureMsg = "";
  if (customUrl) {
    failureMsg =
      `⚠️ **Fine-Tuned AI Service Offline or Unreachable**\n\n` +
      `CodeSense AI attempted to query your fine-tuned model at:\n\`${customUrl}\`\n\n` +
      `**Status:** ${customServiceError || "Connection refused / tunnel expired"}\n\n` +
      `**How to resolve:**\n` +
      `1. **Start your local AI model:**\n` +
      `   \`\`\`bash\n` +
      `   cd codesense-ai/ai-service\n` +
      `   .\\venv\\Scripts\\python.exe main.py\n` +
      `   \`\`\`\n` +
      `2. **If your web app is deployed on Render/Vercel**, expose your local GPU model via Cloudflare Tunnel:\n` +
      `   \`\`\`bash\n` +
      `   .\\cloudflared.exe tunnel --url http://127.0.0.1:8000\n` +
      `   \`\`\`\n` +
      `   Then update \`CODESENSE_AI_URL\` in your Render Environment settings to the new URL: \`https://<tunnel-id>.trycloudflare.com/generate\`.\n\n` +
      `*(Note: If you want a cloud backup, you can also set \`GROQ_API_KEY\` in your environment settings).*`;
  } else {
    failureMsg =
      `⚠️ **No AI Backend Configured**\n\n` +
      `To use your fine-tuned Qwen model:\n` +
      `1. Run \`cd codesense-ai/ai-service && .\\venv\\Scripts\\python.exe main.py\`\n` +
      `2. Set \`CODESENSE_AI_URL=http://127.0.0.1:8000/generate\` (for local dev) or your Cloudflare tunnel URL (for Render/Vercel).`;
  }

  onToken(failureMsg);
  await onComplete(failureMsg);
}