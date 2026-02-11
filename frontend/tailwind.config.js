/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        roomi: {
          cream: '#FBF2EB',
          peach: '#FCE8DE',
          orange: '#D88E4B',
          orangeLight: '#F0A05A',
          brown: '#8B5A2B',
          brownLight: '#A67C52',
          mint: '#9ACFC0',
          mintDark: '#7AB8A8',
          yellow: '#F8DB68',
          yellowLight: '#FEE783',
        },
      },
      fontFamily: {
        roomi: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        roomi: '0.75rem',
        roomiLg: '1rem',
      },
      boxShadow: {
        roomi: '0 2px 8px rgba(139, 90, 43, 0.08)',
        roomiMd: '0 4px 12px rgba(139, 90, 43, 0.1)',
      },
    },
  },
  plugins: [],
};
