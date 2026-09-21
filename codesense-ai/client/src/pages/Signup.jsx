import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Code2, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-ink font-body relative overflow-hidden selection:bg-teal/30 selection:text-white flex-row-reverse">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 right-1/6 w-[500px] h-[500px] bg-teal/[0.06] rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-1/3 left-1/6 w-[450px] h-[450px] bg-accent/[0.05] rounded-full blur-[140px] animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
      </div>

      {/* Right Column - Form Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="absolute top-8 right-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="font-display font-bold text-paper text-base group-hover:text-teal transition-colors tracking-tight">
              CodeSense<span className="text-teal">AI</span>
            </span>
            <div className="w-9 h-9 rounded-xl bg-panel2 border border-line flex items-center justify-center group-hover:border-teal/50 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              <Code2 className="w-4 h-4 text-teal" />
            </div>
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
              <Sparkles className="w-3.5 h-3.5" /> CREATE DEVELOPER ACCOUNT
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-paper tracking-tight mb-2">Get Started</h1>
            <p className="text-ghost text-sm leading-relaxed">Start indexing GitHub repositories and asking AI questions in under a minute.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-ghost/80 uppercase tracking-widest font-semibold ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal/20 to-accent/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-ink/60 border border-line rounded-xl overflow-hidden backdrop-blur-xl transition-all group-focus-within:border-teal/60 group-focus-within:shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                  <div className="pl-4 pr-3 flex items-center justify-center">
                    <User className="w-4 h-4 text-ghost group-focus-within:text-teal transition-colors duration-300" />
                  </div>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent py-3.5 pr-4 text-sm text-paper focus:outline-none placeholder:text-ghost/40 font-medium"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-ghost/80 uppercase tracking-widest font-semibold ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal/20 to-accent/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-ink/60 border border-line rounded-xl overflow-hidden backdrop-blur-xl transition-all group-focus-within:border-teal/60 group-focus-within:shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                  <div className="pl-4 pr-3 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-ghost group-focus-within:text-teal transition-colors duration-300" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-3.5 pr-4 text-sm text-paper focus:outline-none placeholder:text-ghost/40 font-medium"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-ghost/80 uppercase tracking-widest font-semibold ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal/20 to-accent/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-ink/60 border border-line rounded-xl overflow-hidden backdrop-blur-xl transition-all group-focus-within:border-teal/60 group-focus-within:shadow-[0_0_20px_rgba(20,184,166,0.15)]">
                  <div className="pl-4 pr-3 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-ghost group-focus-within:text-teal transition-colors duration-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-3.5 pr-10 text-sm text-paper focus:outline-none placeholder:text-ghost/40 font-medium"
                    placeholder="At least 6 characters"
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
              className="w-full group relative py-4 rounded-xl overflow-hidden text-ink font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(20,184,166,0.3)] mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal via-teal/90 to-accent transition-transform duration-300 group-hover:scale-105" />
              <div className="relative flex items-center justify-center gap-2 text-sm z-10">
                {busy ? (
                  <div className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <p className="text-xs text-ghost mt-8 text-center font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-paper hover:text-teal font-bold transition-colors ml-1 border-b border-paper/30 hover:border-teal">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Left Column - Tech Stack Graphic Visualizer */}
      <div className="hidden lg:flex w-1/2 bg-ink/90 relative overflow-hidden items-center justify-center border-r border-line p-12">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-teal/[0.06] via-transparent to-accent/[0.05]" />

        <div className="relative z-10 max-w-lg w-full space-y-6">
          <div className="p-8 backdrop-blur-2xl bg-panel2/90 border border-line rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-line pb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber/70" />
                <div className="w-3 h-3 rounded-full bg-teal/70" />
              </div>
              <div className="text-[11px] font-mono text-ghost/70 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal" /> ZERO CONFIGURATION SETUP
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs leading-relaxed">
              <div className="flex items-center justify-between p-3 rounded-xl bg-ink/60 border border-line">
                <span className="text-paper font-semibold">1. Paste Repository URL</span>
                <CheckCircle2 className="w-4 h-4 text-teal" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-ink/60 border border-line">
                <span className="text-paper font-semibold">2. Auto Chunk & Vectorize</span>
                <CheckCircle2 className="w-4 h-4 text-teal" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-ink/60 border border-line">
                <span className="text-paper font-semibold">3. Ask & Auto Generate README</span>
                <CheckCircle2 className="w-4 h-4 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}