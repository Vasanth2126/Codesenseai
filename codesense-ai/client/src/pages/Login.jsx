import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Code2, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-ink font-body relative overflow-hidden selection:bg-accent/30 selection:text-white">
      {/* Background Animated Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-accent/[0.06] rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/6 w-[450px] h-[450px] bg-teal/[0.05] rounded-full blur-[140px] animate-blob" style={{ animationDelay: "4s" }} />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
      </div>

      {/* Left Column - Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-panel2 border border-line flex items-center justify-center group-hover:border-accent/50 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              <Code2 className="w-4 h-4 text-accent" />
            </div>
            <span className="font-display font-bold text-paper text-base group-hover:text-accent transition-colors tracking-tight">
              CodeSense<span className="text-accent">AI</span>
            </span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-panel2/80 backdrop-blur-2xl border border-line p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] mt-12 sm:mt-0"
        >
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-teal bg-teal/10 border border-teal/20 rounded-full px-3 py-1 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE AUTHENTICATION
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-paper tracking-tight mb-2">Welcome Back</h1>
            <p className="text-ghost text-sm leading-relaxed">Sign in to access your repository vector workspaces.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-ghost/80 uppercase tracking-widest font-semibold ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-teal/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-ink/60 border border-line rounded-xl overflow-hidden backdrop-blur-xl transition-all group-focus-within:border-accent/60 group-focus-within:shadow-[0_0_20px_rgba(129,140,248,0.15)]">
                  <div className="pl-4 pr-3 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-ghost group-focus-within:text-accent transition-colors duration-300" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-3.5 pr-4 text-sm text-paper focus:outline-none placeholder:text-ghost/40 font-medium"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-ghost/80 uppercase tracking-widest font-semibold ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-teal/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-ink/60 border border-line rounded-xl overflow-hidden backdrop-blur-xl transition-all group-focus-within:border-accent/60 group-focus-within:shadow-[0_0_20px_rgba(129,140,248,0.15)]">
                  <div className="pl-4 pr-3 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-ghost group-focus-within:text-accent transition-colors duration-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-3.5 pr-10 text-sm text-paper focus:outline-none placeholder:text-ghost/40 font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 text-ghost/60 hover:text-paper transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={busy}
              className="w-full group relative py-4 rounded-xl overflow-hidden text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(129,140,248,0.3)] mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent via-indigo-500 to-accentHover transition-transform duration-300 group-hover:scale-105" />
              <div className="relative flex items-center justify-center gap-2 text-sm z-10">
                {busy ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <p className="text-xs text-ghost mt-8 text-center font-medium">
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-paper hover:text-accent font-bold transition-colors ml-1 border-b border-paper/30 hover:border-accent">
              Create Free Account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Column - Graphic Code-Graph Visualizer */}
      <div className="hidden lg:flex w-1/2 bg-ink/90 relative overflow-hidden items-center justify-center border-l border-line p-12">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-transparent to-teal/[0.05]" />

        <div className="relative z-10 max-w-lg w-full space-y-6">
          <div className="p-8 backdrop-blur-2xl bg-panel2/90 border border-line rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-line pb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber/70" />
                <div className="w-3 h-3 rounded-full bg-teal/70" />
              </div>
              <div className="text-[11px] font-mono text-ghost/70 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber" /> VECTOR VECTORIZER ENGINE
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs leading-relaxed">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-teal flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal" /> Initialized MongoDB Vector Store
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="text-ghost flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" /> Indexed AST Token Chunks
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="text-ghost flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber" /> Groq LPU Model Ready
              </motion.div>

              <div className="mt-6 pt-4 border-t border-line/60 bg-ink/60 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-[10px] text-ghost/60">
                  <span>Cosine Similarity Pipeline</span>
                  <span className="text-teal font-bold">100% Ready</span>
                </div>
                <div className="h-2 bg-panel rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent via-teal to-amber rounded-full w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}