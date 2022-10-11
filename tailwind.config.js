/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './dist/*.js',
    './assets/js/*.js'
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '660px',
      lg: '992px',
      xl: '1440px',
    },
    colors: {
      'primary': '#fe5a0e',
      'title': '#222222',
      'paragraph': '9b9b9b',
      'bg': '#f7f9fa',
      'bg_banner': '#e9e9e9',
      'bg_footer': '#222222',
      'white': '#fff',
      'black': '#000',
      'transparent': 'transparent',
      'current': 'currentColor',

    },
    fontFamily: {
      montserrat: ['Montserrat', 'sans-serif'],
    },
    fontSize: {
      sm: ['14px', '24px'],
      base: ['16px', '26px'],
      lg: ['20px', '28px'],
      xl: ['24px', '30px'],
      '2xl': ['28px', '32px'],
      '3xl': ['32px', '34px'],
      '4xl': ['36px', '36px'],
    },

    extend: {
      boxShadow: {
        'card': '0 5px 20px 2px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
