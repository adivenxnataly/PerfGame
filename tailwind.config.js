/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./webui/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
}

