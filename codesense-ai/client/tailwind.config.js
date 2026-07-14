/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1320",        // base background, deep editor navy
        panel: "#171B2E",      // surface / card background
        panel2: "#1F2440",     // raised surface (hover, inputs)
        line: "#2A2F4A",       // hairline borders
        amber: "#E8A33D",      // primary accent — keyword highlight
        teal: "#4FD1C5",       // secondary accent — string/link highlight
        ghost: "#7C89A6",      // muted text
        paper: "#EDEFF7",      // primary text
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
