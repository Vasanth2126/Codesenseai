# CodeSense AI

AI-powered software engineering assistant. Point it at a GitHub repository and it
indexes the codebase (RAG: chunk → embed → retrieve) so you can ask natural-language
questions and get answers grounded in the actual source, not generic knowledge.

Built on the MERN stack: MongoDB, Express, React, Node.js.

## How it works

1. You submit a GitHub repo URL (or upload files).
2. The backend pulls every indexable file (code, docs, config — skips
   `node_modules`, build output, lockfiles), splits each into overlapping chunks,
   and embeds each chunk.
3. When you ask a question, the backend embeds the question, retrieves the most
   similar chunks (cosine similarity), and sends them to Claude as context.
4. Claude answers using only that retrieved context and cites the file paths it drew from.

This is a real, working RAG pipeline — not a mock. The embedding step falls back to a
local hashing embedding if no `VOYAGE_API_KEY` is set, so the app still runs end-to-end
without any external key, just with weaker retrieval quality.

## Project structure

```
codesense-ai/
├── server/              Express API
│   ├── config/db.js     MongoDB connection
│   ├── models/          User, Project, Document (chunks), ChatMessage
│   ├── controllers/     auth, project ingestion + indexing, chat/RAG
│   ├── routes/          /api/auth, /api/projects, /api/chat
│   ├── utils/           GitHub fetcher, chunker, embeddings + Claude call
│   └── server.js
└── client/              React (Vite) + Tailwind
    └── src/
        ├── pages/        Landing, Login, Signup, Dashboard, ProjectChat
        ├── components/   Navbar, ProtectedRoute
        ├── context/      AuthContext (JWT session)
        └── api/axios.js
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — local Mongo (`mongodb://127.0.0.1:27017/codesense-ai`) or an Atlas connection string
- `JWT_SECRET` — any long random string
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com — required for real answers
- `VOYAGE_API_KEY` — optional, improves retrieval quality (https://www.voyageai.com)
- `GITHUB_TOKEN` — optional, raises GitHub API rate limits for larger repos

```bash
npm run dev
```

API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App runs on `http://localhost:5173` and proxies `/api` to the backend.

## Notes on scaling this further

- **Vector storage**: chunks + embeddings currently live in a MongoDB collection with
  in-memory cosine similarity. Fine for small/medium repos; swap in Pinecone, Qdrant,
  or MongoDB Atlas Vector Search for larger ones.
- **Indexing**: currently in-process and fire-and-forget. For large repos or many
  concurrent users, move indexing to a job queue (BullMQ + Redis) with a worker process.
  Wire the `Project.status` transitions to that instead.
- **Uploads**: `/api/projects/upload` accepts raw files via multer. Add a `.zip`
  extraction step (e.g. `adm-zip`, already in `package.json`) if you want folder uploads.
- **Auth**: JWT in localStorage is fine for a demo; move to httpOnly cookies for production.

## Roadmap ideas from the original brief

- PR review endpoint (diff in, structured review out)
- UML/architecture diagram generation from the indexed structure
- Security vulnerability scanning pass
- README/API doc generation as a one-click export
