import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';
import preact from '@astrojs/preact';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://dropins.dev',
  integrations: [
    tailwind({
      nesting: true,
    }),
    preact(),
    react(),
    starlight({
      title: 'Adobe Dropin Components',
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
        Sidebar: './src/components/overrides/Sidebar.astro',
      },
      customCss: [
        './src/styles/tailwind.css',
        './src/styles/fonts.css',
        './src/styles/custom.css',
        './src/styles/badge.css',
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
          label: 'Welcome!',
          link: '/welcome/',
          attrs: { style: 'font-weight: 400' },
        },
        {
          label: 'Storefront Tutorial',
          items: [
            {
              label: 'Overview',
              link: '/storefront-tutorial/overview/',
            },
            {
              label: 'Clone the boilerplate',
              link: '/storefront-tutorial/clone/',
            },
            {
              label: 'Connect your services',
              link: '/storefront-tutorial/connect/',
            },
            {
              label: 'Brand your storefront',
              link: '/storefront-tutorial/brand/brand/',
            },
            {
              label: 'Localize your storefront',
              link: '/storefront-tutorial/localize/',
            },
            {
              label: 'Enrich your storefront',
              link: '/storefront-tutorial/enrich/',
            },
            {
              label: 'Customize your storefront',
              link: '/storefront-tutorial/customize/',
            },
            {
              label: 'Launch your storefront',
              link: '/storefront-tutorial/launch/',
            },
          ],
        },
        {
          label: 'Product Details',
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
        {
          label: 'Reference',
          badge: 'TBD',
          collapsed: true,
          items: [
            {
              label: 'Dropin anatomy',
              link: '/dropin-anatomy/',
            },
            {
              label: 'Dropin resources',
              link: '/storefront-tutorial/dropin-resources/',
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
