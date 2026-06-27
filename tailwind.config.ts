import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7B1E2B',
          primary: '#7B1E2B',
          dark: '#4A0E1A',
          gold: '#C9A227',
          ink: '#2A1418',
        },
      },
    },
  },
  plugins: [],
};

export default config;
