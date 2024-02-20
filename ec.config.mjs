import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
// import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

export default {
  expressiveCode: {
    plugins: [pluginCollapsibleSections()],
  },
  themes: ['dark-plus', 'github-light'],
  styleOverrides: {
    borderRadius: '0.5rem',
    codePaddingInline: '1rem',
    codePaddingBlock: '1rem',
    codeLineHeight: '1.2rem',
  },
}
