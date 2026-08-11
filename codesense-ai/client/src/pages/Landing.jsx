import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Code2, GitBranch, Zap, Sparkles } from "lucide-react";
import { cn } from "../lib/utils.js";

const TRACE_NODES = [
  { id: "auth", label: "auth.middleware.js", x: 20, y: 30 },
  { id: "jwt", label: "jwt.util.js", x: 20, y: 110 },
  { id: "user", label: "user.controller.js", x: 20, y: 190 },
];

const CAPABILITIES = [
  {
    title: "Ask the repo directly",
    desc: "\u201cHow does authentication work?\u201d gets answered from your actual middleware and routes, not generic docs.",
    icon: Search,
    accent: "accent",
  },
  {
    title: "Generate a README",
    desc: "Drafts documentation grounded in how the code actually behaves, sampled across the whole project.",
    icon: Code2,
    accent: "teal",
  },
  {
    title: "Trace the architecture",
    desc: "Maps dependencies and structure straight from source, so new hires see the system, not just the files.",
    icon: GitBranch,
    accent: "amber",
  },
  {
    title: "Cite every answer",
    desc: "Every response links back to the exact files it drew from \u2014 nothing is asserted without a source.",
    icon: Zap,
    accent: "accent",
  },
];

const STATS = [
  { value: "0", label: "generic answers \u2014 everything is repo-grounded" },
  { value: "1", label: "GitHub URL to get started" },
  { value: "\u2265", label: "as fast as reading the code yourself" },
];

export default function Landing() {
  return (
    <div className="font-body relative overflow-hidden bg-ink pt-14">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none">
        <div className="bg-grid-white w-full h-full absolute top-0 mask-image:linear-gradient(to_bottom,white,transparent_80%)]" />
        <div className="absolute top-[-20%] w-[1000px] h-[800px] rounded-[100%] bg-accent/20 blur-[120px] animate-blob mix-blend-screen" />
        <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-teal/10 blur-[100px] mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-amber/10 blur-[120px] mix-blend-screen" />
      </div>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-28 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-xs font-mono text-accent border border-accent/30 bg-accent/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            repository-aware, not file-blind
          </motion.div>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.1] tracking-tight mb-8">
            Your codebase,
            <br />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-accent via-teal to-amber">
              explained in plain English.
            </span>
          </h1>
          <p className="text-ghost text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
            CodeSense AI indexes an entire repository \u2014 code, configs, docs \u2014 so you can
            ask it anything about how the system actually works, and get answers traced
            back to real files.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              to="/signup"
              className="group relative px-8 py-4 rounded-xl bg-paper text-ink font-bold overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(99,102,241,0.3)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <span className="relative flex items-center gap-2">
                Index your first repo
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </span>
            </Link>
            <a href="#capabilities" className="text-ghost hover:text-paper transition-colors font-medium">
              See what it does &darr;
            </a>
          </div>

          <div className="flex gap-12 mt-16 pt-10 border-t border-line">
            {STATS.map((s, i) => (
              <motion.div 
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <p className="font-display text-3xl font-bold text-paper mb-1">{s.value}</p>
                <p className="text-ghost text-xs leading-relaxed max-w-[120px]">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative perspective-1000"
        >
          <div className="absolute -inset-px bg-gradient-to-b from-accent/50 to-teal/50 rounded-2xl blur-lg opacity-50" />
          <div className="relative bg-panel backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-6 border-b border-line pb-4">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-amber/80 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-teal/80 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
              </div>
              <p className="font-mono text-xs text-ghost ml-4">query.trace</p>
            </div>
            
            <svg viewBox="0 0 480 280" className="w-full h-auto drop-shadow-xl">
              {TRACE_NODES.map((n) => (
                <line
                  key={n.id}
                  x1={n.x + 175}
                  y1={n.y + 12}
                  x2={330}
                  y2={130}
                  stroke="#3F3F46"
                  strokeWidth="2"
                  className="trace-line"
                />
              ))}
              {TRACE_NODES.map((n) => (
                <g key={n.id} className="transition-transform hover:-translate-y-1 cursor-pointer">
                  <rect x={n.x} y={n.y} width="175" height="28" rx="6" fill="#18181B" stroke="#3F3F46" />
                  <circle cx={n.x + 14} cy={n.y + 14} r="4" fill="#6366F1" />
                  <text x={n.x + 28} y={n.y + 18} fontSize="11" fontFamily="JetBrains Mono, monospace" fill="#F4F4F5">
                    {n.label}
                  </text>
                </g>
              ))}
              <g className="animate-fade-in" style={{ animationDelay: "1s", animationFillMode: "both" }}>
                <rect x="330" y="90" width="150" height="76" rx="12" fill="#18181B" stroke="#6366F1" strokeWidth="2" />
                <text x="345" y="116" fontSize="11" fontFamily="Inter, sans-serif" fill="#F4F4F5" fontWeight="500">Auth uses JWT,</text>
                <text x="345" y="134" fontSize="11" fontFamily="Inter, sans-serif" fill="#F4F4F5" fontWeight="500">verified in middleware</text>
                <text x="345" y="152" fontSize="11" fontFamily="Inter, sans-serif" fill="#F4F4F5" fontWeight="500">before every route.</text>
              </g>
            </svg>
            
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-line">
              <span className="text-accent font-mono text-sm font-bold">&gt;</span>
              <p className="font-mono text-sm text-paper bg-panel2 px-3 py-1.5 rounded-md border border-line">"How does authentication work?"</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="capabilities" className="relative z-10 max-w-6xl mx-auto px-6 py-32 border-t border-line">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="font-mono text-sm text-accent mb-4 tracking-wider uppercase font-semibold">What it does</p>
            <h2 className="font-display text-4xl md:text-5xl max-w-xl leading-tight">Beyond a code-complete popup</h2>
          </div>
          <p className="text-ghost max-w-md text-base leading-relaxed">
            Most AI coding tools understand a file. CodeSense AI understands the project \u2014
            structure, dependencies, and the logic tying it together.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {CAPABILITIES.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-panel/50 backdrop-blur-sm border border-line rounded-2xl p-8 overflow-hidden"
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                c.accent === "accent" ? "from-accent to-transparent" :
                c.accent === "amber" ? "from-amber to-transparent" :
                "from-teal to-transparent"
              )} />
              
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg",
                c.accent === "accent" ? "bg-accent/20 text-accent border border-accent/30" :
                c.accent === "amber" ? "bg-amber/20 text-amber border border-amber/30" :
                "bg-teal/20 text-teal border border-teal/30"
              )}>
                <c.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl mb-3 text-paper font-semibold">{c.title}</h3>
              <p className="text-ghost text-base leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 py-32 border-t border-line">
        <div className="relative bg-panel border border-white/10 rounded-3xl p-16 text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.15), transparent 50%), radial-gradient(circle at 70% 70%, rgba(20,184,166,0.15), transparent 50%)",
          }} />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
              Stop re-reading the codebase to remember how it works.
            </h2>
            <p className="text-ghost mb-10 text-lg">
              Join thousands of developers using CodeSense AI to ship faster with complete context.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-paper text-ink font-bold hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              Create a free account <Zap className="w-4 h-4 fill-current" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}