/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#0f1419',
        panel2: '#1a2128',
        accent: '#3b82f6',
      },
    },
  },
  plugins: [],
};
