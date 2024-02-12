import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';

/** @type {import('@astrojs/starlight/expressive-code').StarlightExpressiveCodeOptions} */
export default {
  plugins: [
    pluginCollapsibleSections(),
  ],
  themes: ['github-dark', 'github-light'],
  styleOverrides: {
    borderRadius: '0.5rem',
    codePaddingInline: '0',
    codePaddingBlock: '1rem',
    codeLineHeight: '1.2rem',
  },
}
