const colors = require('tailwindcss/colors');
const starlightPlugin = require('@astrojs/starlight-tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontSize: {
        // Your preferred font scale. Starlight uses a 1.25 scale by default.
        '2xs': '0.625rem',
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      colors: {
        // Your preferred accent color. Indigo is closest to Starlight’s defaults.
        accent: colors.blue,
        // Your preferred gray scale. Zinc is closest to Starlight’s defaults.
        gray: colors.zinc,
      },
    },
  },
  plugins: [starlightPlugin()],
};
