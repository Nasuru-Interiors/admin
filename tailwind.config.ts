import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    // Square design — every rounded-* utility resolves to 0.
    borderRadius: {
      none: '0',
      sm: '0',
      DEFAULT: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '0',
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7B1E2B',
          primary: '#7B1E2B',
          dark: '#4A0E1A',
          gold: '#C9A227',
          ink: '#2A1418',
          bg: '#F5F2F0',
          muted: '#6B5A5E',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(42,20,24,0.04), 0 8px 24px -16px rgba(42,20,24,0.25)',
        card: '0 1px 3px rgba(42,20,24,0.06), 0 14px 32px -20px rgba(42,20,24,0.30)',
      },
    },
  },
  plugins: [],
};

export default config;
