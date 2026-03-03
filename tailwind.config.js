module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // v1 palette values preserved to maintain existing look
        gray: { 100: '#f7fafc', 200: '#edf2f7', 300: '#e2e8f0', 400: '#cbd5e0',
                500: '#a0aec0', 600: '#718096', 700: '#4a5568', 800: '#2d3748', 900: '#1a202c' },
        blue: { 900: '#2a4365' },
        red:  { 200: '#fed7d7', 400: '#fc8181', 700: '#c53030' },
        green:{ 200: '#c6f6d5', 400: '#68d391', 700: '#2f855a' },
      },
    },
  },
  plugins: [],
};
