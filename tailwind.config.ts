import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Broadcast type system: Anton numerals, Barlow Condensed labels, Barlow body.
        num: ['var(--font-anton)', 'Impact', 'sans-serif'],
        cond: ['var(--font-condensed)', 'sans-serif'],
        sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        paper: 'var(--paper)',
        panel: 'var(--panel)',
        key: 'var(--key)',
        ink: {
          DEFAULT: 'var(--ink)',
          light: 'var(--ink-light)',
          faint: 'var(--ink-faint)',
        },
        rule: {
          DEFAULT: 'var(--rule)',
          strong: 'var(--rule-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          dim: 'var(--accent-dim)',
        },
        p2: 'var(--p2)',
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
      letterSpacing: {
        label: '0.18em',
        caps: '0.12em',
      },
    },
  },
  plugins: [],
}

export default config
