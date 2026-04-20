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
        paper: {
          50: '#FBF9F4',
          100: '#F5F2EB',
          200: '#ECE8DD',
          300: '#D9D3C4',
          400: '#A8A495',
        },
        graphite: {
          900: '#0F1216',
          800: '#1B1F24',
          700: '#2B3039',
          600: '#474C55',
          500: '#6B7079',
          400: '#8E9299',
        },
        navy: {
          DEFAULT: '#14213D',
          deep: '#0E1729',
          wash: 'rgba(20,33,61,0.06)',
        },
        brass: {
          DEFAULT: '#C9A96E',
          deep: '#A88A4F',
          dim: 'rgba(201,169,110,0.28)',
        },
        bone: {
          50: '#F5F2EB',
          100: '#ECE8E0',
          200: '#E3DDD2',
          300: '#CFC8B8',
        },
        moss: {
          DEFAULT: '#2E5A3A',
          deep: '#1C3A24',
          wash: 'rgba(46,90,58,0.08)',
        },
      },
      boxShadow: {
        plaque: '0 1px 0 rgba(27,31,36,0.04) inset, 0 24px 60px -40px rgba(27,31,36,0.25)',
        vellum: '0 2px 18px rgba(27,31,36,0.06), 0 0 0 1px rgba(201,169,110,0.14)',
        engrave: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(27,31,36,0.08)',
        ledger: '0 1px 0 rgba(201,169,110,0.35), 0 2px 0 rgba(27,31,36,0.04)',
      },
      backgroundImage: {
        'paper-grain':
          'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,169,110,0.06), transparent 60%), radial-gradient(ellipse 50% 40% at 10% 100%, rgba(20,33,61,0.04), transparent 55%)',
        vellum:
          'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(201,169,110,0.08), transparent 60%), radial-gradient(ellipse 40% 60% at 85% 100%, rgba(46,90,58,0.05), transparent 55%)',
        'hairline-h':
          'linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.35) 20%, rgba(201,169,110,0.35) 80%, transparent 100%)',
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
