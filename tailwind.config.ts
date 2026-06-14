import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1220",
          soft: "#121B2E",
          line: "#1F2A40",
        },
        paper: {
          DEFAULT: "#FAF7F0",
          soft: "#F1ECE1",
          line: "#E4DCC9",
        },
        gold: {
          DEFAULT: "#D4A24E",
          soft: "#F0DBB0",
          deep: "#B5832E",
        },
        teal: {
          DEFAULT: "#3FA796",
          soft: "#CDEDE6",
          deep: "#2C7A6D",
        },
        crimson: {
          DEFAULT: "#C1554D",
          soft: "#F4D9D6",
        },
        slate: {
          muted: "#8A93A6",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(11, 18, 32, 0.08)",
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.35)",
      },
      backdropBlur: {
        glass: "20px",
      },
      keyframes: {
        "ring-draw": {
          from: { strokeDashoffset: "var(--ring-circumference)" },
          to: { strokeDashoffset: "var(--ring-offset)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "ring-draw": "ring-draw 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards",
        "fade-up": "fade-up 0.5s ease-out forwards",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
