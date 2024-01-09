import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';
import preact from "@astrojs/preact";
const astroExpressiveCodeOptions = {
  themes: ['git-dark', 'git-light']
};

// https://astro.build/config
export default defineConfig({
  site: 'https://dropins.dev',
  integrations: [tailwind(), preact(), starlight({
    title: 'Adobe Drop-in Widgets',
    favicon: 'favicon.ico',
    plugins: [starlightLinksValidator({
      errorOnFallbackPages: false,
      errorOnInconsistentLocale: true
    })],
    expressiveCode: {
      styleOverrides: {
        borderRadius: '0.5rem',
        codePaddingInline: '0',
        codePaddingBlock: '1rem',
        codeLineHeight: '1.3rem'
      },
      themes: ['github-dark', 'github-light']
    },
    components: {
      // Override the default `SocialIcons` component.
      CallToAction: './src/components/overrides/CallToAction.astro',
      Icon: './src/components/overrides/Icon.astro',
      Header: './src/components/overrides/Header.astro',
      // Card: './src/components/overrides/Card.astro',
      Hero: './src/components/overrides/Hero.astro',
      PageTitle: './src/components/overrides/PageTitle.astro',
      SiteTitle: './src/components/overrides/SiteTitle.astro',
      PageFrame: './src/components/overrides/PageFrame.astro',
      TwoColumnContent: './src/components/overrides/TwoColumnContent.astro'
    },
    customCss: ['./src/styles/custom.css', './src/styles/tailwind.css'],
    logo: {
      src: './src/assets/logo.svg',
      replacesTitle: false
    },
    social: {
      github: 'https://github.com/commerce-docs/dropins.dev',
    },
    sidebar: [
      {
        label: 'Getting started',
        items: [
          { label: 'Understand drop-ins', link: '/understand/' },
          { label: 'Set up drop-in environment', link: '/setup/' },
          { label: 'Style drop-ins', link: '/style/' },
          { label: 'Extend drop-ins', link: '/extend/' },
        ],
      },
      {
        label: 'Product Details drop-in',
        items: [
          { label: 'Understand', link: '/pdp/pdp-understand/' },
          { label: 'Install', link: '/pdp/pdp-install/' },
          { label: 'Style', link: '/pdp/pdp-style/' },
          { label: 'Extend', link: '/pdp/pdp-extend/' },
          { label: 'Reference', link: '/pdp/pdp-reference/' },
        ],
      },
    ],
  }),
  ],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
