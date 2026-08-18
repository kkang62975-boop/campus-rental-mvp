/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdcff',
          300: '#8ec5ff',
          400: '#59a4ff',
          500: '#3182f6',
          600: '#1f66db',
          700: '#1c52b0',
          800: '#1d448c',
          900: '#1e3b6e',
        },
      },
    },
  },
  plugins: [],
}
