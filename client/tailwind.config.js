/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',     // page background
        panel: '#1A2336',   // cards and surfaces
        win: '#0E1626',     // code area and card header
        edge: '#273249',    // subtle borders
        text: '#E6EDF5',    // primary text
        soft: '#8A99AD',    // secondary text
        mint: '#2DD4BF',    // accent
        mintInk: '#07221E', // text on mint buttons
        softRed: '#F87171'  // delete / error
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};
