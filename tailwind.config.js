module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ghost: '#F8F8F8',
        fab: '#5E936C',
        nav: '#113F67',
        primary: '#2B6A4A',
        accent: '#FFD166',
        muted: '#94A3B8',
        surface: '#FFFFFF',
        border: '#E6E9EE',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}