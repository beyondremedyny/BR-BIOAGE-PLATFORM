/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#383838',
        purple: '#7a5fff',
        purpleDark: '#5a3fd4',
        purpleLight: '#b8a4ff',
        ivory: '#fafafa',
        sandstone: '#e3cbbe',
        brGreen: '#4ade80',
        brOrange: '#fb923c',
        brRed: '#f87171',
        brYellow: '#fbbf24',
        brMuted: '#9ca3af',
        cardDark: '#ffffff05',
        borderDark: '#ffffff10',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 48px #00000018',
        glow: '0 0 48px #7a5fff44',
      },
      borderRadius: {
        card: '16px',
        pill: '100px',
      },
    },
  },
  plugins: [],
};
