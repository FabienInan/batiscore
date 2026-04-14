/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-lexend)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          foreground: '#FFFFFF',
          dark: '#1D4ED8',
          light: '#60A5FA',
        },
        accent: {
          DEFAULT: '#F97316',
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#F8FAFC',
          paper: '#FFFFFF',
        },
        semantic: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      },
      boxShadow: {
        'saas': '0 1px 3px rgb(0 0 0 / 0.06), 0 4px 16px rgb(0 0 0 / 0.04)',
        'saas-hover': '0 4px 8px rgb(0 0 0 / 0.06), 0 12px 32px rgb(0 0 0 / 0.08)',
        'saas-lg': '0 8px 16px rgb(0 0 0 / 0.06), 0 24px 48px rgb(0 0 0 / 0.08)',
        'glow-orange': '0 0 0 4px rgb(249 115 22 / 0.12)',
        'glow-blue': '0 0 0 4px rgb(37 99 235 / 0.12)',
      },
      borderRadius: {
        'xl': '12px',
        'lg': '8px',
        '2xl': '16px',
        '3xl': '24px',
      },
      keyframes: {
        'accordion-down': {
          from: { maxHeight: '0', opacity: '0' },
          to: { maxHeight: '500px', opacity: '1' },
        },
        'accordion-up': {
          from: { maxHeight: '500px', opacity: '1' },
          to: { maxHeight: '0', opacity: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.25s ease-out forwards',
        'accordion-up': 'accordion-up 0.2s ease-in forwards',
        'fade-up': 'fade-up 0.3s ease-out',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
