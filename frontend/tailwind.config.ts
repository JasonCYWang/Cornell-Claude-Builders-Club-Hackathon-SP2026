import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: 'var(--ivory)',
        warmWhite: 'var(--warm-white)',
        lavender: 'var(--lavender)',
        lavenderDeep: 'var(--lavender-deep)',
        mist: 'var(--mist)',
        rose: 'var(--rose)',
        roseDeep: 'var(--rose-deep)',
        sage: 'var(--sage)',
        textDark: 'var(--text-dark)',
        textMid: 'var(--text-mid)',
        textSoft: 'var(--text-soft)',
        glassBg: 'var(--glass-bg)',
        glassBorder: 'var(--glass-border)',
      },
      fontFamily: {
        display: ['"Bungee"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      borderRadius: {
        glass: '20px',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(44,36,32,0.10)',
      },
      transitionTimingFunction: {
        'soft-out': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config

