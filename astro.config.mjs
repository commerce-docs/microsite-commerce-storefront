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
      src: 'src/assets/logo.svg',
      replacesTitle: false
    },
    social: {
      github: 'https://github.com/commerce-docs/dropins.dev',
    },
    sidebar: [
      {
        label: 'Get started',
        badge: 'IP',
        items: [
          { label: 'Understand drop-ins', link: '/start/understand/' },
          { label: 'Connect drop-ins', link: '/start/connect/' },
          { label: 'Brand drop-ins', link: '/start/brand/' },
          { label: 'Customize drop-ins', link: '/start/customize/' },
        ],
      },
      {
        label: 'Product Details',
        badge: 'IP',
        items: [
          { label: 'Anatomy', link: '/pdp/pdp-anatomy/' },
          { label: 'Configure', link: '/pdp/pdp-configure/' },
          { label: 'Brand', link: '/pdp/pdp-brand/' },
          { label: 'Customize', link: '/pdp/pdp-customize/' },
          { label: 'Reference', link: '/pdp/pdp-reference/' },
        ],
      },
      {
        label: 'Cart',
        badge: 'TBD',
        collapsed: true,
        items: [
          { label: 'Anatomy', link: '/cart/cart-anatomy/' },
          { label: 'Configure', link: '/cart/cart-configure/' },
          { label: 'Brand', link: '/cart/cart-brand/' },
          { label: 'Customize', link: '/cart/cart-customize/' },
          { label: 'Reference', link: '/cart/cart-reference/' },
        ],
      },
      {
        label: 'Checkout',
        badge: 'TBD',
        collapsed: true,
        items: [
          { label: 'Anatomy', link: '/checkout/checkout-anatomy/' },
          { label: 'Configure', link: '/checkout/checkout-configure/' },
          { label: 'Brand', link: '/checkout/checkout-brand/' },
          { label: 'Customize', link: '/checkout/checkout-customize/' },
          { label: 'Reference', link: '/checkout/checkout-reference/' },
        ],
      },
      {
        label: 'Integrations',
        items: [
          { label: 'Edge Delivery', link: '/integrate/integrate-eds/' },
          { label: 'Vanilla JS', link: '/integrate/integrate-js/' },
          { label: 'Next.js', link: '/integrate/integrate-nextjs/' },
          { label: 'Vue', link: '/integrate/integrate-vue/' },
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
