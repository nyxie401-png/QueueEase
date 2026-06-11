/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // QueueEase V2 Color Palette
        navy: {
          DEFAULT: '#071B34',
          50: '#1a3a5c',
          100: '#15325a',
          200: '#102a4f',
          300: '#0B2447',
          400: '#091e3a',
          500: '#071B34',
          600: '#061729',
          700: '#04101d',
          800: '#030a12',
          900: '#010509',
        },
        midnight: {
          DEFAULT: '#0B2447',
          light: '#133366',
          dark: '#081b38',
        },
        teal: {
          DEFAULT: '#00B7A8',
          50: '#e6f9f7',
          100: '#b3efe8',
          200: '#80e5d9',
          300: '#4ddbca',
          400: '#26d4bf',
          500: '#00B7A8',
          600: '#009e92',
          700: '#00857c',
          800: '#006c65',
          900: '#00534e',
        },
        cyan: {
          DEFAULT: '#4FD1C5',
          light: '#7ee0d8',
          dark: '#2ab5a7',
        },
        // Semantic colors
        emergency: {
          DEFAULT: '#EF4444',
          light: '#FCA5A5',
          dark: '#DC2626',
        },
        urgent: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dark: '#D97706',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#6EE7B7',
          dark: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ecg-line': 'ecgLine 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        ecgLine: {
          '0%, 100%': { transform: 'scaleX(1)', opacity: '1' },
          '50%': { transform: 'scaleX(1.05)', opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 183, 168, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 183, 168, 0.8), 0 0 40px rgba(79, 209, 197, 0.4)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        'neon': '0 0 5px rgba(0, 183, 168, 0.5), 0 0 20px rgba(0, 183, 168, 0.3), 0 0 40px rgba(79, 209, 197, 0.1)',
        'neon-strong': '0 0 5px rgba(0, 183, 168, 0.8), 0 0 20px rgba(0, 183, 168, 0.5), 0 0 60px rgba(79, 209, 197, 0.3)',
      },
    },
  },
  plugins: [],
}
