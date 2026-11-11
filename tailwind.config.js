/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rr-blue': '#0B2B5C',
        'rr-pink': '#EC008C',
        'rr-purple': '#7B3FF2',
      },
    },
  },
  plugins: [],
}
