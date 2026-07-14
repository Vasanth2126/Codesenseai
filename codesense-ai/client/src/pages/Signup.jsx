import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-teal/[0.06] blur-[100px]" />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-teal font-display text-2xl">&lt;/&gt;</span>
          <h1 className="font-display text-3xl mt-3">Create an account</h1>
          <p className="text-ghost text-sm mt-1">Start indexing repos in under a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-panel border border-line rounded-xl p-7 shadow-xl space-y-4">
          <div>
            <label className="text-xs font-mono text-ghost block mb-1.5">NAME</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-panel2 border border-line rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition"
              placeholder="User Name"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-ghost block mb-1.5">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-panel2 border border-line rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-ghost block mb-1.5">PASSWORD</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-panel2 border border-line rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition"
              placeholder="At least 6 characters"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-md bg-teal text-ink font-semibold hover:bg-teal/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {busy ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-ghost mt-6 text-center">
          Already have an account? <Link to="/login" className="text-amber hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}