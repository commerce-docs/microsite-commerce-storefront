import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

/** @type {import('@astrojs/starlight/expressive-code').StarlightExpressiveCodeOptions} */
export default {
    // Plugins
    plugins: [pluginCollapsibleSections(), pluginLineNumbers()],

    // Themes
    themes: ['github-light', 'github-dark'],

    // Inline styles to ensure callout numbers work in production
    emitExternalStylesheet: false,

    // Style overrides
    styleOverrides: {
        frames: {
            frameBoxShadowCssValue: 'none',
        },
    },

    // Default properties for all code blocks
    defaultProps: {
        // Disable window frames for all code blocks
        frame: 'none',
    },
}