/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
      },
      colors: {
        portal: {
          bg: '#F3F5F7',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        teal: {
          50: '#F0F7F7',
          100: '#DCEAEB',
          200: '#C3DFE1',
          500: '#629A9E',
          600: '#5E9CA0',
          700: '#4D868A',
          800: '#3D6E72',
        },
        softAmber: {
          50: '#FDF7ED',
          100: '#FDF3E3',
          200: '#F7E5C4',
          300: '#ECD3A8',
          700: '#A06C1C',
          800: '#78350F',
        },
        softMint: {
          50: '#F0FAF4',
          100: '#E3F8EC',
          200: '#C7EDD6',
          300: '#A5DEC0',
          700: '#1B7A4B',
          800: '#065F46',
        },
        royal: {
          400: '#3b82f6',
          500: '#1d68ff',
          600: '#155dfc',
          700: '#004fe6',
          800: '#003eb8'
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#629A9E',
          600: '#5E9CA0',
          700: '#4D868A',
          800: '#075985',
          900: '#0c4a6e'
        }
      },
      boxShadow: {
        'card-soft': '0 4px 14px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 24px rgba(94, 156, 160, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
