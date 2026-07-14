import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const STATUS_META = {
  pending: { color: "text-ghost border-line", dot: "bg-ghost" },
  indexing: { color: "text-amber border-amber/40", dot: "bg-amber animate-pulse" },
  ready: { color: "text-teal border-teal/40", dot: "bg-teal" },
  failed: { color: "text-red-400 border-red-400/40", dot: "bg-red-400" },
};

function initialsFrom(name) {
  return (name || "?")
    .split(/[\s/_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadProjects() {
    const { data } = await api.get("/projects");
    setProjects(data.projects);
    setLoaded(true);
  }

  useEffect(() => {
    loadProjects();
    const interval = setInterval(loadProjects, 4000);
    return () => clearInterval(interval);
  }, []);

  async function handleAddRepo(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/projects/github", { repoUrl, name });
      setRepoUrl("");
      setName("");
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add repository");
    } finally {
      setBusy(false);
    }
  }

  const readyCount = projects.filter((p) => p.status === "ready").length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-2">
        <h1 className="font-display text-3xl">Your projects</h1>
        {projects.length > 0 && (
          <p className="font-mono text-xs text-ghost">
            {readyCount}/{projects.length} ready
          </p>
        )}
      </div>
      <p className="text-ghost mb-10">Index a GitHub repository, then chat with it once it's ready.</p>

      <form
        onSubmit={handleAddRepo}
        className="bg-panel border border-line rounded-xl p-6 mb-12 grid md:grid-cols-[1fr_1fr_auto] gap-4 shadow-lg"
      >
        <input
          placeholder="https://github.com/owner/repo"
          required
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="bg-panel2 border border-line rounded-md px-3 py-2.5 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber/30 font-mono text-sm transition"
        />
        <input
          placeholder="Project name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-panel2 border border-line rounded-md px-3 py-2.5 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber/30 text-sm transition"
        />
        <button
          type="submit"
          disabled={busy}
          className="px-5 py-2.5 rounded-md bg-amber text-ink font-semibold hover:bg-amber/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 whitespace-nowrap"
        >
          {busy ? "Adding..." : "Index repo"}
        </button>
      </form>
      {error && <p className="text-sm text-red-400 -mt-8 mb-8">{error}</p>}

      {!loaded ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-panel border border-line rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line rounded-xl">
          <p className="text-ghost font-mono text-sm mb-1">No projects yet</p>
          <p className="text-ghost text-xs">Add a repository above to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const meta = STATUS_META[p.status] || STATUS_META.pending;
            return (
              <Link
                key={p._id}
                to={p.status === "ready" ? `/projects/${p._id}` : "#"}
                className={`group bg-panel border border-line rounded-xl p-5 transition-all ${
                  p.status === "ready"
                    ? "hover:border-amber/40 hover:-translate-y-0.5 hover:shadow-lg"
                    : "opacity-80 cursor-default"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-panel2 border border-line flex items-center justify-center text-xs font-mono text-teal shrink-0">
                    {initialsFrom(p.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg truncate">{p.name}</h3>
                      <span className={`shrink-0 flex items-center gap-1.5 text-xs font-mono border rounded-full px-2 py-0.5 ${meta.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {p.status}
                      </span>
                    </div>
                    <p className="text-ghost text-xs font-mono truncate">{p.sourceRef}</p>
                  </div>
                </div>
                {p.status === "ready" && (
                  <p className="text-ghost text-xs pl-12">{p.fileCount} files · {p.chunkCount} indexed chunks</p>
                )}
                {p.status === "failed" && p.errorMessage && (
                  <p className="text-red-400 text-xs pl-12">{p.errorMessage}</p>
                )}
                {p.status === "indexing" && (
                  <div className="pl-12">
                    <div className="h-1 bg-panel2 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-amber rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
                    </div>
                  </div>
                )}
                {p.status === "ready" && (
                  <span className="block text-right text-xs text-amber opacity-0 group-hover:opacity-100 transition mt-2">
                    Open chat &rarr;
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}