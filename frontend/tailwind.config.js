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
      },
      animation: {
        'spin-slow': 'spin 40s linear infinite',
      }
    },
  },
  plugins: [],
}