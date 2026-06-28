/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { mono: ['JetBrains Mono', 'monospace'] },
      colors: { feralBlack: '#000000', feralOrange: '#FF4500', feralGreen: '#00FF41', feralDark: '#0A0A0A' }
    }
  },
  plugins: [],
}