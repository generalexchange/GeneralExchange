/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        dashFadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        signalGlow: {
          '0%, 100%': { boxShadow: '0 0 20px -4px rgba(52, 211, 153, 0.35)' },
          '50%': { boxShadow: '0 0 28px -2px rgba(52, 211, 153, 0.55)' },
        },
        signalGlowRose: {
          '0%, 100%': { boxShadow: '0 0 20px -4px rgba(251, 113, 133, 0.35)' },
          '50%': { boxShadow: '0 0 28px -2px rgba(251, 113, 133, 0.55)' },
        },
        signalGlowAmber: {
          '0%, 100%': { boxShadow: '0 0 18px -4px rgba(251, 191, 36, 0.3)' },
          '50%': { boxShadow: '0 0 26px -2px rgba(251, 191, 36, 0.45)' },
        },
      },
      animation: {
        'dash-fade-in': 'dashFadeIn 0.4s ease-out both',
        'signal-glow-emerald': 'signalGlow 2.5s ease-in-out infinite',
        'signal-glow-rose': 'signalGlowRose 2.5s ease-in-out infinite',
        'signal-glow-amber': 'signalGlowAmber 2.8s ease-in-out infinite',
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        display: ['"Instrument Serif"', 'Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
}

