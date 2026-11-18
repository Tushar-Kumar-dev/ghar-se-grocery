/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        retail: {
          dark: '#0B0E14',
          surface: '#131722',
          card: '#171D2B',
          border: '#1E2638',
          accent: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#06B6D4'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
        handwritten: ['"Architects Daughter"', 'cursive'],
      }
    },
  },
  plugins: [],
}