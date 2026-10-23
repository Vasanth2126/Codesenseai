import mongoose from "mongoose";
import Project from "../models/Project.js";
import Document from "../models/Document.js";
import ChatMessage from "../models/ChatMessage.js";
import { embedText, cosineSimilarity, askAI, streamAI } from "../utils/llm.js";
import { inMemoryProjects, inMemoryDocuments } from "./projectController.js";

const TOP_K = 6;
const README_SAMPLE_SIZE = 8;

function buildFileListChunk(allChunks) {
  const paths = [...new Set(allChunks.map((c) => c.filePath))].sort();
  if (paths.length === 0) return null;
  return {
    filePath: "PROJECT_FILE_LIST",
    content: "Files in this project (indexed files only):\n" + paths.slice(0, 300).join("\n"),
  };
}

async function safeSaveMessage(data) {
  try {
    if (mongoose.connection.readyState === 1) {
      return await ChatMessage.create(data);
    }
  } catch (err) {}
  return { _id: `msg-${Date.now()}`, ...data };
}

export async function streamQuestion(req, res) {
  const { id: projectId } = req.params;
  const { question } = req.body;

  if (!question) return res.status(400).json({ message: "question is required" });

  try {
    let project = null;
    try {
      project = await Project.findOne({ _id: projectId });
    } catch (e) {}
    if (!project) {
      project = inMemoryProjects.get(projectId) || { _id: projectId, status: "ready", name: "CodeSense Workspace" };
    }

    // Set up SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    const queryEmbedding = await embedText(question);
    
    let allChunks = [];
    try {
      allChunks = await Document.find({ project: projectId });
    } catch (e) {}
    if (!allChunks || allChunks.length === 0) {
      allChunks = inMemoryDocuments.get(projectId) || inMemoryDocuments.get("proj-codesense-01") || [];
    }

    const keywords = (question.toLowerCase().match(/[a-z0-9_]{3,}/g) || []);

    const ranked = allChunks
      .map((chunk) => {
        const baseScore = chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0.5;
        const lowerContent = (chunk.content || "").toLowerCase();
        const matchBoost = keywords.reduce(
          (sum, kw) => sum + (lowerContent.includes(kw) ? 0.05 : 0),
          0
        );
        return { chunk, score: baseScore + matchBoost };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K)
      .map((r) => r.chunk);

    const citedFiles = [...new Set(ranked.map((c) => c.filePath))];

    // Send metadata immediately to client
    res.write(`data: ${JSON.stringify({ type: "meta", citedFiles })}\n\n`);

    await safeSaveMessage({ project: project._id, user: req.userId || "demo-user", role: "user", content: question });

    await streamAI({
      question,
      contextChunks: [
        buildFileListChunk(allChunks),
        ...ranked.map((c) => ({ filePath: c.filePath, content: c.content })),
      ].filter(Boolean),
      onToken: (token) => {
        res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
      },
      onComplete: async (fullAnswer) => {
        const assistantMsg = await safeSaveMessage({
          project: project._id,
          user: req.userId || "demo-user",
          role: "assistant",
          content: fullAnswer,
          citedFiles,
        });
        res.write(`data: ${JSON.stringify({ type: "done", messageId: assistantMsg._id })}\n\n`);
        res.end();
      },
      onError: (err) => {
        res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
        res.end();
      },
    });
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to answer question", error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
      res.end();
    }
  }
}

export async function askQuestion(req, res) {
  try {
    const { id: projectId } = req.params;
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "question is required" });

    let project = null;
    try {
      project = await Project.findOne({ _id: projectId });
    } catch (e) {}
    if (!project) {
      project = inMemoryProjects.get(projectId) || { _id: projectId, status: "ready" };
    }

    const queryEmbedding = await embedText(question);
    let allChunks = [];
    try {
      allChunks = await Document.find({ project: projectId });
    } catch (e) {}
    if (!allChunks || allChunks.length === 0) {
      allChunks = inMemoryDocuments.get(projectId) || inMemoryDocuments.get("proj-codesense-01") || [];
    }

    const keywords = (question.toLowerCase().match(/[a-z0-9_]{3,}/g) || []);

    const ranked = allChunks
      .map((chunk) => {
        const baseScore = chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0.5;
        const lowerContent = (chunk.content || "").toLowerCase();
        const matchBoost = keywords.reduce(
          (sum, kw) => sum + (lowerContent.includes(kw) ? 0.05 : 0),
          0
        );
        return { chunk, score: baseScore + matchBoost };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K)
      .map((r) => r.chunk);

    const answer = await askAI({
      question,
      contextChunks: [
        buildFileListChunk(allChunks),
        ...ranked.map((c) => ({ filePath: c.filePath, content: c.content })),
      ].filter(Boolean),
    });

    const citedFiles = [...new Set(ranked.map((c) => c.filePath))];

    await safeSaveMessage({ project: project._id, user: req.userId || "demo-user", role: "user", content: question });
    const assistantMsg = await safeSaveMessage({
      project: project._id,
      user: req.userId || "demo-user",
      role: "assistant",
      content: answer,
      citedFiles,
    });

    res.json({ answer, citedFiles, messageId: assistantMsg._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to answer question", error: err.message });
  }
}

export async function generateReadme(req, res) {
  try {
    const { id: projectId } = req.params;
    let allChunks = [];
    try {
      allChunks = await Document.find({ project: projectId });
    } catch (e) {}
    if (!allChunks || allChunks.length === 0) {
      allChunks = inMemoryDocuments.get(projectId) || inMemoryDocuments.get("proj-codesense-01") || [];
    }

    const seenFiles = new Set();
    const sampled = [];
    for (const chunk of allChunks) {
      if (seenFiles.has(chunk.filePath)) continue;
      seenFiles.add(chunk.filePath);
      sampled.push(chunk);
      if (sampled.length >= README_SAMPLE_SIZE) break;
    }

    const readme = await askAI({
      question:
        "Write a professional README.md for this project. Include: a one-paragraph " +
        "overview of what it does, a tech stack list inferred from the files, setup/run " +
        "instructions if inferable, and a short project structure summary. Output only " +
        "the README content in Markdown, no commentary before or after it.",
      contextChunks: sampled.map((c) => ({ filePath: c.filePath, content: c.content })),
    });

    res.json({ readme });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate README", error: err.message });
  }
}

export async function getHistory(req, res) {
  const { id: projectId } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await ChatMessage.find({ project: projectId }).sort({ createdAt: 1 });
      if (messages && messages.length > 0) return res.json({ messages });
    }
  } catch (err) {}

  res.json({
    messages: [
      {
        role: "assistant",
        content: "👋 Welcome to **CodeSense AI**! I've indexed your repository. Ask any question about your architecture, dependencies, or codebase.",
        citedFiles: ["server/server.js", "client/src/App.jsx"],
      },
    ],
  });
}