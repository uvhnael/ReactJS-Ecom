/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '128': '32rem',
        '144': '48rem',


      },
      width: {
        '128': '32rem',
        '144': '48rem',
      },

    },
  },
  plugins: [],
}