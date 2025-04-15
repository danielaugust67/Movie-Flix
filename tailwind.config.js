/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          black: '#141414',
        },
      },
      spacing: {
        '128': '32rem',
      },
      height: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
};