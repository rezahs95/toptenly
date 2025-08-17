/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./pages/**/*.{js,ts,jsx,tsx}","./components/**/*.{js,ts,jsx,tsx}","./app/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    fontFamily: { sans: ['Vazirmatn','ui-sans-serif','system-ui','Arial'] },
    boxShadow: { soft: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)' }
  } },
  plugins: [],
};
