import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  markdown: {
    gfm: true
  },
  site: 'https://dropins.dev',
  integrations: [tailwind({
    nesting: true
  }), starlight({
    title: 'Adobe Commerce Storefront',
    favicon: 'favicon.ico',
    lastUpdated: true,
    plugins: [starlightLinksValidator({
      errorOnFallbackPages: false,
      errorOnInconsistentLocale: true
    })],
    // Component overrides
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
      Sidebar: './src/components/overrides/Sidebar.astro'
    },
    customCss: ['./src/styles/tailwind.css', './src/styles/fonts.css', './src/styles/custom.css', './src/styles/badge.css'],
    logo: {
      src: 'src/assets/sitelogo.svg',
      replacesTitle: false
    },
    social: {
      github: 'https://github.com/commerce-docs/dropins.dev'
    },
    sidebar: [{
      label: 'Introduction',
      autogenerate: {
        directory: '/introduction/'
      }
    }, {
      label: 'Storefront Tutorial',
      autogenerate: {
        directory: '/storefront-tutorial/'
      }
    }, {
      label: 'Product Details',
      autogenerate: {
        directory: '/product-details/'
      }
    }, {
      label: 'Cart',
      collapsed: true,
      autogenerate: {
        directory: '/cart/'
      }
    }, {
      label: 'Checkout',
      collapsed: true,
      autogenerate: {
        directory: '/checkout/'
      }
    }, {
      label: 'References',
      collapsed: true,
      autogenerate: {
        directory: '/references/'
      }
    }]
  }), react()],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});