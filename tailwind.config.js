/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F5F0E8',
        ocean: '#1B2F3A',
        earth: '#4A3527',
        gold: '#B99A53',
        sand: '#E6DCCF',
        coconut: '#B89C78',
        palm: '#556B4D',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        brand: '0.3em',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '12%': { opacity: '1', transform: 'translateY(0)' },
          '88%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(16px)' },
        },
        slowZoom: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.9s ease-out both',
        'fade-in-up': 'fadeInUp 0.9s cubic-bezier(0.16,1,0.3,1) both',
        'toast': 'toastIn 3s ease-in-out forwards',
        'slow-zoom': 'slowZoom 18s ease-out both',
      },
    },
  },
  plugins: [],
}
