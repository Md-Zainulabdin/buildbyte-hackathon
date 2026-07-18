/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Helvetica Neue", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
      colors: {
        sky: {
          500: "#2E8AE6",
        },
        border: "#ECECEC",
        charcoal: "#1A1A1A",
        surface: "#FAFAFA",
        "brand-bg": "#EBF3FC",
      },
    },
  },
  plugins: [],
};
