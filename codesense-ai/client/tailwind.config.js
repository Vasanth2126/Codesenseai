/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",        // Even deeper black for absolute premium feel
        panel: "rgba(18, 18, 20, 0.65)",      // Frosted glass background
        panel2: "rgba(32, 32, 35, 0.85)",     // Raised frosted surface
        line: "rgba(255, 255, 255, 0.08)",    // Ultra-subtle borders
        amber: "#F59E0B",      // primary accent
        teal: "#14B8A6",       // secondary accent
        accent: "#818CF8",     // Indigo accent, slightly brighter
        accentHover: "#6366F1",
        ghost: "#A1A1AA",      // muted text
        paper: "#FAFAFA",      // crisp white text
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        'blob': 'blob 10s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-beam': 'border-beam 3s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.15)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.85)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: .7, filter: 'brightness(1.3) drop-shadow(0 0 10px rgba(99,102,241,0.5))' },
        },
        'border-beam': {
          '100%': { transform: 'rotate(1turn)' },
        }
      }
    },
  },
  plugins: [],
};
