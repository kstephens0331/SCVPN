/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // include js/jsx too
  ],
  theme: { extend: {} },
  plugins: [require('tailwindcss-animate')],
}
