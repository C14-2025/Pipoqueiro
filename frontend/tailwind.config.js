/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fundo': '#F4F6F8',                
        'card': '#FFFFFF',              
        'texto-principal': '#2D3748',     
        'texto-secundario': '#A0AEC0',    
        'destaque-ciano': '#00B5AD',       
        'destaque-laranja': '#FF8C42',    
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}