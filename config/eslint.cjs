module.exports = {
  env: {
    browser: true,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'preact',
    // Added under other rules
    'prettier',
    'plugin:storybook/recommended',
    'plugin:mdx/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  settings: {
    'mdx/code-blocks': true,
  },
  rules: {
    // 'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_|^children$',
      },
    ],
    'no-restricted-imports': [
      'warn',
      {
        name: '@adobe/elsie/src',
        message: 'Please use @adobe/elsie/ instead.',
      },
      {
        name: 'preact-i18n',
        message: 'Please use @adobe/elsie/i18n instead.',
      },
    ],
  },
  overrides: [
    {
      files: ['*.mdx', '*.md'],
      extends: ['plugin:mdx/overrides'],
      rules: {
        'react/self-closing-comp': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'src/__generated__/', '**/*.astro'],
};
