import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        mist: '#f5f7fb',
        line: '#d8dee8',
        brand: '#0d9488',
        accent: '#1d4ed8',
        success: '#15803d',
        warning: '#b45309',
        danger: '#b91c1c'
      },
      boxShadow: {
        soft: '0 16px 40px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        xl2: '1.5rem'
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
