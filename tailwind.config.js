/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        dashFadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        signalGlowLuxury: {
          '0%, 100%': { boxShadow: '0 0 24px -8px rgba(210,180,140,0.08)' },
          '50%': { boxShadow: '0 0 32px -6px rgba(46,90,58,0.15)' },
        },
        slideUpFade: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'dash-fade-in': 'dashFadeIn 0.45s ease-out both',
        'signal-glow-luxury': 'signalGlowLuxury 2.8s ease-in-out infinite',
        'slide-up-fade': 'slideUpFade 0.5s ease-out both',
      },
      colors: {
        /** Deepest app background — cool graphite, not pure black */
        charcoal: '#13141c',
        /** Panels / inset surfaces, one step above charcoal */
        'dark-gray': '#1c1d26',
        tan: {
          DEFAULT: '#D2B48C',
          muted: '#c4a57e',
          dim: 'rgba(210, 180, 140, 0.35)',
        },
        institutional: {
          green: '#2E5A3A',
          'green-muted': '#245030',
        },
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
        sans: ['var(--font-inter)', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      maxWidth: {
        content: '1400px',
      },
    },
  },
  plugins: [],
}
