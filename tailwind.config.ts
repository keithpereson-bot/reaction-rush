import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./games/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#08090c",
          900: "#0e1015",
          800: "#161923",
          700: "#20242f",
        },
        ready: "#3b82f6",
        wait: "#e11d48",
        go: "#22c55e",
        accent: "#a3ff12",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        "go-burst": {
          "0%": { transform: "scale(0.3)", opacity: "0.9" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "score-pop": {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(140px) rotate(360deg)", opacity: "0" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        "pop-in": "pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        shake: "shake 0.3s ease-in-out",
        "go-burst": "go-burst 0.5s ease-out forwards",
        "score-pop": "score-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "confetti-fall": "confetti-fall 1.1s ease-in forwards",
      },
    },
  },
  plugins: [],
};

export default config;
