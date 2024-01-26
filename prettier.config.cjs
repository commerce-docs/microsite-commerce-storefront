const baseConfig = require('./config/prettier.cjs');

/**
 * @type {import('prettier').Config}
 */
const prettierConfig = {
  ...baseConfig,
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
  plugins: [
    require.resolve('prettier-plugin-astro'),
    require.resolve('prettier-plugin-tailwindcss'),
  ],
};

module.exports = prettierConfig;
