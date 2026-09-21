import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { 
  Search, Code2, GitBranch, Zap, Sparkles, ChevronRight, ExternalLink, Lock, 
  ArrowRight, Shield, Brain, FileText, Cpu, Database, Network, Terminal, CheckCircle2, 
  Star, MessageSquareCode, Activity, Play, Layers
} from "lucide-react";
import { cn } from "../lib/utils.js";

// Sample repo search simulator queries for live landing page demo
const SIMULATOR_QUERIES = [
  {
    q: "How is JWT authentication handled?",
    answer: "JWT tokens are verified in `middleware/auth.js` via `jwt.verify(token, process.env.JWT_SECRET)`. Valid user payload is attached to `req.userId` before forwarding to controllers.",
    files: ["middleware/auth.js", "utils/jwt.js", "controllers/userController.js"]
  },
  {
    q: "Where is the vector embedding calculated?",
    answer: "Embeddings are calculated locally in `utils/llm.js` using `localHashEmbedding(text, 256)`. It generates normalized frequency vectors without external API calls.",
    files: ["utils/llm.js", "controllers/chatController.js"]
  },
  {
    q: "How does GitHub repository cloning work?",
    answer: "The project ingestion pipeline in `utils/github.js` fetches public repo trees via GitHub REST API, filters code extensions, and stores chunked documents in MongoDB.",
    files: ["utils/github.js", "utils/chunker.js", "controllers/projectController.js"]
  }
];

