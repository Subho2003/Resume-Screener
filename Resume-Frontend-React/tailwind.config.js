export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        'spin-reverse': 'spin 2s linear infinite reverse',
        'pulse-scale': 'pulse 1.5s infinite',
      },
    },
  },
  plugins: [],
}