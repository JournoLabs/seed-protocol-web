/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,css}'],
  theme: {
    extend: {
      ringColor: {
        DEFAULT: 'transparent',
        focus: 'transparent',
      }
    },
  },
  plugins: [],
}

