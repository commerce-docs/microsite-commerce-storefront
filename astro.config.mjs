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
    title: 'Adobe Drop-in Components',
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
      Badge: './src/components/overrides/Badge.astro',
      CallToAction: './src/components/overrides/CallToAction.astro',
      Icon: './src/components/overrides/Icon.astro',
      Header: './src/components/overrides/Header.astro',
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
          { label: 'Understand drop-ins', link: '/understand/', badge: { variant: 'tip', text: 'IP' } },
          { label: 'Install drop-ins', link: '/install/', badge: 'IP' },
          { label: 'Style drop-ins', link: '/style/', badge: 'IP' },
          { label: 'Extend drop-ins', link: '/extend/', badge: 'IP' },
        ],
      },
      {
        label: 'Product Details',
        items: [
          { label: 'Understand', link: '/pdp/pdp-understand/', badge: 'TBD', },
          { label: 'Install', link: '/pdp/pdp-install/', badge: 'TBD', },
          { label: 'Style', link: '/pdp/pdp-style/', badge: 'TBD', },
          { label: 'Extend', link: '/pdp/pdp-extend/', badge: 'TBD', },
          { label: 'Update', link: '/pdp/pdp-update/', badge: 'TBD', },
          { label: 'Reference', link: '/pdp/pdp-reference/', badge: 'TBD', },
        ],
      },
      {
        label: 'Cart',
        badge: 'TBD',
        collapsed: true,
        items: [
          { label: 'Understand', link: '/cart/cart-understand/' },
          { label: 'Install', link: '/cart/cart-install/' },
          { label: 'Style', link: '/cart/cart-style/' },
          { label: 'Extend', link: '/cart/cart-extend/' },
          { label: 'Update', link: '/cart/cart-update/' },
          { label: 'Reference', link: '/cart/cart-reference/' },
        ],
      },
      {
        label: 'Checkout',
        badge: 'TBD',
        collapsed: true,
        items: [
          { label: 'Understand', link: '/checkout/checkout-understand/' },
          { label: 'Install', link: '/checkout/checkout-install/' },
          { label: 'Style', link: '/checkout/checkout-style/' },
          { label: 'Extend', link: '/checkout/checkout-extend/' },
          { label: 'Update', link: '/checkout/checkout-update/' },
          { label: 'Reference', link: '/checkout/checkout-reference/' },
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
