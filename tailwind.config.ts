import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-dm-mono)', 'monospace'],
        display: ['var(--font-playfair)', 'serif'],
      },
      colors: {
        bg: 'var(--bg)',
        paper: 'var(--paper)',
        ink: {
          DEFAULT: 'var(--ink)',
          light: 'var(--ink-light)',
          faint: 'var(--ink-faint)',
        },
        rule: 'var(--rule)',
        finish: {
          DEFAULT: 'var(--finish)',
          bg: 'var(--finish-bg)',
        },
        bogey: {
          DEFAULT: 'var(--bogey)',
          bg: 'var(--bogey-bg)',
        },
        caution: {
          DEFAULT: 'var(--caution)',
          bg: 'var(--caution-bg)',
        },
        bust: 'var(--bust)',
      },
      fontSize: {
        '2xs': '10px',
      },
    },
  },
  plugins: [],
}

export default config