const BENTO_FEATURES = [
  {
    title: "Repo Graph Architecture Engine",
    desc: "Indexes every route, controller, middleware, and utility. Understand complex cross-file dependencies instantly.",
    tag: "Vector Search",
    icon: Network,
    color: "accent",
    colSpan: "col-span-12 md:col-span-8",
    bgGradient: "from-accent/15 via-accent/5 to-transparent",
    svgIllustration: (
      <svg className="w-full h-40 opacity-80" viewBox="0 0 400 160">
        <circle cx="80" cy="80" r="28" fill="rgba(129,140,248,0.1)" stroke="#818CF8" strokeWidth="1.5" />
        <text x="80" y="84" textAnchor="middle" fill="#818CF8" fontSize="10" fontFamily="monospace">API</text>
        
        <circle cx="200" cy="40" r="22" fill="rgba(20,184,166,0.1)" stroke="#14B8A6" strokeWidth="1.5" />
        <text x="200" y="44" textAnchor="middle" fill="#14B8A6" fontSize="9" fontFamily="monospace">AUTH</text>

        <circle cx="200" cy="120" r="22" fill="rgba(245,158,11,0.1)" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="200" y="124" textAnchor="middle" fill="#F59E0B" fontSize="9" fontFamily="monospace">DB</text>

        <circle cx="320" cy="80" r="28" fill="rgba(129,140,248,0.1)" stroke="#818CF8" strokeWidth="1.5" />
        <text x="320" y="84" textAnchor="middle" fill="#818CF8" fontSize="10" fontFamily="monospace">MODEL</text>

        <path d="M 108 80 L 178 40" stroke="rgba(129,140,248,0.3)" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M 108 80 L 178 120" stroke="rgba(129,140,248,0.3)" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M 222 40 L 292 80" stroke="rgba(20,184,166,0.3)" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M 222 120 L 292 80" stroke="rgba(245,158,11,0.3)" strokeWidth="2" strokeDasharray="4 4" />

        <circle cx="143" cy="60" r="4" fill="#818CF8">
          <animate attributeName="cx" values="108;178;108" dur="3s" repeatCount="indefinite" />
          <animate attributeName="cy" values="80;40;80" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    )
  },
  {
    title: "1-Click Auto README Synthesizer",
    desc: "Transforms raw codebase structures into beautifully formatted Markdown READMEs complete with architecture summaries.",
    tag: "AI Docs",
    icon: FileText,
    color: "teal",
    colSpan: "col-span-12 md:col-span-4",
    bgGradient: "from-teal/15 via-teal/5 to-transparent",
    svgIllustration: (
      <div className="bg-ink/80 border border-line rounded-xl p-3 font-mono text-[11px] text-teal/90 leading-tight space-y-1.5 opacity-90 shadow-lg">
        <div className="flex items-center gap-1.5 text-ghost/60 border-b border-line pb-1.5">
          <FileText className="w-3 h-3 text-teal" /> README.md generated
        </div>
        <p className="text-white font-bold"># TaskFlow Core</p>
        <p className="text-ghost/80">⚡ Full-Stack MERN Architecture</p>
        <div className="flex gap-1 text-[9px] pt-1">
          <span className="bg-teal/15 text-teal px-1.5 py-0.5 rounded">Node</span>
          <span className="bg-accent/15 text-accent px-1.5 py-0.5 rounded">Mongo</span>
          <span className="bg-amber/15 text-amber px-1.5 py-0.5 rounded">Groq</span>
        </div>
      </div>
    )
  },
  {
    title: "Zero Hallucination Source Citations",
    desc: "Every AI response cites exact file paths inline. Clickable source tags let you verify answers in your IDE.",
    tag: "Guaranteed Accuracy",
    icon: Shield,
    color: "amber",
    colSpan: "col-span-12 md:col-span-5",
    bgGradient: "from-amber/15 via-amber/5 to-transparent",
    svgIllustration: (
      <div className="space-y-2">
        <div className="bg-panel2 border border-line rounded-lg p-2.5 text-xs text-paper/90 flex items-center justify-between">
          <span className="truncate">"Auth token verified in middleware"</span>
          <CheckCircle2 className="w-4 h-4 text-teal shrink-0 ml-2" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber">
          <span className="bg-amber/10 border border-amber/30 px-2.5 py-1 rounded-md flex items-center gap-1">
            <Code2 className="w-3 h-3" /> middleware/auth.js:L42
          </span>
          <span className="bg-accent/10 border border-accent/30 px-2.5 py-1 rounded-md text-accent flex items-center gap-1">
            <Code2 className="w-3 h-3" /> utils/jwt.js:L18
          </span>
        </div>
      </div>
    )
  },
  {
    title: "Groq Llama 3 Fast Inference Pipeline",
    desc: "Sub-second LLM queries powered by Groq LPU engine and local cosine similarity ranking over vector embeddings.",
    tag: "Sub-3s Response",
    icon: Cpu,
    color: "accent",
    colSpan: "col-span-12 md:col-span-7",
    bgGradient: "from-accent/15 via-teal/5 to-transparent",
    svgIllustration: (
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-ink/80 border border-accent/30 p-3 rounded-xl">
          <div className="text-xl font-bold font-display text-accent">256d</div>
          <div className="text-[10px] font-mono text-ghost/70">Embedding Dimensions</div>
        </div>
        <div className="bg-ink/80 border border-teal/30 p-3 rounded-xl">
          <div className="text-xl font-bold font-display text-teal">&lt; 800ms</div>
          <div className="text-[10px] font-mono text-ghost/70">Groq Latency</div>
        </div>
        <div className="bg-ink/80 border border-amber/30 p-3 rounded-xl">
          <div className="text-xl font-bold font-display text-amber">TOP-K 6</div>
          <div className="text-[10px] font-mono text-ghost/70">Context Chunks</div>
        </div>
      </div>
    )
  }
];

const TIMELINE_STEPS = [
  {
    step: "01",
    title: "Import GitHub Repo",
    desc: "Paste any public repository URL. CodeSense AI clones the AST tree, splits files into logical code chunks, and cleans syntax.",
    icon: GitBranch,
    badge: "API Ingestion"
  },
  {
    step: "02",
    title: "Vector Embedding & Indexing",
    desc: "Generates high-dimensional vector embeddings locally and ranks semantic similarity using cosine distance in MongoDB.",
    icon: Database,
    badge: "Local Hash Engine"
  },
  {
    step: "03",
    title: "Ask & Synthesize",
    desc: "Query your codebase in natural language. Get instant source-cited answers or generate a full technical README with 1 click.",
    icon: Brain,
    badge: "Groq LLM Synthesis"
  }
];

