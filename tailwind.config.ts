import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          'bg-primary': '#FBFBF8',
          'bg-secondary': '#F4F2EB',
          'text-primary': '#1F1F1F',
          'text-secondary': '#3A3A3A',
          'text-muted': '#7A7A7A',
          olive: '#3F4A3F',
          burgundy: '#4B1F26',
          'line-primary': '#CFC8B8',
          'line-secondary': '#E5E2D8',
        },
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-md': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
    },
  },
  plugins: [],
};

export default config;
