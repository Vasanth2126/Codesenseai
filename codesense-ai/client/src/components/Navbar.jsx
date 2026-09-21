import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Code2, ChevronDown, Menu, X, Sparkles, FolderGit2, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed w-full top-0 z-50 px-4 sm:px-6 py-4 pointer-events-none">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "max-w-6xl mx-auto backdrop-blur-2xl bg-panel2/90 border rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] h-14 flex items-center justify-between px-5 relative pointer-events-auto transition-all duration-500",
          scrolled ? "border-accent/40 shadow-[0_12px_40px_rgba(129,140,248,0.12)] bg-ink/95" : "border-line"
        )}
      >
        {/* Top subtle glow line on scroll */}
        {scrolled && (
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        )}

        {/* Brand Logo */}
        <Link to="/" className="font-display text-lg tracking-tight flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-accent/30 rounded-xl blur-md animate-pulse-glow" />
            <div className="w-8 h-8 rounded-xl bg-ink border border-accent/40 flex items-center justify-center text-accent relative z-10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-[0_0_15px_rgba(129,140,248,0.3)]">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight bg-gradient-to-r from-paper via-paper/90 to-ghost bg-clip-text text-transparent leading-none">
              CodeSense<span className="text-accent font-extrabold drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]">AI</span>
            </span>
            <span className="text-[9px] font-mono text-ghost/60 uppercase tracking-widest leading-none mt-0.5 hidden sm:inline">Repo Intelligence</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-body text-ghost">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={cn(
                  "relative py-1 text-sm font-medium transition-colors duration-300 flex items-center gap-2",
                  isActive("/dashboard") ? "text-paper" : "hover:text-paper"
                )}
              >
                <FolderGit2 className="w-4 h-4 text-accent/80" />
                Workspaces
                {isActive("/dashboard") && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-teal rounded-full" 
                  />
                )}
              </Link>

              <div className="h-4 w-[1px] bg-line" />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 hover:text-paper transition group bg-ink/50 border border-line hover:border-accent/30 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent/30 to-teal/20 border border-accent/40 flex items-center justify-center text-xs text-accent font-mono font-bold shadow-[0_0_8px_rgba(129,140,248,0.3)]">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-paper text-xs font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-ghost group-hover:text-paper transition-transform duration-300", menuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 bg-panel2/95 backdrop-blur-2xl border border-line rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-2 w-48 overflow-hidden z-50"
                    >
                      <div className="px-4 py-2 border-b border-line mb-1">
                        <p className="text-xs font-semibold text-paper truncate">{user.name}</p>
                        <p className="text-[10px] font-mono text-ghost/70 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => { logout(); navigate("/"); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-ghost hover:bg-red-500/10 hover:text-red-400 transition flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-white transition-colors font-medium text-xs sm:text-sm">Log in</Link>
              <Link
                to="/signup"
                className="relative group px-4 py-2 rounded-xl bg-gradient-to-br from-paper via-paper/90 to-ghost text-ink font-bold text-xs sm:text-sm transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)] overflow-hidden flex items-center gap-1.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="relative z-10">Get Started Free</span>
                <Sparkles className="w-3.5 h-3.5 relative z-10 text-accent shrink-0" />
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="p-2 rounded-xl bg-panel border border-line text-ghost hover:text-paper"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden max-w-6xl mx-auto mt-2 bg-panel2/95 backdrop-blur-2xl border border-line rounded-2xl p-4 shadow-2xl pointer-events-auto flex flex-col gap-3"
          >
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-line">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-paper">{user.name}</p>
                    <p className="text-xs font-mono text-ghost/70">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-ink/50 border border-line text-paper font-medium text-sm flex items-center gap-2"
                >
                  <FolderGit2 className="w-4 h-4 text-accent" /> Workspaces
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); setMobileNavOpen(false); }}
                  className="py-2.5 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-panel border border-line text-paper font-medium text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-white text-ink font-bold text-sm"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}