/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { mono: ['JetBrains Mono', 'monospace'] },
      colors: { feralBlack: '#000000', feralOrange: '#FF4500', feralGreen: '#00FF41', feralDark: '#0A0A0A' },
      keyframes: {
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'pulse-line': {
          '0%, 100%': { transform: 'scaleX(0)', opacity: '0.4' },
          '50%': { transform: 'scaleX(1)', opacity: '1' },
        },
      },
      animation: {
        scan: 'scan 4s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-line': 'pulse-line 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}