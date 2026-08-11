import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FolderGit2, Plus, GitBranch, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import api from "../api/axios.js";
import { cn } from "../lib/utils.js";

const STATUS_META = {
  pending: { color: "text-ghost border-line", dot: "bg-ghost" },
  indexing: { color: "text-amber border-amber/40 bg-amber/5", dot: "bg-amber animate-pulse" },
  ready: { color: "text-teal border-teal/40 bg-teal/5", dot: "bg-teal" },
  failed: { color: "text-red-400 border-red-400/40 bg-red-400/5", dot: "bg-red-400" },
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
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects);
      setLoaded(true);
    } catch (e) {
      console.error(e);
      setLoaded(true);
    }
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
    <div className="max-w-5xl mx-auto px-6 py-24 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between flex-wrap gap-4 mb-3"
      >
        <h1 className="font-display text-4xl font-semibold tracking-tight">Your projects</h1>
        {projects.length > 0 && (
          <div className="flex items-center gap-2 bg-panel2 border border-line px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-teal shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
            <p className="font-mono text-xs text-paper">
              {readyCount} / {projects.length} ready
            </p>
          </div>
        )}
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="text-ghost mb-12 text-lg"
      >
        Index a GitHub repository, then chat with it once it's ready.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleAddRepo}
        className="relative bg-panel/80 backdrop-blur-md border border-white/5 rounded-2xl p-2 mb-14 shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-transparent opacity-50" />
        <div className="relative grid md:grid-cols-[1fr_1fr_auto] gap-3">
          <div className="relative">
            <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ghost" />
            <input
              placeholder="https://github.com/owner/repo"
              required
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full bg-panel2/50 border border-line rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-mono text-sm transition-all placeholder:text-ghost/50"
            />
          </div>
          <div className="relative">
            <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ghost" />
            <input
              placeholder="Project name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-panel2/50 border border-line rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-sm transition-all placeholder:text-ghost/50"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-paper text-ink font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {busy ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
            ) : (
              <><Plus className="w-4 h-4" /> Index repo</>
            )}
          </button>
        </div>
      </motion.form>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loaded ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-panel/50 border border-line rounded-2xl p-6 h-40 animate-pulse relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-line rounded-3xl bg-panel/30"
        >
          <div className="w-16 h-16 rounded-2xl bg-panel2 border border-line flex items-center justify-center mb-4">
            <FolderGit2 className="w-8 h-8 text-ghost" />
          </div>
          <p className="text-paper font-medium text-lg mb-1">No projects yet</p>
          <p className="text-ghost text-sm">Add a repository above to get started.</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, index) => {
            const meta = STATUS_META[p.status] || STATUS_META.pending;
            const isReady = p.status === "ready";
            
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={p._id}
              >
                <Link
                  to={isReady ? `/projects/${p._id}` : "#"}
                  className={cn(
                    "group block bg-panel/60 backdrop-blur border border-line rounded-2xl p-6 h-full transition-all relative overflow-hidden",
                    isReady ? "hover:border-accent/50 hover:bg-panel hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)] hover:-translate-y-1" : "cursor-default opacity-90"
                  )}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-panel2 border border-line flex items-center justify-center text-sm font-display font-bold text-accent shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                      {initialsFrom(p.name)}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <h3 className="font-display text-lg font-medium truncate text-paper mb-1">{p.name}</h3>
                      <p className="text-ghost text-xs font-mono truncate flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" /> {p.sourceRef}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-mono border rounded-full px-2.5 py-1", meta.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]", meta.dot)} />
                        {p.status}
                      </span>
                      {isReady && (
                        <span className="text-xs font-mono text-ghost bg-panel2 px-2 py-1 rounded border border-line">
                          {p.fileCount} files
                        </span>
                      )}
                    </div>
                    
                    {p.status === "failed" && p.errorMessage && (
                      <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded-lg border border-red-400/20">{p.errorMessage}</p>
                    )}
                    
                    {p.status === "indexing" && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] font-mono text-ghost mb-1">
                          <span>Indexing chunks...</span>
                        </div>
                        <div className="h-1.5 bg-panel2 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-amber rounded-full animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isReady && (
                    <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}