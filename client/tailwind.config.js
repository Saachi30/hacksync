module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#faf7f2',
          100: '#f5efe5',
          200: '#ebe0cc',
        },
        brown: {
          600: '#8b5e34',
          700: '#724c2a',
          800: '#593a20',
        }
      }
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
  ],
}