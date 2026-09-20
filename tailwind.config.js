/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          dark: '#0a0a0c',
          darker: '#050505',
          neon: '#00ffcc',
          gold: '#ffd700',
          purple: '#8a2be2',
        }
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle, var(--tw-gradient-stops))',
        'conic-gradient': 'conic-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px #00ffcc' },
          '50%': { opacity: .7, boxShadow: '0 0 10px #00ffcc' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
