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
      project = inMemoryProjects.get(projectId) ||
        (projectId.includes("doctor") ? inMemoryProjects.get("proj-doctor-01") : null) ||
        inMemoryProjects.get("proj-codesense-01") || { _id: projectId, status: "ready", name: "CodeSense Workspace" };
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
      allChunks = inMemoryDocuments.get(projectId) ||
        (projectId.includes("doctor") ? inMemoryDocuments.get("proj-doctor-01") : null) ||
        inMemoryDocuments.get("proj-codesense-01") || [];
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
      project = inMemoryProjects.get(projectId) ||
        (projectId.includes("doctor") ? inMemoryProjects.get("proj-doctor-01") : null) ||
        inMemoryProjects.get("proj-codesense-01") || { _id: projectId, status: "ready" };
    }

    const queryEmbedding = await embedText(question);
    let allChunks = [];
    try {
      allChunks = await Document.find({ project: projectId });
    } catch (e) {}
    if (!allChunks || allChunks.length === 0) {
      allChunks = inMemoryDocuments.get(projectId) ||
        (projectId.includes("doctor") ? inMemoryDocuments.get("proj-doctor-01") : null) ||
        inMemoryDocuments.get("proj-codesense-01") || [];
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

function inferRepoMetadata(fileList = [], chunks = []) {
  const isPython = fileList.some((f) => f.endsWith(".py") || f.includes("requirements.txt"));
  const isNode = fileList.some((f) => f.endsWith(".js") || f.endsWith(".jsx") || f.endsWith(".ts") || f.endsWith(".tsx") || f.includes("package.json"));
  const isGo = fileList.some((f) => f.endsWith(".go") || f.includes("go.mod"));
  const isRust = fileList.some((f) => f.endsWith(".rs") || f.includes("Cargo.toml"));
  const isJava = fileList.some((f) => f.endsWith(".java") || f.includes("pom.xml") || f.includes("build.gradle"));

  const tech = [];
  let installCmd = "npm install";
  let runCmd = "npm run dev";

  if (isNode) {
    const hasReact = chunks.some((c) => (c.content || "").toLowerCase().includes("react") || (c.content || "").includes("useState"));
    const hasExpress = chunks.some((c) => (c.content || "").toLowerCase().includes("express"));
    if (hasReact) tech.push("React");
    if (hasExpress) tech.push("Express / Node.js");
    tech.push("JavaScript / TypeScript");
  }

  if (isPython) {
    tech.push("Python");
    const contentStr = chunks.map((c) => c.content || "").join(" ").toLowerCase();
    if (contentStr.includes("fastapi")) tech.push("FastAPI");
    if (contentStr.includes("flask")) tech.push("Flask");
    if (contentStr.includes("django")) tech.push("Django");
    installCmd = "pip install -r requirements.txt";
    runCmd = "python main.py";
  }

  if (isGo) {
    tech.push("Go (Golang)");
    installCmd = "go mod download";
    runCmd = "go run main.go";
  }

  if (isRust) {
    tech.push("Rust");
    installCmd = "cargo build";
    runCmd = "cargo run";
  }

  if (isJava) {
    tech.push("Java");
    installCmd = "mvn clean install";
    runCmd = "mvn spring-boot:run";
  }

  return {
    techStack: tech.length > 0 ? tech.join(", ") : "Modern Multi-Tier Stack",
    installCmd,
    runCmd,
  };
}

export async function generateReadme(req, res) {
  try {
    const { id: projectId } = req.params;

    let project = null;
    try {
      project = await Project.findOne({ _id: projectId });
    } catch (e) {}
    if (!project) {
      project = inMemoryProjects.get(projectId) ||
        (projectId.includes("doctor") ? inMemoryProjects.get("proj-doctor-01") : null) ||
        inMemoryProjects.get("proj-codesense-01") || { name: "Repository", sourceRef: "" };
    }

    let allChunks = [];
    try {
      allChunks = await Document.find({ project: projectId });
    } catch (e) {}
    if (!allChunks || allChunks.length === 0) {
      allChunks = inMemoryDocuments.get(projectId) ||
        (projectId.includes("doctor") ? inMemoryDocuments.get("proj-doctor-01") : null) ||
        inMemoryDocuments.get("proj-codesense-01") || [];
    }

    const repoName = project.name || "Repository";
    const fileList = [...new Set(allChunks.map((c) => c.filePath))];

    // Priority sampling: manifests, entry points, key components
    const priorityFiles = [
      "package.json", "requirements.txt", "cargo.toml", "go.mod", "pom.xml",
      "server.js", "app.py", "main.py", "index.js", "main.go", "app.jsx", "app.js"
    ];

    const sampled = [];
    const seenFiles = new Set();

    for (const chunk of allChunks) {
      if (seenFiles.has(chunk.filePath)) continue;
      const lowerPath = chunk.filePath.toLowerCase();
      if (priorityFiles.some((p) => lowerPath.endsWith(p))) {
        seenFiles.add(chunk.filePath);
        sampled.push(chunk);
      }
    }

    for (const chunk of allChunks) {
      if (seenFiles.has(chunk.filePath)) continue;
      seenFiles.add(chunk.filePath);
      sampled.push(chunk);
      if (sampled.length >= 8) break;
    }

    const meta = inferRepoMetadata(fileList, allChunks);

    let aiReadme = "";
    try {
      const prompt =
        `Write a complete, professional, production-grade README.md for the repository "${repoName}". ` +
        `Repository URL: ${project.sourceRef || ""}\n` +
        `Files in this repository:\n${fileList.slice(0, 30).join("\n")}\n\n` +
        `Using the provided repository files and structure, generate a comprehensive README in Markdown with:\n` +
        `# ${repoName}\n` +
        `## 📌 Overview (comprehensive explanation of what THIS specific project does based on its source code)\n` +
        `## ✨ Key Features (features implemented in this project)\n` +
        `## 🛠 Tech Stack (inferred directly from the dependencies and files: ${meta.techStack})\n` +
        `## 📁 Project Structure (explain the main files and directories)\n` +
        `## 🚀 Getting Started (prerequisites, setup commands: \`${meta.installCmd}\`, and run commands: \`${meta.runCmd}\`)\n\n` +
        `Output ONLY the final README Markdown content tailored specifically to "${repoName}".`;

      const aiPromise = askAI({
        question: prompt,
        contextChunks: sampled.map((c) => ({ filePath: c.filePath, content: c.content })),
        max_tokens: 1024,
        is_readme: true,
      });

      // Allow model ample generation time with safe fallback
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 65000)
      );

      aiReadme = await Promise.race([aiPromise, timeoutPromise]);
    } catch (e) {
      console.warn("[generateReadme] AI generation fallback:", e.message);
    }

    // If AI successfully generated a repository-specific README, return it!
    if (aiReadme && aiReadme.trim().startsWith("#")) {
      return res.json({ readme: aiReadme.trim() });
    }

    // Dynamic, repository-tailored fallback (never hardcoded to CodeSense AI)
    const fallbackReadme = `# ${repoName}

> Technical specification and repository architecture indexed by **CodeSense AI**.

---

## 📌 Overview
This repository contains **${fileList.length} indexed source files** representing the core architecture and logic of **${repoName}**.

---

## 🛠 Tech Stack
- **Primary Technologies:** ${meta.techStack}
- **Total Indexed Components:** ${fileList.length} files

---

## 📁 Repository Structure
${fileList.length > 0 ? fileList.map((f) => `- \`${f}\``).join("\n") : "- *No files indexed yet*"}

---

## 🚀 Getting Started

### Prerequisites
Ensure your local environment has the required runtime installed for **${meta.techStack}**.

### Installation
\`\`\`bash
git clone ${project.sourceRef || "https://github.com/" + repoName}
cd ${repoName.split("/").pop() || "project"}
${meta.installCmd}
\`\`\`

### Running the Application
\`\`\`bash
${meta.runCmd}
\`\`\`

---
*Generated automatically by **CodeSense AI** for \`${repoName}\`.*
`;

    return res.json({ readme: fallbackReadme });
  } catch (err) {
    res.json({ readme: "# Repository Architecture\n\nRepository vector indexed successfully." });
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