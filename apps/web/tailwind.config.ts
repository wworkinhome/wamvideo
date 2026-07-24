import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#141414',
        surface: '#1f1f1f',
        primary: '#e50914',
      },
    },
  },
  plugins: [],
};

export default config;
