import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FolderGit2, Plus, GitBranch, ArrowRight, Loader2, AlertCircle, Sparkles, 
  Search, Trash2, CheckCircle2, Cpu, FileCode2, Clock, RefreshCw, ExternalLink 
} from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { cn } from "../lib/utils.js";

const SAMPLE_REPOS = [
  { name: "Vasanth2126/taskflow", url: "https://github.com/Vasanth2126/taskflow" },
  { name: "expressjs/express", url: "https://github.com/expressjs/express" },
  { name: "facebook/react", url: "https://github.com/facebook/react" }
];

const STATUS_META = {
  pending: { color: "text-ghost border-line bg-panel", dot: "bg-ghost", label: "Pending" },
  indexing: { color: "text-amber border-amber/40 bg-amber/10", dot: "bg-amber animate-pulse", label: "Indexing Chunks" },
  ready: { color: "text-teal border-teal/40 bg-teal/10", dot: "bg-teal shadow-[0_0_8px_rgba(20,184,166,0.8)]", label: "Ready to Query" },
  failed: { color: "text-red-400 border-red-500/40 bg-red-500/10", dot: "bg-red-400", label: "Failed" },
};

function initialsFrom(name) {
  return (name || "?")
    .split(/[\s/_-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, type: "spring", stiffness: 300, damping: 24 },
  }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadProjects() {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects || []);
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
    e?.preventDefault();
    if (!repoUrl.trim()) return;
    setError("");
    setBusy(true);
    try {
      await api.post("/projects/github", { repoUrl, name });
      setRepoUrl("");
      setName("");
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add repository.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteProject(id, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this indexed project workspace?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (err) {
      alert("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sourceRef.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const readyCount = projects.filter((p) => p.status === "ready").length;
  const totalFiles = projects.reduce((sum, p) => sum + (p.fileCount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-24 min-h-screen relative selection:bg-accent/30 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[130px] animate-blob" />
        <div className="absolute top-60 right-1/4 w-[450px] h-[450px] bg-teal/[0.04] rounded-full blur-[130px] animate-blob" style={{ animationDelay: "3s" }} />
      </div>

      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-line/60 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-teal bg-teal/10 border border-teal/20 rounded-full px-3 py-1 mb-3">
            <Clock className="w-3.5 h-3.5" /> WORKSPACE OVERVIEW
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-paper">
            {getTimeGreeting()}, <span className="bg-gradient-to-r from-accent via-teal to-amber bg-clip-text text-transparent">{user?.name || "Developer"}</span>
          </h1>
          <p className="text-ghost text-sm sm:text-base mt-1">
            Index GitHub repositories to enable instant natural-language Q&A and auto-generated READMEs.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="bg-panel2/80 border border-line px-4 py-2.5 rounded-2xl backdrop-blur-md flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-ghost/70 uppercase">Workspaces</p>
              <p className="text-base font-bold font-display text-paper">{projects.length}</p>
            </div>
          </div>

          <div className="bg-panel2/80 border border-line px-4 py-2.5 rounded-2xl backdrop-blur-md flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-ghost/70 uppercase">Ready Repos</p>
              <p className="text-base font-bold font-display text-teal">{readyCount}</p>
            </div>
          </div>

          <div className="bg-panel2/80 border border-line px-4 py-2.5 rounded-2xl backdrop-blur-md flex items-center gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center text-amber">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-ghost/70 uppercase">Files Indexed</p>
              <p className="text-base font-bold font-display text-amber">{totalFiles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Add Repo Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-panel2/90 border border-line rounded-3xl p-6 mb-12 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-paper flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent" /> Index New Repository
          </h2>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-mono text-ghost/60">Quick Samples:</span>
            {SAMPLE_REPOS.map((sr) => (
              <button
                key={sr.name}
                type="button"
                onClick={() => { setRepoUrl(sr.url); setName(sr.name); }}
                className="text-[10px] font-mono text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 px-2 py-0.5 rounded transition"
              >
                {sr.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddRepo} className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
          <div className="relative">
            <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ghost/60" />
            <input
              placeholder="https://github.com/owner/repository"
              required
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full bg-ink/70 border border-line rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 font-mono text-sm text-paper placeholder:text-ghost/40 transition-all"
            />
          </div>

          <div className="relative">
            <FolderGit2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ghost/60" />
            <input
              placeholder="Custom project title (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-ink/70 border border-line rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 text-sm text-paper placeholder:text-ghost/40 transition-all"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={busy || !repoUrl.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent via-indigo-500 to-accentHover text-white font-bold text-sm transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(129,140,248,0.3)] whitespace-nowrap"
          >
            {busy ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Indexing Tree...</>
            ) : (
              <><Sparkles className="w-4 h-4 text-amber" /> Index Repository</>
            )}
          </motion.button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/25 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Search & Filter Bar ─── */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ghost/60" />
          <input
            type="text"
            placeholder="Search workspaces by title or repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-panel2/60 border border-line rounded-xl pl-10 pr-4 py-2.5 text-xs text-paper placeholder:text-ghost/50 focus:outline-none focus:border-accent/40 font-medium"
          />
        </div>
        <button
          onClick={loadProjects}
          className="p-2.5 rounded-xl bg-panel2 border border-line text-ghost hover:text-paper transition flex items-center gap-1.5 text-xs font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* ─── Projects Grid ─── */}
      {!loaded ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-panel2/80 border border-line rounded-2xl p-6 h-48 animate-pulse relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-ink/60 mb-4" />
              <div className="h-4 w-3/4 rounded bg-ink/60 mb-3" />
              <div className="h-3 w-1/2 rounded bg-ink/60" />
            </div>
          ))}
        </div>

      ) : filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 border border-dashed border-line/80 rounded-3xl bg-panel2/30 backdrop-blur-sm text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 text-accent">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <p className="font-display font-bold text-lg text-paper mb-1">
            {searchQuery ? "No matching workspaces found" : "No repositories indexed yet"}
          </p>
          <p className="text-ghost text-xs max-w-md mb-6">
            {searchQuery ? "Try clearing your search query above." : "Paste a public GitHub repository URL above to create your first AI workspace."}
          </p>
        </motion.div>

      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p, index) => {
            const meta = STATUS_META[p.status] || STATUS_META.pending;
            const isReady = p.status === "ready";

            return (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                key={p._id}
              >
                <Link
                  to={isReady ? `/projects/${p._id}` : "#"}
                  className={cn(
                    "group block bg-panel2/90 border border-line rounded-2xl p-6 h-full transition-all duration-300 relative overflow-hidden backdrop-blur-xl flex flex-col justify-between shadow-lg",
                    isReady
                      ? "hover:border-accent/50 hover:shadow-[0_12px_45px_rgba(129,140,248,0.15)] hover:-translate-y-1.5"
                      : "cursor-default opacity-85"
                  )}
                >
                  {/* Card Background Subtle Shimmer */}
                  {isReady && (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.05] via-transparent to-teal/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-ink border border-line flex items-center justify-center font-display font-bold text-sm shrink-0 transition-transform group-hover:scale-105",
                          isReady ? "text-accent border-accent/30 shadow-[0_0_12px_rgba(129,140,248,0.2)]" : "text-ghost"
                        )}>
                          {initialsFrom(p.name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-display text-base font-bold text-paper truncate group-hover:text-white transition-colors">
                            {p.name}
                          </h3>
                          <p className="text-[11px] font-mono text-ghost/70 truncate flex items-center gap-1.5 mt-0.5">
                            <GitBranch className="w-3 h-3 text-accent shrink-0" /> {p.sourceRef}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteProject(p._id, e)}
                        disabled={deletingId === p._id}
                        title="Delete project"
                        className="text-ghost/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition shrink-0"
                      >
                        {deletingId === p._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-mono border rounded-full px-2.5 py-1 font-semibold", meta.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                        {meta.label}
                      </span>

                      {isReady && (
                        <span className="text-[10px] font-mono text-ghost/70 bg-ink/60 px-2.5 py-1 rounded-full border border-line flex items-center gap-1">
                          <FileCode2 className="w-3 h-3 text-teal" /> {p.fileCount} files
                        </span>
                      )}
                    </div>

                    {p.status === "indexing" && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-ink rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: "10%" }}
                            animate={{ width: "80%" }}
                            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                            className="h-full bg-gradient-to-r from-amber to-amber/60 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {isReady && (
                    <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-accent group-hover:text-white transition-colors">
                      <span>Open Vector Chat Workspace</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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