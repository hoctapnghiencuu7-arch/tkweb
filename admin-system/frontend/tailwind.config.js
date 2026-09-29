/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff5f38',
          hover: '#e54e29',
          50: '#fff5f2',
          100: '#ffe8e2',
          500: '#ff5f38',
          600: '#e54e29',
        },
        navy: {
          900: '#0b111e',
          800: '#111927',
          700: '#1f293d',
          600: '#334155',
        }
      }
    },
  },
  plugins: [],
}
