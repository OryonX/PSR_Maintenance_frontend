/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // PSR Brand Colors extracted from design screenshots
        navy: {
          900: '#0B1526', // Main navy background (hero, footer, navbar)
          800: '#0F1E33', // Slightly lighter navy
          700: '#1B2A4A', // Navy accent
        },
        brand: {
          blue: '#233B5C',   // Buttons, accents
          light: '#2A4570',  // Hover states
        },
        whatsapp: {
          DEFAULT: '#22C55E',
          light: '#25D95C',
          dark: '#1EA550'
        },
        surface: {
          light: '#F7F9FC',  // Light section backgrounds
          white: '#FFFFFF'
        },
        // Trust badge colors
        trust: {
          gas: '#DC2626',      // Gas Safe - red
          partp: '#2563EB',    // Part P - blue
          insured: '#22C55E',  // Fully Insured - green
          mark: '#D97706'      // TrustMark - amber/gold
        }
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'count-up': 'countUp 0.5s ease-out forwards'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: []
}