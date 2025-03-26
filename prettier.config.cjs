const baseConfig = require('./configuration/prettier.cjs');

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
  ],
};

module.exports = prettierConfig;
