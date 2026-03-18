/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Intrex refined color palette
        bg: {
          primary: '#09090E',
          secondary: '#0C0D15',
          surface: '#0F1018',
        },
        brand: {
          primary: '#6D5BFF',
          secondary: '#00D4FF',
          success: '#10F0A0',
          accent: '#F59E0B',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#9CA3C8',
          tertiary: '#4B5280',
        },
        // Light theme colors
        light: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#f1f5f9',
          300: '#e2e8f0',
          400: '#cbd5e1',
          500: '#94a3b8',
          600: '#64748b',
          700: '#475569',
          800: '#334155',
          900: '#1e293b',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Semantic colors
        semantic: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // Focus and interactive
        focus: '#a78bfa',
        // Scrollbar colors
        scrollbar: {
          track: '#0f172a',
          thumb: '#334155',
          thumbHover: '#475569',
        },
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.005em' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.015em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.015em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      lineHeight: {
        tight: '1.1',
        snug: '1.25',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        'gradient-accent': 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%) !important',
        'gradient-subtle': 'linear-gradient(180deg, #0B1220 0%, #0F172A 100%)',
      },
      // Add missing custom utilities
      backgroundColor: {
        'dark-900': '#0B1220',
        'dark-400': '#94a3b8',
        'dark-300': '#cbd5e1',
        'dark-200': '#e2e8f0',
        'dark-100': '#f1f5f9',
      },
      textColor: {
        'dark-900': '#0B1220',
        'dark-400': '#94a3b8',
      },
      borderColor: {
        'surface-border': '#1E293B',
      },
    },
  },
  plugins: [],
}
