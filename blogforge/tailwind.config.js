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
        primary: {
          DEFAULT: '#1890FF',
          hover: '#40A9FF',
          active: '#096DD9',
          dark: '#177DDC',
          'dark-hover': '#3C9AE8',
          'dark-active': '#095CB5',
        },
        success: '#52C41A',
        warning: '#FAAD14',
        error: '#FF4D4F',
        text: {
          primary: '#262626',
          secondary: '#595959',
          tertiary: '#8C8C8C',
          disabled: '#BFBFBF',
        },
        border: '#D9D9D9',
        background: '#F5F5F5',
        'background-secondary': '#FAFAFA',
        dark: {
          text: {
            primary: '#FFFFFF',
            secondary: '#A6A6A6',
            tertiary: '#737373',
          },
          border: '#434343',
          background: '#141414',
          'background-secondary': '#1F1F1F',
          'background-tertiary': '#2A2A2A',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Microsoft YaHei', '-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'Noto Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      borderRadius: {
        'card': '8px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'modal': '0 4px 24px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
