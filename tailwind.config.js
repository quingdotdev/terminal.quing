/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        start: '#151B25',
        end: '#FFFFFF',
        cornflower: '#3A4655',
        charcoal: '#7DA1B8',
        ocean: '#4B596E',
        alert: '#FF6347',
        go: '#3CB371',
      },
    },
  },
  plugins: [],
}
