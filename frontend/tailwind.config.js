/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
      },
      colors: {
        duke: {
          blue: '#2563EB',      // Duke royal blue
          accent: '#3B82F6',    // Bright vivid blue
          light: '#60A5FA',     // Light blue
          dark: '#1D4ED8',      // Deep royal blue
          navy: '#0F172A',      // Dark slate / navy
          black: '#000000',     // Pure black
          card: 'rgba(10, 10, 10, 0.75)',
          border: 'rgba(255, 255, 255, 0.12)',
        },
        royal: {
          400: '#3b82f6',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554'
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        }
      },
      boxShadow: {
        'duke-glow': '0 0 25px -5px rgba(59, 130, 246, 0.45)',
        'duke-glow-lg': '0 0 40px -5px rgba(59, 130, 246, 0.6)',
        'duke-card': '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      transitionTimingFunction: {
        'duke-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
