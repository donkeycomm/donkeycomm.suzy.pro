/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        default: '#0C150A',
        accent: '#955E34',
        shade: '#F5F6F4',
        'suzy-gray': '#E5E5E5',
      },
    },
  },

  plugins: [],
};
