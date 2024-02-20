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
    tailwind({
      nesting: true,
    }),
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
        Pagination: './src/components/overrides/Pagination.astro',
      },
      customCss: [
        './src/styles/fonts.css',
        './src/styles/overrides/markdown.css',
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
          label: 'Quick Start',
          items: [
            {
              label: 'Create a storefront',
              link: '/quick-start/create-storefront/',
            },
            {
              label: 'Drop-in Anatomy',
              link: '/quick-start/dropin-anatomy/',
            },
            {
              label: 'Drop-in Resources',
              link: '/quick-start/dropin-resources/',
            },
          ],
        },
        {
          label: 'How To',
          badge: 'IP',
          items: [
            {
              label: 'Install drop-ins',
              link: '/how-to/install/',
            },
            {
              label: 'Connect drop-ins',
              link: '/how-to/connect/',
            },
            {
              label: 'Brand drop-ins',
              link: '/how-to/brand/',
            },
            {
              label: 'Enrich drop-ins',
              link: '/how-to/enrich/',
            },
            {
              label: 'Localize drop-ins',
              link: '/how-to/localize/',
            },
            {
              label: 'Customize drop-ins',
              link: '/how-to/customize/',
            },
          ],
        },
        {
          label: 'Best Practices',
          items: [
            {
              label: 'Containers',
              link: '/best-practices/bp-containers/',
            },
            {
              label: 'Slots',
              link: '/best-practices/bp-slots/',
            },
            {
              label: 'Events',
              link: '/best-practices/bp-events/',
            },
          ],
        },
        {
          label: 'Product Details',
          badge: 'IP',
          items: [
            {
              label: 'Anatomy',
              link: '/product-details/pdp-anatomy/',
            },
            {
              label: 'Configuration',
              link: '/product-details/pdp-configuration/',
            },
            {
              label: 'Branding',
              link: '/product-details/pdp-branding/',
            },
            {
              label: 'Enrichment',
              link: '/product-details/pdp-enrichment/',
            },
            {
              label: 'Customizations',
              link: '/product-details/pdp-customizations/',
            },
            {
              label: 'Reference',
              link: '/product-details/pdp-reference/',
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
              link: '/cart/cart-enrichment/',
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
              link: '/checkout/checkout-enrichment/',
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
