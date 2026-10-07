module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
    safelist: [
    "bg-orange-500",
    "bg-green-500",
    "bg-red-500",
    "hover:bg-orange-600",
    "hover:bg-green-600",
    "hover:bg-red-600",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#3730a3',
        accent: '#ec4899',
        dark: '#111827',
        light: '#f9fafb',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
        
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      }
    }
  },
  plugins: [],
}