import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b border-line bg-ink/80 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-lg tracking-tight flex items-center gap-2 group">
          <span className="text-amber transition-transform group-hover:-rotate-6 inline-block">&lt;/&gt;</span>
          <span>CodeSense<span className="text-teal">AI</span></span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-body text-ghost">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`relative pb-1 transition ${isActive("/dashboard") ? "text-paper" : "hover:text-paper"}`}
              >
                Projects
                {isActive("/dashboard") && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-amber rounded-full" />
                )}
              </Link>
              <span className="text-line hidden sm:inline">|</span>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 hover:text-paper transition"
                >
                  <span className="w-6 h-6 rounded-full bg-panel2 border border-line flex items-center justify-center text-xs text-amber font-medium">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </span>
                  <span className="hidden sm:inline text-paper">{user.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-panel border border-line rounded-lg shadow-xl py-1 w-36 animate-fade-in">
                    <button
                      onClick={() => { logout(); navigate("/"); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-panel2 hover:text-amber transition"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-paper transition">Log in</Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 rounded-md bg-amber text-ink font-medium hover:bg-amber/90 hover:-translate-y-0.5 transition-all"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}