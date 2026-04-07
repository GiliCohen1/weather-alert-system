module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1D4ED8",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          DEFAULT: "#1D4ED8",
        },
        secondary: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#F59E0B",
          600: "#d97706",
          DEFAULT: "#F59E0B",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10B981",
          600: "#059669",
          DEFAULT: "#10B981",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          400: "#f87171",
          500: "#EF4444",
          600: "#dc2626",
          DEFAULT: "#EF4444",
        },
        bg: "#F3F4F6",
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out forwards",
        slideUp: "slideUp 0.5s ease-out forwards",
        slideInRight: "slideInRight 0.4s ease-out forwards",
        scaleIn: "scaleIn 0.3s ease-out forwards",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover":
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        glow: "0 0 15px rgb(59 130 246 / 0.5)",
      },
    },
  },
  plugins: [],
};
