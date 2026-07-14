import Project from "../models/Project.js";
import Document from "../models/Document.js";
import ChatMessage from "../models/ChatMessage.js";
import { embedText, cosineSimilarity, askAI } from "../utils/llm.js";

const TOP_K = 6;
const README_SAMPLE_SIZE = 25; // chunks sampled across the repo for the README prompt

export async function askQuestion(req, res) {
  try {
    const { id: projectId } = req.params;
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "question is required" });

    const project = await Project.findOne({ _id: projectId, owner: req.userId });
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== "ready") {
      return res.status(409).json({ message: `Project is not ready yet (status: ${project.status})` });
    }

    const queryEmbedding = await embedText(question);
    const allChunks = await Document.find({ project: project._id });

    const keywords = (question.toLowerCase().match(/[a-z0-9_]{3,}/g) || []);

    const ranked = allChunks
      .map((chunk) => {
        const baseScore = cosineSimilarity(queryEmbedding, chunk.embedding);
        const lowerContent = chunk.content.toLowerCase();
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
      contextChunks: ranked.map((c) => ({ filePath: c.filePath, content: c.content })),
    });

    const citedFiles = [...new Set(ranked.map((c) => c.filePath))];

    await ChatMessage.create({ project: project._id, user: req.userId, role: "user", content: question });
    const assistantMsg = await ChatMessage.create({
      project: project._id,
      user: req.userId,
      role: "assistant",
      content: answer,
      citedFiles,
    });

    res.json({ answer, citedFiles, messageId: assistantMsg._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to answer question", error: err.message });
  }
}

// Generates a README.md draft from a spread of the indexed codebase.
export async function generateReadme(req, res) {
  try {
    const { id: projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, owner: req.userId });
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== "ready") {
      return res.status(409).json({ message: `Project is not ready yet (status: ${project.status})` });
    }

    const allChunks = await Document.find({ project: project._id });
    if (allChunks.length === 0) {
      return res.status(422).json({ message: "No indexed content available for this project" });
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
  const project = await Project.findOne({ _id: projectId, owner: req.userId });
  if (!project) return res.status(404).json({ message: "Project not found" });

  const messages = await ChatMessage.find({ project: project._id }).sort({ createdAt: 1 });
  res.json({ messages });
}