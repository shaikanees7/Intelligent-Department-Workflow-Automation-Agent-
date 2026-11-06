/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
      },
      colors: {
        // SaaS Purple & Deep Navy Design System (From Reference)
        saas: {
          canvas: '#F6EFF2',
          surface: '#FAF5F7',
          card: '#FFFFFF',
          border: '#EAE0E8',
          borderSubtle: '#F0E8EE',
          darkCard: '#1E163B',
          darkCardBorder: '#362B5E',
          textDark: '#261B50',
          textMuted: '#7C7390',
          textLight: '#9F97B0',
          primary: '#B95BD5',
          primaryHover: '#A847C5',
          primaryActive: '#9534B2',
          primaryLight: '#F7EDFA',
          secondary: '#5B5072',
          secondaryHover: '#493E60',
          accent: '#D8B8E8',
          accentMuted: '#EAE0F0',
          navy: '#261B50',
          navyHover: '#34265F',
        },
        portal: {
          bg: '#F6EFF2',
          card: '#FFFFFF',
          border: '#EAE0E8',
        },
        purple: {
          50: '#FAF5FB',
          100: '#F3E8F6',
          200: '#E6CFF0',
          300: '#D8B8E8',
          400: '#C775DE',
          500: '#B95BD5',
          600: '#A847C5',
          700: '#8E32A8',
          800: '#6C2182',
          900: '#4B165C',
        },
        navy: {
          50: '#F5F4F9',
          100: '#EBE9F3',
          200: '#D4CEE4',
          300: '#B3A9CE',
          400: '#8474AA',
          500: '#5F4F8B',
          600: '#4A3B78',
          700: '#34265F',
          800: '#261B50',
          900: '#1A1238',
          950: '#120C26',
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
        primary: {
          50: '#F7EDFA',
          100: '#F3E8F6',
          500: '#B95BD5',
          600: '#A847C5',
          700: '#8E32A8',
          800: '#261B50',
          900: '#1A1238'
        }
      },
      boxShadow: {
        'card-soft': '0 10px 30px -5px rgba(38, 27, 80, 0.05)',
        'card-hover': '0 20px 40px -10px rgba(38, 27, 80, 0.1)',
        'dark-card': '0 20px 45px -10px rgba(22, 15, 44, 0.35)',
        'purple-glow': '0 4px 20px rgba(185, 91, 213, 0.35)',
        'pill': '0 2px 10px rgba(38, 27, 80, 0.06)'
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px'
      }
    },
  },
  plugins: [],
};
