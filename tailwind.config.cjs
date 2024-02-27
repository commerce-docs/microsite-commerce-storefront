const colors = require('tailwindcss/colors');
const starlightPlugin = require('@astrojs/starlight-tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,css,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: colors.slate,
        gray: colors.neutral,
      },
      fontFamily: {
        sans: ["'Adobe Clean', adobe-clean, sans-serif"],
        mono: ["'Courier', monospace"],
      },
    },
  },
  plugins: [starlightPlugin()],
};
