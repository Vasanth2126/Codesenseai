import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Code2, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed w-full top-0 z-50 px-6 py-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-6xl mx-auto backdrop-blur-xl bg-panel/70 border border-white/5 rounded-2xl shadow-2xl h-14 flex items-center justify-between px-6 relative"
      >
        <Link to="/" className="font-display text-lg tracking-tight flex items-center gap-2 group">
          <Code2 className="w-5 h-5 text-accent transition-transform group-hover:rotate-12" />
          <span className="font-bold tracking-tight">CodeSense<span className="text-accent">AI</span></span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-body text-ghost">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={cn(
                  "relative py-1 transition-colors duration-300 hover:text-paper",
                  isActive("/dashboard") ? "text-paper" : ""
                )}
              >
                Projects
                {isActive("/dashboard") && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-accent rounded-full" 
                  />
                )}
              </Link>
              <span className="text-line hidden sm:inline h-4 w-[1px] bg-line block"></span>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 hover:text-paper transition group"
                >
                  <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs text-accent font-medium shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline text-paper">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-ghost group-hover:text-paper transition-transform" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 bg-panel2 border border-line rounded-xl shadow-2xl py-2 w-40 overflow-hidden"
                    >
                      <button
                        onClick={() => { logout(); navigate("/"); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 hover:text-accent transition flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-paper transition font-medium">Log in</Link>
              <Link
                to="/signup"
                className="relative group px-4 py-2 rounded-lg bg-paper text-ink font-semibold transition-all hover:scale-105"
              >
                <span className="relative z-10">Get started</span>
                <div className="absolute inset-0 rounded-lg bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </>
          )}
        </nav>
      </motion.div>
    </header>
  );
}