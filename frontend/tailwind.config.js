/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0, transform: "translateY(4px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        pulseSlow: { "0%,100%": { opacity: 0.6 }, "50%": { opacity: 1 } },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease-out both",
        pulseSlow: "pulseSlow 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
