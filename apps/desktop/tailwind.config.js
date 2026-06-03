/** @type {import('tailwindcss').Config} */
// Design tokens mirror the general.exchange web project so the desktop terminal
// reads as a continuation of the same product, not a separate application.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: '#13141c',
        'dark-gray': '#1c1d26',
        tan: {
          DEFAULT: '#D2B48C',
          muted: '#c4a57e',
          dim: 'rgba(210, 180, 140, 0.35)',
        },
        brass: {
          DEFAULT: '#C9A96E',
          deep: '#A88A4F',
          dim: 'rgba(201,169,110,0.28)',
        },
        moss: {
          DEFAULT: '#2E5A3A',
          deep: '#1C3A24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
