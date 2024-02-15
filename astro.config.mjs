import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';
import preact from '@astrojs/preact';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';

// https://astro.build/config
export default defineConfig({
  site: 'https://dropins.dev',
  integrations: [
    tailwind(),
    preact(),
    starlight({
      title: 'Adobe Drop-in Components',
      favicon: 'favicon.ico',
      lastUpdated: true,
      plugins: [
        starlightLinksValidator({
          errorOnFallbackPages: false,
          errorOnInconsistentLocale: true,
        }),
      ],
      components: {
        CallToAction: './src/components/overrides/CallToAction.astro',
        Icon: './src/components/overrides/Icon.astro',
        Header: './src/components/overrides/Header.astro',
        Hero: './src/components/overrides/Hero.astro',
        PageTitle: './src/components/overrides/PageTitle.astro',
        SiteTitle: './src/components/overrides/SiteTitle.astro',
        PageFrame: './src/components/overrides/PageFrame.astro',
        TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
      },
      customCss: [
        './src/styles/fonts.css',
        './src/styles/overrides/tokens.css',
        './src/styles/overrides/badge.css',
        './src/styles/tailwind.css',
        './src/styles/custom.css',
      ],
      logo: {
        src: 'src/assets/sitelogo.svg',
        replacesTitle: false,
      },
      social: {
        github: 'https://github.com/commerce-docs/dropins.dev',
      },
      sidebar: [
        {
          label: 'Introduction',
          items: [
            {
              label: 'Understand drop-ins',
              link: '/intro/understand/',
            },
          ],
        },
        {
          label: 'How To',
          badge: 'IP',
          items: [
            {
              label: 'Install drop-ins',
              link: '/howto/install/',
            },
            {
              label: 'Configure drop-ins',
              link: '/howto/configure/',
            },
            {
              badge: 'IP',
              label: 'Brand drop-ins',
              link: '/howto/brand/',
            },
            {
              label: 'Enrich drop-ins',
              link: '/howto/enrich/',
            },
            {
              label: 'Localize drop-ins',
              link: '/howto/localize/',
            },
            {
              label: 'Customize drop-ins',
              link: '/howto/customize/',
            },
          ],
        },
        {
          label: 'Product Details',
          badge: 'IP',
          items: [
            {
              label: 'Anatomy',
              link: '/pdp/pdp-anatomy/',
            },
            {
              label: 'Configuration',
              link: '/pdp/pdp-configuration/',
            },
            {
              label: 'Branding',
              link: '/pdp/pdp-branding/',
            },
            {
              label: 'Enrichment',
              link: '/pdp/pdp-enrichment/',
            },
            {
              label: 'Customizations',
              link: '/pdp/pdp-customizations/',
            },
            {
              label: 'Reference',
              link: '/pdp/pdp-reference/',
            },
          ],
        },
        {
          label: 'Cart',
          badge: 'TBD',
          collapsed: true,
          items: [
            {
              label: 'Anatomy',
              link: '/cart/cart-anatomy/',
            },
            {
              label: 'Configuration',
              link: '/cart/cart-configuration/',
            },
            {
              label: 'Branding',
              link: '/cart/cart-branding/',
            },
            {
              label: 'Enrichment',
              link: '/pdp/pdp-enrichment/',
            },
            {
              label: 'Customizations',
              link: '/cart/cart-customizations/',
            },
            {
              label: 'Reference',
              link: '/cart/cart-reference/',
            },
          ],
        },
        {
          label: 'Checkout',
          badge: 'TBD',
          collapsed: true,
          items: [
            {
              label: 'Anatomy',
              link: '/checkout/checkout-anatomy/',
            },
            {
              label: 'Configuration',
              link: '/checkout/checkout-configuration/',
            },
            {
              label: 'Branding',
              link: '/checkout/checkout-branding/',
            },
            {
              label: 'Enrichment',
              link: '/pdp/pdp-enrichment/',
            },
            {
              label: 'Customizations',
              link: '/checkout/checkout-customizations/',
            },
            {
              label: 'Reference',
              link: '/checkout/checkout-reference/',
            },
          ],
        },
        {
          label: 'Integrations',
          badge: 'TBD',
          collapsed: true,
          items: [
            {
              label: 'Edge Delivery Services',
              link: '/integrations/integrate-eds/',
            },
            {
              label: 'React',
              link: '/integrations/integrate-react/',
            },
            {
              label: 'Vue',
              link: '/integrations/integrate-vue/',
            },
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
