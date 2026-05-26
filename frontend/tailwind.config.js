/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        midnight: "#0F1117",
        surface: "#16181D",
        card: "#1C1F26",
        border: "#2A2D35",
        muted: "#3A3D45",
        primary: "#4F8EF7",
        accent: "#6C63FF",
        lavender: "#E2E8F0",
        slate: "#94A3B8",
        steel: "#64748B",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};