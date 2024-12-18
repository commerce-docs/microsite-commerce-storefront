import starlightPlugin from '@astrojs/starlight-tailwind';

/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{astro,html,css,js,jsx,md,mdx,svelte,ts,tsx,vue}'];
export const theme = {
  extend: {
    fontFamily: {
      sans: ["'Adobe Clean', adobe-clean, sans-serif"],
      mono: ["'Courier', monospace"],
    },
  },
};
export const plugins = [starlightPlugin(), require('@tailwindcss/forms')];
