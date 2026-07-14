import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";

const SUGGESTIONS = [
  "How does authentication work?",
  "Where is JWT implemented?",
  "Explain the payment workflow.",
  "What does the main entry point do?",
];

function Avatar({ role }) {
  const isUser = role === "user";
  return (
    <div
      className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-mono shrink-0 border ${
        isUser
          ? "bg-panel2 border-line text-ghost"
          : "bg-amber/10 border-amber/30 text-amber"
      }`}
    >
      {isUser ? "you" : "</>"}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 pl-1">
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
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => setProject(res.data.project));
    api.get(`/chat/${id}/history`).then((res) => setMessages(res.data.messages));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

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
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-5 flex items-start justify-between gap-4 pb-5 border-b border-line/60">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
            <h1 className="font-display text-xl truncate">{project?.name || "Loading..."}</h1>
          </div>
          <p className="text-ghost text-xs font-mono truncate pl-4">{project?.sourceRef}</p>
        </div>
        <button
          onClick={handleGenerateReadme}
          disabled={readmeBusy}
          className="shrink-0 text-xs font-mono px-3 py-2 rounded-md border border-line text-ghost hover:border-teal hover:text-teal transition disabled:opacity-50 flex items-center gap-1.5"
        >
          {readmeBusy ? (
            <>
              <span className="w-3 h-3 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
              Generating
            </>
          ) : (
            "Generate README"
          )}
        </button>
      </div>

      {readmeError && <p className="text-sm text-red-400 mb-4">{readmeError}</p>}

      {readme && (
        <div className="bg-panel border border-teal/30 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto shadow-lg">
          <div className="flex items-center justify-between mb-2 sticky -top-4 bg-panel pb-2">
            <p className="text-xs font-mono text-teal flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" /> README.md draft
            </p>
            <div className="flex gap-3">
              <button onClick={copyReadme} className="text-xs text-ghost hover:text-paper transition">Copy</button>
              <button onClick={() => setReadme(null)} className="text-xs text-ghost hover:text-paper transition">Close</button>
            </div>
          </div>
          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-paper/90">{readme}</pre>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="py-6">
            <p className="text-ghost text-sm mb-4">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submitQuestion(s)}
                  className="text-xs font-mono text-ghost border border-line rounded-full px-3 py-1.5 hover:border-amber hover:text-amber transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m._id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <Avatar role={m.role} />
            <div
              className={`rounded-lg p-4 border max-w-[85%] ${
                m.role === "user" ? "bg-panel2 border-line" : "bg-panel border-line"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
              {m.citedFiles && m.citedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-line/60">
                  {m.citedFiles.map((f) => (
                    <span key={f} className="text-xs font-mono text-teal border border-teal/30 rounded px-2 py-0.5">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {asking && (
          <div className="flex gap-3">
            <Avatar role="assistant" />
            <div className="rounded-lg p-4 border bg-panel border-line">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleAsk} className="flex gap-3">
        <input
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about this codebase..."
          className="flex-1 bg-panel border border-line rounded-lg px-4 py-3 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber/30 text-sm transition"
        />
        <button
          type="submit"
          disabled={asking || !question.trim()}
          className="px-5 py-3 rounded-lg bg-amber text-ink font-semibold hover:bg-amber/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
        >
          Ask
        </button>
      </form>
    </div>
  );
}