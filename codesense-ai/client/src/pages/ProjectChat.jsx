import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, FileCode2, Sparkles, Loader2, Bot, User, GitBranchMinusIcon, Copy, Check } from "lucide-react";
import api from "../api/axios.js";
import { cn } from "../lib/utils.js";

const SUGGESTIONS = [
  "How does authentication work?",
  "Where is JWT implemented?",
  "Explain the project architecture.",
  "What does the main entry point do?",
];

function Avatar({ role }) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
        isUser
          ? "bg-panel2 border-line text-ghost"
          : "bg-amber/10 border-amber/30 text-amber shadow-[0_0_15px_rgba(232,163,61,0.2)]"
      )}
    >
      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-amber animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-amber animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-amber animate-bounce" />
    </div>
  );
}

export default function ProjectChat() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [readme, setReadme] = useState(null);
  const [readmeBusy, setReadmeBusy] = useState(false);
  const [readmeError, setReadmeError] = useState("");
  const [copied, setCopied] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => setProject(res.data.project));
    api.get(`/chat/${id}/history`).then((res) => setMessages(res.data.messages));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking, readme]);

  async function submitQuestion(q) {
    if (!q.trim()) return;
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: q, _id: `temp-${Date.now()}` }]);
    setAsking(true);
    try {
      const { data } = await api.post(`/chat/${id}/ask`, { question: q });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, citedFiles: data.citedFiles, _id: data.messageId },
      ]);
    } catch (err) {
      const detail = err.response?.data?.error || err.response?.data?.message;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: detail
            ? `Something went wrong: ${detail}`
            : "Couldn't reach the server. Check that it's running and try again.",
          _id: `err-${Date.now()}`,
        },
      ]);
    } finally {
      setAsking(false);
      inputRef.current?.focus();
    }
  }

  function handleAsk(e) {
    e.preventDefault();
    submitQuestion(question);
  }

  async function handleGenerateReadme() {
    setReadmeBusy(true);
    setReadmeError("");
    setReadme(null);
    try {
      const { data } = await api.post(`/chat/${id}/readme`);
      setReadme(data.readme);
    } catch (err) {
      setReadmeError(err.response?.data?.error || err.response?.data?.message || "Failed to generate README.");
    } finally {
      setReadmeBusy(false);
    }
  }

  function copyReadme() {
    navigator.clipboard.writeText(readme || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-screen pt-16 bg-ink relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full px-4 flex flex-col h-full relative z-10">
        <header className="py-4 flex items-center justify-between border-b border-white/5 bg-ink/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-panel2 border border-line flex items-center justify-center">
              <FileCode2 className="w-5 h-5 text-amber" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-medium text-lg text-paper truncate">
                {project?.name || <span className="animate-pulse bg-panel2 w-32 h-5 rounded block" />}
              </h1>
              <p className="text-xs text-ghost font-mono flex items-center gap-1.5 truncate">
                <GitBranchMinusIcon className="w-3 h-3" /> {project?.sourceRef || "Loading..."}
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateReadme}
            disabled={readmeBusy}
            className="shrink-0 text-xs font-medium px-4 py-2 rounded-lg bg-panel2 border border-line text-paper hover:bg-panel hover:border-amber hover:text-amber transition-all disabled:opacity-50 flex items-center gap-2 group"
          >
            {readmeBusy ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin text-amber" /> Generating...</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5 text-teal group-hover:text-amber transition-colors" /> Auto-Readme</>
            )}
          </button>
        </header>

        {readmeError && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {readmeError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-hide">
          <AnimatePresence>
            {readme && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-panel/80 backdrop-blur border border-amber/30 rounded-2xl p-5 mb-6 shadow-2xl relative group"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
                  <p className="text-sm font-medium text-amber flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Generated README.md
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={copyReadme}
                      className="p-1.5 rounded-md hover:bg-panel2 text-ghost hover:text-paper transition flex items-center gap-1.5 text-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => setReadme(null)}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-ghost hover:text-red-400 transition text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-paper/90">{readme}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.length === 0 && !readme && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center h-full"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(232,163,61,0.15)]">
                <Bot className="w-8 h-8 text-amber" />
              </div>
              <h2 className="text-xl font-display text-paper mb-2">How can I help you?</h2>
              <p className="text-ghost text-sm mb-8 max-w-sm">
                Ask questions about this repository. I have full context of the codebase and will cite the exact files I reference.
              </p>
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    key={s}
                    onClick={() => submitQuestion(s)}
                    className="text-sm font-medium text-ghost bg-panel border border-line rounded-xl px-4 py-2.5 hover:border-amber/50 hover:text-amber hover:shadow-[0_0_15px_rgba(232,163,61,0.15)] transition-all hover:-translate-y-0.5"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m._id}
              className={cn("flex gap-4 max-w-3xl", m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}
            >
              <Avatar role={m.role} />
              <div
                className={cn(
                  "rounded-2xl p-4 shadow-sm",
                  m.role === "user"
                    ? "bg-panel2 border border-line text-paper"
                    : "bg-panel/50 backdrop-blur-sm border border-amber/20 text-paper/90"
                )}
              >
                <div className="text-[15px] whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
                  {m.content}
                </div>
                {m.citedFiles && m.citedFiles.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-line/50">
                    <p className="text-[10px] uppercase tracking-wider text-ghost mb-2 font-semibold">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {m.citedFiles.map((f) => (
                        <span key={f} className="text-xs font-mono text-teal bg-teal/10 border border-teal/20 rounded-md px-2 py-1 flex items-center gap-1.5">
                          <FileCode2 className="w-3 h-3" />
                          {f.split('/').pop()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {asking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4 max-w-3xl mr-auto"
              >
                <Avatar role="assistant" />
                <div className="rounded-2xl p-4 bg-panel/50 backdrop-blur-sm border border-amber/20 flex items-center">
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4" />
        </div>

        <div className="py-4 bg-ink">
          <form
            onSubmit={handleAsk}
            className="relative flex items-center bg-panel border border-line rounded-2xl p-2 shadow-[0_0_30px_rgba(0,0,0,0.5)] focus-within:border-amber/50 focus-within:ring-1 focus-within:ring-amber/50 transition-all"
          >
            <input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about the codebase..."
              className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-paper placeholder:text-ghost/60"
            />
            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="p-2.5 rounded-xl bg-amber text-ink font-semibold hover:bg-amber/90 transition-all disabled:opacity-50 disabled:bg-panel2 disabled:text-ghost"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-[10px] text-ghost mt-3 pb-2">
            CodeSense AI can make mistakes. Consider verifying important information.
          </p>
        </div>
      </div>
    </div>
  );
}