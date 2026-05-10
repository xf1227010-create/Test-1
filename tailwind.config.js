/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Stitch 设计原色 (移植自 stitch-design/code.html)
        background: '#111318',
        primary: '#b3c5ff',
        'on-primary': '#002b75',
        'primary-container': '#0066ff',
        'on-primary-container': '#f8f7ff',
        'secondary-container': '#00eefc',
        'secondary-fixed-dim': '#00dbe9',
        outline: '#8c90a1',
        'outline-variant': '#424656',
        'on-surface': '#e2e2e8',
        'on-surface-variant': '#c2c6d8',
        'surface-container-lowest': '#0c0e12',
        'surface-container-low': '#1a1c20',
        'surface-container-high': '#282a2e',
        'surface-container-highest': '#333539',
        // 兼容旧组件
        panel: '#111318',
        panel2: '#1a1c20',
        accent: '#0066ff',
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['Metropolis', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'label-caps': ['11px', { lineHeight: '16px', letterSpacing: '0.06em', fontWeight: '700' }],
        'data-mono': ['13px', { lineHeight: '18px', letterSpacing: '-0.01em', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
};
