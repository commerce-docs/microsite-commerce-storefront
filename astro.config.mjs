import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom'

// https://astro.build/config
export default defineConfig({
  site: 'https://experienceleague.adobe.com',
  base: '/developer/commerce/storefront',
  outDir: './dist',
  editLink: {
    baseUrl: 'https://git.corp.adobe.com/AdobeDocs/microsite-commerce-storefront/',
  },
  integrations: [
    tailwind({
      nesting: true
    }), starlight({
      head: [
        //   {
        //   tag: 'meta',
        //   attrs: {
        //     'http-equiv': 'Content-Security-Policy',
        //     content: "default-src 'self'; frame-src 'self' stackblitz.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
        //   }
        // },
        {
          tag: 'script',
          attrs: {
            src: 'https://assets.adobedtm.com/a7d65461e54e/6e9802a06173/launch-43baf8381f4b.min.js',
          },
        }],
      title: 'Adobe Commerce Storefront',
      favicon: 'favicon.ico',
      lastUpdated: true,
      plugins: [
        starlightImageZoom(),
        starlightLinksValidator({
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
        github: 'https://git.corp.adobe.com/AdobeDocs/microsite-commerce-storefront'
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
        }, 
        {
          label: 'Blocks',
          autogenerate: { directory: 'Blocks' },
        }, {
          label: 'References',
          collapsed: true,
          autogenerate: {
            directory: '/references/'
          }
        }
      ]
    }),
    // (await import('astro-compress')).default({
    //   // Exclude: ['/customize/'],
    //   CSS: false,
    //   JavaScript: false,
    //   HTML: false,
    //   Image: true,
    //   SVG: true,
    // }),
  ],
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
