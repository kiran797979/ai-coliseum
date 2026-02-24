/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          dark: '#0f172a',
          darker: '#020617',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'float-slow': 'floatSlow 20s ease-in-out infinite',
        'float-medium': 'floatMedium 15s ease-in-out infinite',
        'float-fast': 'floatFast 10s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'floatSlow': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(-20px, 30px) scale(0.95)' },
          '75%': { transform: 'translate(20px, 20px) scale(1.02)' },
        },
        'floatMedium': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-25px, 25px) scale(1.03)' },
          '66%': { transform: 'translate(25px, -15px) scale(0.97)' },
        },
        'floatFast': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, -20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}