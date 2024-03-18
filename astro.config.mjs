import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';
import qwikdev from '@qwikdev/astro';

// https://astro.build/config
export default defineConfig({
  markdown: {
    gfm: true
  },
  site: 'https://dropins.dev',
  integrations: [
    qwikdev(),
    tailwind({
      nesting: true
    }), starlight({
      head: [{
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: "default-src 'self'; frame-src 'self' stackblitz.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
        }
      }],
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
        src: './src/assets/sitelogo.svg',
        replacesTitle: false
      },
      social: {
        github: 'https://github.com/commerce-docs/dropins.dev'
      },
      sidebar: [
        {
          label: 'Create',
          autogenerate: {
            directory: '/create/'
          }
        },
        {
          label: 'Customize',
          autogenerate: {
            directory: '/customize/'
          }
        }, {
          label: 'Launch',
          autogenerate: {
            directory: '/launch/'
          }
        },
        {
          label: 'Dropins',
          autogenerate: { directory: 'dropins' },
        }, {
          label: 'References',
          collapsed: true,
          autogenerate: {
            directory: '/references/'
          }
        }]
    }), (await import('astro-compress')).default({
      Exclude: ['/storefront-tutorial/'],
      CSS: false,
      HTML: false,
      Image: true,
      JavaScript: true,
      SVG: true,
    }),],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});

// items: [
//   {
//     label: 'Product Details',
//     badge: 'beta',
//     autogenerate: {
//       directory: '/product-details/'
//     }
//   }, {
//     label: 'Cart',
//     badge: 'alpha',
//     collapsed: true,
//     autogenerate: {
//       directory: '/cart/'
//     }
//   }, {
//     label: 'Checkout',
//     badge: 'alpha',
//     collapsed: true,
//     autogenerate: {
//       directory: '/checkout/'
//     }
//   },
// ]
