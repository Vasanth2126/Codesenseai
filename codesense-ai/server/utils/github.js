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
// downloads content in parallel for indexable text files (skips binaries, node_modules, etc).
export async function fetchRepoFiles(owner, repo) {
  const repoInfoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: ghHeaders(),
    timeout: 10000,
  });
  const defaultBranch = repoInfoRes.data?.default_branch || "main";

  const treeRes = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    { headers: ghHeaders(), timeout: 12000 }
  );

  const indexableFiles = (treeRes.data?.tree || []).filter(
    (item) => item.type === "blob" && isIndexable(item.path)
  );

  // Fetch files in parallel using raw.githubusercontent.com for maximum speed
  const files = await Promise.all(
    indexableFiles.slice(0, 80).map(async (file) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`;
        const res = await axios.get(rawUrl, {
          timeout: 10000,
          transformResponse: [(data) => data],
        });
        const content = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
        return { path: file.path, content };
      } catch {
        return null;
      }
    })
  );

  return files.filter(Boolean);
}
