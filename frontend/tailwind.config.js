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
        "brand-discount": "#dc2626",
        "brand-amber": "#f59e0b",
        "brand-bg": "#f8fafc",
      },
      boxShadow: {
        premium: "0 10px 30px -15px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        "hover-card": "0 20px 40px -20px rgba(0, 0, 0, 0.08), 0 8px 12px -4px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
}