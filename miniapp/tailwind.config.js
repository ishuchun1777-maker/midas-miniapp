/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          300: '#5eead4', 400: '#2dd4bf', 500: '#0d9488',
          600: '#0f766e', 700: '#115e59',
        },
        gold: {
          300: '#fcd34d', 400: '#fbbf24', 500: '#c8a84b',
          600: '#b8960e', 700: '#a07810',
        },
        obs: {
          100: '#e2e8f0', 200: '#94a3b8', 300: '#64748b',
          400: '#475569', 500: '#334155', 600: '#1e293b',
          700: '#1a2530', 800: '#0f1419', 900: '#060809', 950: '#030405',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow: { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
}
