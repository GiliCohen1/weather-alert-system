module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8",
        secondary: "#F59E0B",
        success: "#10B981",
        danger: "#EF4444",
        bg: "#F3F4F6",
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
