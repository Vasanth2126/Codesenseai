import axios from "axios";
import { isIndexable } from "./chunker.js";

// Parses a GitHub URL like https://github.com/owner/repo into { owner, repo }.
export function parseGithubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?\/?$/);
  if (!match) throw new Error("Invalid GitHub repository URL");
  return { owner: match[1], repo: match[2] };
}

function ghHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

// Fetches the full recursive file tree for a repo's default branch, then
// downloads content only for indexable text files (skips binaries, node_modules, etc).
export async function fetchRepoFiles(owner, repo) {
  const repoInfoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: ghHeaders(),
  });
  const defaultBranch = repoInfoRes.data.default_branch;

  const treeRes = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    { headers: ghHeaders() }
  );

  const indexableFiles = treeRes.data.tree.filter(
    (item) => item.type === "blob" && isIndexable(item.path)
  );

  const files = [];
  for (const file of indexableFiles) {
    try {
      const blobRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${defaultBranch}`,
        { headers: ghHeaders() }
      );
      const content = Buffer.from(blobRes.data.content, "base64").toString("utf-8");
      files.push({ path: file.path, content });
    } catch {
      // Skip files that fail to fetch (e.g. too large, LFS pointers)
      continue;
    }
  }

  return files;
}
