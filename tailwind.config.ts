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
        ink: '#0f172a',
        mist: '#f5f8ff',
        line: '#d7e1f4',
        brand: '#1f4fff',
        accent: '#163bce',
        success: '#15803d',
        warning: '#b45309',
        danger: '#b91c1c'
      },
      boxShadow: {
        soft: '0 24px 72px rgba(15, 23, 42, 0.08)',
        focus: '0 18px 50px rgba(37, 99, 235, 0.16)'
      },
      borderRadius: {
        xl2: '1.5rem'
      },
      fontFamily: {
        sans: ['Aptos', 'Segoe UI', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;

