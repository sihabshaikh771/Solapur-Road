/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#F97316', dark: '#EA6C0D', light: '#FDBA74' },
        dark: { 900: '#0A0A0B', 800: '#111113', 700: '#1A1A1E', 600: '#242428', 500: '#2E2E34' }
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] }
    }
  },
  plugins: []
}
