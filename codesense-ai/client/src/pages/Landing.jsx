import React from "react";
import { Link } from "react-router-dom";

const TRACE_NODES = [
  { id: "auth", label: "auth.middleware.js", x: 20, y: 30 },
  { id: "jwt", label: "jwt.util.js", x: 20, y: 110 },
  { id: "user", label: "user.controller.js", x: 20, y: 190 },
];

const CAPABILITIES = [
  {
    title: "Ask the repo directly",
    desc: "\u201cHow does authentication work?\u201d gets answered from your actual middleware and routes, not generic docs.",
    tag: "01",
    accent: "amber",
  },
  {
    title: "Generate a README",
    desc: "Drafts documentation grounded in how the code actually behaves, sampled across the whole project.",
    tag: "02",
    accent: "teal",
  },
  {
    title: "Trace the architecture",
    desc: "Maps dependencies and structure straight from source, so new hires see the system, not just the files.",
    tag: "03",
    accent: "amber",
  },
  {
    title: "Cite every answer",
    desc: "Every response links back to the exact files it drew from \u2014 nothing is asserted without a source.",
    tag: "04",
    accent: "teal",
  },
];

const STATS = [
  { value: "0", label: "generic answers \u2014 everything is repo-grounded" },
  { value: "1", label: "GitHub URL to get started" },
  { value: "\u2265", label: "as fast as reading the code yourself" },
];

export default function Landing() {
  return (
    <div className="font-body relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#2A2F4A 1px, transparent 1px), linear-gradient(90deg, #2A2F4A 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[5%] w-[400px] h-[400px] rounded-full bg-teal/10 blur-[100px]" />
      </div>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-28 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-teal border border-teal/30 bg-teal/5 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            repository-aware, not file-blind
          </div>
          <h1 className="font-display text-6xl leading-[1.03] tracking-tight mb-6">
            Your codebase,
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-amber">explained in plain English.</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-amber/15 -z-0" />
            </span>
          </h1>
          <p className="text-ghost text-lg mb-8 max-w-md leading-relaxed">
            CodeSense AI indexes an entire repository — code, configs, docs — so you can
            ask it anything about how the system actually works, and get answers traced
            back to real files.
          </p>
          <div className="flex items-center gap-5">
            <Link
              to="/signup"
              className="group px-6 py-3.5 rounded-lg bg-amber text-ink font-semibold hover:bg-amber/90 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(232,163,61,0.25)] transition-all flex items-center gap-2"
            >
              Index your first repo
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
            <a href="#capabilities" className="text-ghost hover:text-paper transition text-sm">
              See what it does &darr;
            </a>
          </div>

          <div className="flex gap-10 mt-14 pt-8 border-t border-line/60">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl text-paper">{s.value}</p>
                <p className="text-ghost text-xs mt-1 max-w-[110px] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-amber/10 via-transparent to-teal/10 rounded-2xl blur-2xl -z-10" />
          <div className="bg-panel/80 backdrop-blur border border-line rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-1.5 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-teal/60" />
              <p className="font-mono text-xs text-ghost ml-3">query.trace</p>
            </div>
            <svg viewBox="0 0 480 280" className="w-full h-auto">
              {TRACE_NODES.map((n) => (
                <line
                  key={n.id}
                  x1={n.x + 175}
                  y1={n.y + 12}
                  x2={330}
                  y2={130}
                  stroke="#2A2F4A"
                  strokeWidth="1.5"
                  className="trace-line"
                />
              ))}
              {TRACE_NODES.map((n) => (
                <g key={n.id}>
                  <rect x={n.x} y={n.y} width="175" height="26" rx="5" fill="#1F2440" stroke="#2A2F4A" />
                  <circle cx={n.x + 14} cy={n.y + 13} r="3" fill="#4FD1C5" />
                  <text x={n.x + 24} y={n.y + 17} fontSize="10.5" fontFamily="JetBrains Mono, monospace" fill="#EDEFF7">
                    {n.label}
                  </text>
                </g>
              ))}
              <g>
                <rect x="330" y="100" width="150" height="66" rx="8" fill="#171B2E" stroke="#E8A33D" strokeWidth="1.5" />
                <text x="345" y="124" fontSize="10" fontFamily="Inter, sans-serif" fill="#EDEFF7">Auth uses JWT,</text>
                <text x="345" y="140" fontSize="10" fontFamily="Inter, sans-serif" fill="#EDEFF7">verified in middleware</text>
                <text x="345" y="156" fontSize="10" fontFamily="Inter, sans-serif" fill="#EDEFF7">before every route.</text>
              </g>
            </svg>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-line/60">
              <span className="text-teal font-mono text-xs">&gt;</span>
              <p className="font-mono text-xs text-ghost">"How does authentication work?"</p>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="max-w-6xl mx-auto px-6 py-24 border-t border-line/60">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs text-amber mb-3">WHAT IT DOES</p>
            <h2 className="font-display text-4xl max-w-lg">Beyond a code-complete popup</h2>
          </div>
          <p className="text-ghost max-w-sm text-sm leading-relaxed">
            Most AI coding tools understand a file. CodeSense AI understands the project —
            structure, dependencies, and the logic tying it together.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {CAPABILITIES.map((c) => (
            <div
              key={c.title}
              className={`group bg-panel border border-line rounded-xl p-7 transition-all hover:-translate-y-1 hover:shadow-xl ${
                c.accent === "amber" ? "hover:border-amber/50" : "hover:border-teal/50"
              }`}
            >
              <p className={`font-mono text-xs mb-4 ${c.accent === "amber" ? "text-amber" : "text-teal"}`}>
                {c.tag}
              </p>
              <h3 className="font-display text-xl mb-2">{c.title}</h3>
              <p className="text-ghost text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-line/60">
        <div className="relative bg-panel border border-line rounded-2xl p-14 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: "radial-gradient(circle at 30% 30%, #E8A33D, transparent 50%), radial-gradient(circle at 70% 70%, #4FD1C5, transparent 50%)",
          }} />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl mb-4 max-w-xl mx-auto">
              Stop re-reading the codebase to remember how it works.
            </h2>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-amber text-ink font-semibold hover:bg-amber/90 hover:-translate-y-0.5 transition-all"
            >
              Create a free account &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}