const TESTIMONIALS = [
  {
    quote: "CodeSense AI saved me 3 days of manual code tracing when taking over a legacy 50k-line Node backend for my internship.",
    author: "Rahul S.",
    role: "Full-Stack Developer Intern",
    stars: 5,
    initials: "RS",
    color: "bg-accent/20 border-accent/40 text-accent"
  },
  {
    quote: "The auto-README feature drafted complete setup docs for our hackathon project in 10 seconds. Interviewers loved it!",
    author: "Ananya M.",
    role: "Software Engineering Grad",
    stars: 5,
    initials: "AM",
    color: "bg-teal/20 border-teal/40 text-teal"
  },
  {
    quote: "Being able to click inline source file links directly from AI answers gives me 100% confidence when debugging.",
    author: "Vikram P.",
    role: "Backend Engineer",
    stars: 5,
    initials: "VP",
    color: "bg-amber/20 border-amber/40 text-amber"
  }
];

const STATS = [
  { value: "10×", label: "Faster Code Onboarding" },
  { value: "100%", label: "Source File Citation" },
  { value: "< 2s", label: "Average Query Time" },
  { value: "256d", label: "Vector Embeddings" }
];

export default function Landing() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeDemoQuery, setActiveDemoQuery] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const mouseXSpring = useSpring(0, springConfig);
  const mouseYSpring = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });

    const normalizedX = (x / rect.width) * 2 - 1;
    const normalizedY = (y / rect.height) * 2 - 1;
    mouseXSpring.set(normalizedX);
    mouseYSpring.set(normalizedY);
  };

  const rotateX = useTransform(mouseYSpring, [-1, 1], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-1, 1], [-10, 10]);

  return (
    <div ref={containerRef} className="font-body relative bg-ink min-h-screen selection:bg-accent/30 selection:text-white overflow-hidden">
      {/* Global Animated Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      </div>

      {/* ═══════════════ Hero Section ═══════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative z-10 min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden"
      >
        {/* Mouse Glow */}
        <motion.div
          animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
          transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
          className="absolute w-[800px] h-[800px] rounded-full bg-accent/10 blur-[160px] pointer-events-none mix-blend-screen hidden lg:block"
        />

        {/* Ambient Glowing Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 50, -30, 0], y: [0, -60, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-30 -left-30 w-[600px] h-[600px] bg-accent/[0.07] rounded-full blur-[130px]"
          />
          <motion.div
            animate={{ x: [0, -40, 50, 0], y: [0, 50, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-1/2 -right-40 w-[550px] h-[550px] bg-teal/[0.06] rounded-full blur-[140px]"
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center w-full relative z-10"
        >
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-mono text-paper bg-panel2 border border-line rounded-full px-4 py-2 mb-6 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            >
              <span className="relative flex h-2.5 w-2.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent shadow-[0_0_10px_rgba(129,140,248,0.8)]"></span>
              </span>
              <span>Placement Project Showcase</span>
              <span className="text-ghost/40">|</span>
              <span className="text-teal font-semibold">Groq AI + MongoDB Vector RAG</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.06] tracking-tight text-white mb-6 font-bold"
            >
              Understand any <br className="hidden sm:inline" />
              <span className="relative inline-block mt-1">
                <span className="absolute -inset-3 bg-gradient-to-r from-accent/30 via-teal/20 to-amber/20 blur-2xl rounded-full opacity-70" />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-accent via-teal to-amber drop-shadow-[0_0_35px_rgba(129,140,248,0.4)]">
                  codebase instantly.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-ghost text-base sm:text-lg lg:text-xl mb-10 max-w-2xl leading-relaxed"
            >
              Index any GitHub repository, query complex code architecture in natural language, and generate full developer READMEs with 1-click. Built with local vector similarity & Groq AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mb-12 w-full sm:w-auto"
            >
              <Link
                to="/signup"
                className="group relative w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-ink font-bold overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="relative z-10">Start Indexing Free</span>
                <ChevronRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-panel2 border border-line text-paper font-semibold transition-all hover:border-accent/40 hover:bg-panel2/90 flex items-center justify-center gap-2 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
              >
                <Terminal className="w-4 h-4 text-accent" /> Live Dashboard Demo
              </Link>
            </motion.div>

            {/* Badges strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 border-t border-line/60 pt-6 w-full text-xs font-mono text-ghost/70"
            >
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal" /> 100% Source Cited</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" /> Cosine Similarity Vector RAG</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber" /> Auto Markdown README</div>
            </motion.div>
          </div>

          {/* Hero Right 3D Interactive Trace Card */}
          <motion.div
            style={{ rotateX, rotateY }}
            className="lg:col-span-5 relative perspective-[1200px] hidden lg:block"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-accent/30 via-teal/20 to-amber/20 rounded-3xl blur-2xl opacity-80" />
            <div className="relative bg-ink/95 backdrop-blur-3xl border border-line rounded-3xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.8)] transform-gpu">
              
              {/* Card Window Header */}
              <div className="flex items-center justify-between mb-6 border-b border-line pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber/80" />
                  <div className="w-3 h-3 rounded-full bg-teal/80" />
                </div>
                <div className="flex items-center gap-2 text-ghost/80 text-xs font-mono bg-panel2 px-3 py-1 rounded-full border border-line">
                  <Lock className="w-3.5 h-3.5 text-teal" /> Vasanth2126/taskflow
                </div>
              </div>

              {/* Interactive Query Simulator inside Card */}
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between text-ghost/60 text-[10px]">
                  <span>TRY SAMPLE ARCHITECTURE QUERIES</span>
                  <span className="text-teal animate-pulse">● LIVE INDEXED</span>
                </div>

                <div className="flex flex-col gap-2">
                  {SIMULATOR_QUERIES.map((sq, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDemoQuery(idx)}
                      className={cn(
                        "text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between",
                        activeDemoQuery === idx
                          ? "bg-accent/10 border-accent/40 text-paper shadow-[0_0_15px_rgba(129,140,248,0.15)]"
                          : "bg-panel2/50 border-line text-ghost hover:border-white/20"
                      )}
                    >
                      <span className="truncate">{sq.q}</span>
                      <Play className={cn("w-3 h-3 shrink-0 ml-2", activeDemoQuery === idx ? "text-accent fill-accent" : "text-ghost/40")} />
                    </button>
                  ))}
                </div>

                {/* AI Answer Preview Window */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDemoQuery}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-xl bg-panel2/80 border border-line space-y-3"
                  >
                    <div className="flex items-center gap-2 text-accent font-semibold">
                      <Sparkles className="w-4 h-4 text-amber" />
                      <span>CodeSense AI Synthesis</span>
                    </div>
                    <p className="text-paper/90 text-xs font-body leading-relaxed">
                      {SIMULATOR_QUERIES[activeDemoQuery].answer}
                    </p>
                    <div className="border-t border-line/60 pt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-ghost/60 uppercase">Cited Files:</span>
                      {SIMULATOR_QUERIES[activeDemoQuery].files.map((f) => (
                        <span key={f} className="text-[10px] bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ Animated Stats Section ═══════════════ */}
      <section className="relative z-10 border-y border-line/60 bg-panel2/30 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl lg:text-5xl font-bold bg-gradient-to-r from-accent via-teal to-amber bg-clip-text text-transparent mb-2">
                {s.value}
              </div>
              <div className="text-xs font-mono text-ghost/70 uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ Bento Grid Features Section ═══════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono text-teal bg-teal/10 border border-teal/20 rounded-full px-4 py-1.5 mb-4">
            <Layers className="w-3.5 h-3.5" /> ARCHITECTURE & CAPABILITIES
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-paper mb-5 tracking-tight">
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-teal to-amber">deep codebase mastery.</span>
          </h2>
          <p className="text-ghost text-lg max-w-2xl mx-auto leading-relaxed">
            From single controller methods to full multi-module architectures, CodeSense AI indexes and cites everything.
          </p>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {BENTO_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
              whileHover={{ scale: 1.015, y: -4 }}
              className={cn(
                "group relative bg-panel2/90 border border-line rounded-3xl p-8 overflow-hidden backdrop-blur-xl transition-all duration-500 flex flex-col justify-between",
                feat.colSpan,
                "hover:border-accent/40 hover:shadow-[0_12px_50px_rgba(0,0,0,0.6)]"
              )}
            >
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br", feat.bgGradient)} />

              <div className="relative z-10 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg transition-transform group-hover:scale-110 duration-300",
                    feat.color === "accent" ? "bg-accent/10 text-accent border-accent/30 shadow-accent/10" :
                    feat.color === "teal" ? "bg-teal/10 text-teal border-teal/30 shadow-teal/10" :
                    "bg-amber/10 text-amber border-amber/30 shadow-amber/10"
                  )}>
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-ghost/70 bg-ink/60 border border-line px-3 py-1 rounded-full">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-semibold text-paper mb-3 group-hover:text-white transition-colors">{feat.title}</h3>
                <p className="text-ghost/80 leading-relaxed text-sm">{feat.desc}</p>
              </div>

              {/* Graphic Illustration inside Bento Card */}
              <div className="relative z-10 pt-4 border-t border-line/60">
                {feat.svgIllustration}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ How It Works Timeline ═══════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 bg-panel2/20 rounded-3xl border border-line/60 my-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber bg-amber/10 border border-amber/20 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-3.5 h-3.5" /> 3-STEP PIPELINE
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper">
            How CodeSense AI Processes Your Code
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {TIMELINE_STEPS.map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative bg-panel2 border border-line rounded-2xl p-8 backdrop-blur-xl flex flex-col justify-between group hover:border-accent/40 transition-all duration-300 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display text-3xl font-extrabold text-accent/80">{s.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-paper mb-3">{s.title}</h3>
                <p className="text-ghost text-sm leading-relaxed mb-6">{s.desc}</p>
              </div>

              <span className="text-[10px] font-mono text-teal bg-teal/10 border border-teal/20 px-3 py-1 rounded-full w-fit">
                {s.badge}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ Developer Reviews / Testimonials ═══════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono text-accent bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4">
            <Star className="w-3.5 h-3.5 fill-accent" /> REVIEWS & FEEDBACK
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper">
            Built for Engineers & Placement Portfolios
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-panel2 border border-line rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between shadow-lg hover:border-accent/30 transition-all"
            >
              <div>
                <div className="flex gap-1 text-amber mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber" />
                  ))}
                </div>
                <p className="text-paper/90 text-sm italic leading-relaxed mb-6">"{t.quote}"</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-line/60">
                <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center font-mono text-xs font-bold shrink-0", t.color)}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-paper">{t.author}</p>
                  <p className="text-[10px] font-mono text-ghost/70">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ CTA Banner Section ═══════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-panel2 border border-line rounded-[2.5rem] p-10 md:p-20 text-center overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
        >
          {/* Animated Background Glow */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[160px] mix-blend-screen pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -right-1/4 w-[650px] h-[650px] bg-teal/20 rounded-full blur-[160px] mix-blend-screen pointer-events-none"
          />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Ready to explore your codebase with AI?
            </h2>
            <p className="text-paper/70 mb-10 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Index any public GitHub repository in seconds and start asking architecture queries right away.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/signup"
                className="group px-8 py-4 rounded-xl bg-white text-ink font-bold hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="relative z-10">Get Started Free</span>
                <Zap className="relative z-10 w-4 h-4 fill-current text-ink" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-ink/80 border border-line text-paper font-bold hover:bg-ink hover:border-accent/40 transition-all backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
              >
                Sign In to Workspace
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="relative z-10 border-t border-line py-10 bg-ink/90">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-ghost/70 text-sm">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-paper">CodeSense<span className="text-accent">AI</span></span>
            <span className="text-ghost/30">|</span>
            <span className="text-xs">Placement Project Showcase</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-ghost/50 font-mono">
            <span>React + Node.js + Express + MongoDB</span>
            <span>·</span>
            <span>Groq Llama 3 API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}