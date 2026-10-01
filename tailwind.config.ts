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
          DEFAULT: '#2F5D8C',
          primary: '#2F5D8C',
          dark: '#1B3A5C',
          gold: '#C9A227',
          ink: '#14212F',
          bg: '#EEF2F7',
          muted: '#5A6878',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,33,47,0.04), 0 8px 24px -16px rgba(20,33,47,0.25)',
        card: '0 1px 3px rgba(20,33,47,0.06), 0 14px 32px -20px rgba(20,33,47,0.30)',
      },
    },
  },
  plugins: [],
};

export default config;
