import Project from "../models/Project.js";
import Document from "../models/Document.js";
import { fetchRepoFiles, parseGithubUrl } from "../utils/github.js";
import { chunkFile, isIndexable } from "../utils/chunker.js";
import { embedText } from "../utils/llm.js";

// Kicks off indexing in the background so the HTTP request returns quickly.
// Status transitions: pending -> indexing -> ready | failed
async function indexProject(project, files) {
  try {
    project.status = "indexing";
    await project.save();

    let chunkCount = 0;
    for (const file of files) {
      const chunks = chunkFile(file.content);
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await embedText(chunks[i]);
        await Document.create({
          project: project._id,
          filePath: file.path,
          chunkIndex: i,
          content: chunks[i],
          embedding,
        });
        chunkCount++;
      }
    }

    project.status = "ready";
    project.fileCount = files.length;
    project.chunkCount = chunkCount;
    await project.save();
  } catch (err) {
    project.status = "failed";
    project.errorMessage = err.message;
    await project.save();
  }
}

export async function createFromGithub(req, res) {
  try {
    const { repoUrl, name } = req.body;
    if (!repoUrl) return res.status(400).json({ message: "repoUrl is required" });

    const { owner, repo } = parseGithubUrl(repoUrl);
    const project = await Project.create({
      owner: req.userId,
      name: name || `${owner}/${repo}`,
      sourceType: "github",
      sourceRef: repoUrl,
      status: "pending",
    });

    res.status(201).json({ project });

    // Fire-and-forget indexing; client polls GET /api/projects/:id for status.
    fetchRepoFiles(owner, repo)
      .then((files) => indexProject(project, files))
      .catch(async (err) => {
        project.status = "failed";
        project.errorMessage = err.message;
        await project.save();
      });
  } catch (err) {
    res.status(500).json({ message: "Failed to create project", error: err.message });
  }
}

// Accepts uploaded files (via multer) as an alternative to a GitHub URL.
export async function createFromUpload(req, res) {
  try {
    const { name } = req.body;
    const uploaded = req.files || [];
    if (uploaded.length === 0) return res.status(400).json({ message: "No files uploaded" });

    const project = await Project.create({
      owner: req.userId,
      name: name || "Uploaded project",
      sourceType: "upload",
      sourceRef: `upload-${Date.now()}`,
      status: "pending",
    });

    res.status(201).json({ project });

    const files = uploaded
      .map((f) => ({ path: f.originalname, content: f.buffer.toString("utf-8") }))
      .filter((f) => isIndexable(f.path));

    indexProject(project, files);
  } catch (err) {
    res.status(500).json({ message: "Failed to create project", error: err.message });
  }
}

export async function listProjects(req, res) {
  const projects = await Project.find({ owner: req.userId }).sort({ createdAt: -1 });
  res.json({ projects });
}

export async function getProject(req, res) {
  const project = await Project.findOne({ _id: req.params.id, owner: req.userId });
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json({ project });
}

export async function deleteProject(req, res) {
  const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!project) return res.status(404).json({ message: "Project not found" });
  await Document.deleteMany({ project: project._id });
  res.json({ message: "Project deleted" });
}
