/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#0F172A",
          600: "#2563EB",
          500: "#3B82F6",
          accent: "#F59E0B",
          success: "#10B981",
          danger: "#EF4444",
        },
        slate: {
          50: "#F8FAFC",
        }
      },
    },
  },
  plugins: [],
}

