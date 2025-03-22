import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,css}'],
  theme: {
    extend: {
      ringColor: {
        DEFAULT: 'transparent',
        focus: 'transparent',
      }
    },
  },
  plugins: [
    function({ addBase, theme }) {
      // Generate font weight variables
      const fontWeights = theme('fontWeight');
      const fontWeightVariables = Object.entries(fontWeights).reduce((vars, [key, value]) => {
        return { ...vars, [`--font-weight-${key}`]: value };
      }, {});
      
      // Generate color variables
      const colors = flattenColorPalette(theme('colors'));
      const colorVariables = Object.entries(colors).reduce((vars, [key, value]) => {
        return { ...vars, [`--color-${key}`]: value };
      }, {});
      
      // Add other theme properties as needed
      const spacing = theme('spacing');
      const spacingVariables = Object.entries(spacing).reduce((vars, [key, value]) => {
        return { ...vars, [`--spacing-${key}`]: value };
      }, {});

      const fontSize = theme('fontSize');
      const fontSizeVariables = Object.entries(fontSize).reduce((vars, [key, value]) => {
        return { ...vars, [`--font-size-${key}`]: value[0] };
      }, {});
      
      // Combine all variables
      const variables = {
        ':root': {
          ...fontWeightVariables,
          ...colorVariables,
          ...spacingVariables,
          ...fontSizeVariables,
          // Add more theme properties as needed
        }
      };
      
      addBase(variables);
    }
  ],
}

