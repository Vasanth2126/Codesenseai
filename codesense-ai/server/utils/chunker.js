// Splits file content into overlapping chunks suitable for embedding + retrieval.
// Simple line-based chunker: groups ~40 lines per chunk with 5 lines of overlap,
// which keeps most function/class bodies intact for typical source files.
export function chunkFile(content, { linesPerChunk = 40, overlap = 5 } = {}) {
  const lines = content.split("\n");
  const chunks = [];
  let start = 0;

  while (start < lines.length) {
    const end = Math.min(start + linesPerChunk, lines.length);
    const chunkText = lines.slice(start, end).join("\n").trim();
    if (chunkText.length > 0) chunks.push(chunkText);
    if (end === lines.length) break;
    start = end - overlap;
  }

  return chunks;
}

// Extensions worth indexing. Binary/lock/build files are skipped.
const INDEXABLE_EXTENSIONS = [
  ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go", ".rb", ".php",
  ".c", ".cpp", ".h", ".hpp", ".cs", ".rs", ".md", ".json", ".yml", ".yaml",
  ".html", ".css", ".sql", ".env.example",
];

const EXCLUDED_PATH_PARTS = ["node_modules", ".git", "dist", "build", "coverage", "package-lock.json"];

export function isIndexable(filePath) {
  if (EXCLUDED_PATH_PARTS.some((part) => filePath.includes(part))) return false;
  return INDEXABLE_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}
