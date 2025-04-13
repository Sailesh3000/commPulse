/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'network-bar-1': {
          '0%, 100%': { opacity: '0.2' },
          '0%, 25%': { opacity: '1' }
        },
        'network-bar-2': {
          '0%, 100%': { opacity: '0.2' },
          '25%, 50%': { opacity: '1' }
        },
        'network-bar-3': {
          '0%, 100%': { opacity: '0.2' },
          '50%, 75%': { opacity: '1' }
        },
        'network-bar-4': {
          '0%, 100%': { opacity: '0.2' },
          '75%, 100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}