import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E10600',
          primary: '#E10600',
          dark: '#B10500',
          ink: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
};

export default config;
