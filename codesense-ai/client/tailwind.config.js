/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",        // Much deeper black for premium feel
        panel: "rgba(23, 23, 23, 0.6)",      // frosted glass background
        panel2: "rgba(38, 38, 38, 0.8)",     // raised frosted surface
        line: "#27272A",       // subtle gray borders
        amber: "#E8A33D",      // primary accent
        teal: "#4FD1C5",       // secondary accent
        accent: "#6366F1",     // Violet/Indigo accent for a more tech feel
        ghost: "#A1A1AA",      // muted text
        paper: "#F4F4F5",      // primary text
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        'blob': 'blob 7s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
};
