/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        surface: "#ffffff",
        border: "#e2e8f0",
        text: "#0f172a",
        muted: "#6b7280",
        primary: "#4f46e5",
        "primary-hover": "#4338ca",
        secondary: "#6366f1",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
      },
    },
  },
  plugins: [],
}