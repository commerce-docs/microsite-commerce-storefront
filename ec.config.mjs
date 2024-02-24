import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

/** @type {import('@astrojs/starlight/expressive-code').StarlightExpressiveCodeOptions} */
export default {
  plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
  themes: ['dark-plus', 'github-light'],
  defaultProps: {
    showLineNumbers: false,
    overridesByLang: {
      'js,html': {
        showLineNumbers: false,
      },
    },
  },
  styleOverrides: {
    codePaddingInline: '1rem',
    codePaddingBlock: '1rem',
    codeLineHeight: '1.2rem',
  },
}
