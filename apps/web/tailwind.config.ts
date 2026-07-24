import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0b12',
        surface: '#15151f',
        primary: '#e50914',
      },
    },
  },
  plugins: [],
};

export default config;
