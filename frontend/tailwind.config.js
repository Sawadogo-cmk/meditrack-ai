/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
          400: '#3ddbc4',
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
    },
  },
  plugins: [],
}