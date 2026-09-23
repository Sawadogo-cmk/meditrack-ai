/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef4fb',
          100: '#d6e4f5',
          200: '#b0caec',
          300: '#7aa6de',
          400: '#4a7fc9',
          500: '#2c5fab',
          600: '#1e4a8e',
          700: '#1a3b72',
          800: '#162f5a',
          900: '#0e1f3d',
        },
        accent: {
          50:  '#effcf9',
          100: '#c9f5ec',
          200: '#93ecdb',
          300: '#5cdcc4',
          400: '#3ddbc4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0a7668',
          800: '#0a5c52',
          900: '#084c44',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
      },
    },
  },
  plugins: [],
};