/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'custom-gray': '#F2F2F2',
        'custom-blue': '#3471C7',
        'custom-dark-blue': '#244EAD',
        'custom-darker-blue': '#2D61A6',
        'custom-orange': '#F28066',
        'custom-light-orange': '#FF7924',

      },
    },
  },
  plugins: [],
};
