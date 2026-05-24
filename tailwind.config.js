/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#F97316",
          light: "#FFF7ED",
          dark: "#EA580C",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8FAFC",
          border: "#E2E8F0",
        },
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
          muted: "#94A3B8",
        },
        status: {
          completed: "#10B981",
          progress: "#3B82F6",
          pending: "#F59E0B",
          cancelled: "#A78BFA",
          danger: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
