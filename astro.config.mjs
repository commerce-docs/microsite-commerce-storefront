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
        starlightLinksValidator({
          errorOnFallbackPages: false,
          errorOnInconsistentLocale: true
        }),
        starlightImageZoom(),
      ],
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
      customCss: ['./src/styles/tailwind.css', './src/styles/fonts.css', './src/styles/badge.css', './src/styles/custom.css'],
      logo: {
        src: './src/assets/sitelogo.svg',
        replacesTitle: false
      },
      social: {
        github: 'https://git.corp.adobe.com/AdobeDocs/microsite-commerce-storefront'
      },
      sidebar: [
        {
          label: 'Getting Started',
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
        // DROPIN Navigation.
        {
          label: 'Dropins',
          collapsed: true,
          items: [
            // { label: 'Dropins overview', link: '/dropins/dropins-overview/' },
            // A nested group of links.
            {
              label: 'Product Details',
              attrs: { style: 'font-size: 1rem; font-weight: 400' },
              items: [
                { label: 'PDP Introduction', link: '/dropins/product-details/pdp-introduction/' },
                { label: 'PDP Installation', link: '/dropins/product-details/pdp-installation/' },
                { label: 'PDP Container', link: '/dropins/product-details/pdp-containers/' },
                { label: 'PDP Slots', link: '/dropins/product-details/pdp-slots/' },
                { label: 'PDP Components', link: '/dropins/product-details/pdp-components/' },
                { label: 'PDP CSS Classes', link: '/dropins/product-details/pdp-css/' },
                { label: 'PDP Functions', link: '/dropins/product-details/pdp-functions/' },
              ],
            },
            {
              label: 'Checkout',
              collapsed: true,
              attrs: { style: 'font-size: 1rem; font-weight: 400' },
              items: [
                { label: 'Checkout Install', link: '/dropins/checkout/checkout-install/' },
                { label: 'Checkout Anatomy', link: '/dropins/checkout/checkout-anatomy/' },
                { label: 'Checkout API', link: '/dropins/checkout/checkout-api/' },
                { label: 'Checkout Containers', link: '/dropins/checkout/checkout-containers/' },
                { label: 'Checkout Slots', link: '/dropins/checkout/checkout-slots/' },
                { label: 'Checkout Components', link: '/dropins/checkout/checkout-components/' },
                { label: 'Checkout CSS Classes', link: '/dropins/checkout/checkout-css/' },
              ],
            },
            {
              label: 'Cart',
              collapsed: true,
              attrs: { style: 'font-size: 1rem; font-weight: 400' },
              items: [
                { label: 'Cart Install', link: '/dropins/cart/cart-install/' },
                { label: 'Cart Anatomy', link: '/dropins/cart/cart-anatomy/' },
                { label: 'Cart API', link: '/dropins/cart/cart-api/' },
                { label: 'Cart Containers', link: '/dropins/cart/cart-containers/' },
                { label: 'Cart Slots', link: '/dropins/cart/cart-slots/' },
                { label: 'Cart Components', link: '/dropins/cart/cart-components/' },
                { label: 'Cart CSS Classes', link: '/dropins/cart/cart-css/' },
              ],
            },
            {
              label: 'User Authentication',
              collapsed: true,
              attrs: { style: 'font-size: 1rem; font-weight: 400' },
              items: [
                { label: 'User Authentication Install', link: '/dropins/user-auth/userauth-install/' },
              ],
            },
            {
              label: 'User Account',
              collapsed: true,
              attrs: { style: 'font-size: 1rem; font-weight: 400' },
              items: [
                { label: 'User Account Install', link: '/dropins/user-account/useraccount-install/' },
              ],
            },
          ],
        },
        {
          label: 'Blocks',
          collapsed: true,
          items: [
            { label: 'Blocks overview', link: '/blocks/blocks-overview/' },
          ],
        },
        {
          label: 'References',
          collapsed: true,
          autogenerate: {
            directory: '/references/'
          }
        },
        {
          label: 'Toubleshooting',
          collapsed: true,
          autogenerate: {
            directory: '/troubleshooting/'
          }
        }]
    }), (await import('astro-compress')).default({
      Exclude: ['/customize/'],
      CSS: false,
      HTML: false,
      JavaScript: false,
      Image: true,
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
