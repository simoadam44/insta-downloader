import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#a855f7',
          violet: '#7c3aed',
          pink: '#ec4899',
          blue: '#0ea5e9',
          dark: '#1e1b4b'
        }
      },
      boxShadow: {
        card: '0 8px 30px rgba(124,58,237,.12)'
      }
    }
  },
  plugins: []
};
export default config;
