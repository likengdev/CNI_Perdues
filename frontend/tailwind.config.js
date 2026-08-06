/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9', // Bleu ciel confiance
          600: '#0284c7', // Bleu institutionnel
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e', // Bleu nuit sérieux
        },
        success: '#10b981', // Vert pour la validation
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0,0,0,0.05)',
        'card': '0 10px 30px rgba(0,0,0,0.08)',
        'glow': '0 0 40px rgba(14,165,233,0.25)',
        'glow-lg': '0 20px 50px rgba(2,132,199,0.2)',
      },
      animation: {
        'spin-slow': 'spin 40s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}