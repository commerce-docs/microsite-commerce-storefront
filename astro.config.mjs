import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';
import playformCompress from '@playform/compress';

// https://astro.build/config
export default defineConfig({
  site: 'https://experienceleague.adobe.com',
  base: '/developer/commerce/storefront',
  trailingSlash: 'ignore',
  outDir: './dist',
  integrations: [
    tailwind({ nesting: true }),
    starlight({
      editLink: {
        baseUrl: 'https://git.corp.adobe.com/AdobeDocs/microsite-commerce-storefront/edit/develop/',
      },
      head: [
        {
          tag: 'script',
          attrs: {
            src: 'https://assets.adobedtm.com/a7d65461e54e/6e9802a06173/launch-43baf8381f4b.min.js',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'google-site-verification',
            content: 'NwoVbL9MrtJAa4vdfMC0vJmKV3Hvuc4L_UHlv4Uzjgk',
          },
        },
      ],
      title: 'Adobe Commerce Storefront',
      favicon: 'favicon.ico',
      lastUpdated: true,
      plugins: [
        starlightLinksValidator({
          errorOnFallbackPages: false,
          errorOnInconsistentLocale: true,
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
        Sidebar: './src/components/overrides/Sidebar.astro',
      },
      customCss: [
        './src/styles/reset.css',
        './src/styles/tailwind.css',
        './src/fonts/font-face.css',
        './src/styles/badge.css',
        './src/styles/colors.css',
        './src/styles/custom.css',
        './src/styles/asides.css',
      ],
      logo: {
        src: './src/assets/sitelogo.svg',
        replacesTitle: false,
      },
      social: {
        discord: 'https://discord.com/channels/1131492224371277874/1220042081209421945',
        github: 'https://git.corp.adobe.com/AdobeDocs/microsite-commerce-storefront',
      },
      sidebar: [
        {
          label: 'Create',
          autogenerate: {
            directory: '/create/',
          },
        },
        {
          label: 'Customize',
          autogenerate: {
            directory: '/customize/',
          },
        },
        {
          label: 'Launch',
          autogenerate: {
            directory: '/launch/',
          },
        },
        {
          label: 'PDP Dropin',
          badge: {
            text: 'Beta',
            variant: 'success',
          },
          items: [
            {
              label: 'Overview',
              link: '/product-details/pdp-introduction/',
            },
            {
              label: 'PDP Installation',
              link: '/product-details/pdp-installation/',
            },
            {
              label: 'PDP Styles',
              link: '/product-details/pdp-styles/',
            },
            {
              label: 'PDP Container',
              link: '/product-details/pdp-containers/',
            },
            {
              label: 'PDP Slots',
              link: '/product-details/pdp-slots/',
            },
            {
              label: 'PDP Functions',
              link: '/product-details/pdp-functions/',
            },
          ],
        },
        {
          label: 'References',
          autogenerate: {
            directory: '/references/',
          },
        },
        {
          label: 'Toubleshooting',
          autogenerate: {
            directory: '/troubleshooting/',
          },
        },
        // DROPIN Navigation.
        {
          label: 'Dropins',
          badge: {
            text: 'In Development',
            variant: 'danger',
          },
          collapsed: true,
          items: [
            {
              label: 'Checkout',
              collapsed: false,
              attrs: {
                style: 'font-size: 1rem; font-weight: 400',
              },
              items: [
                {
                  label: 'Checkout Introduction',
                  link: '/dropins/checkout/checkout-introduction/',
                },
                // {
                //   label: 'Checkout Installation',
                //   link: '/dropins/checkout/checkout-installation/'
                // },
                // {
                //   label: 'Checkout Containers',
                //   link: '/dropins/checkout/checkout-containers/'
                // },
                // {
                //   label: 'Checkout Slots',
                //   link: '/dropins/checkout/checkout-slots/'
                // },
                // {
                //   label: 'Checkout Styles',
                //   link: '/dropins/checkout/checkout-styles/'
                // },
                // {
                //   label: 'Checkout Functions',
                //   link: '/dropins/checkout/checkout-functions/'
                // },
              ],
            },
            {
              label: 'Cart',
              collapsed: false,
              items: [
                {
                  label: 'Cart Introduction',
                  link: '/dropins/cart/cart-introduction/',
                },
                // {
                //   label: 'Cart Installation',
                //   link: '/dropins/cart/cart-installation/'
                // },
                // {
                //   label: 'Cart Containers',
                //   link: '/dropins/cart/cart-containers/'
                // },
                // {
                //   label: 'Cart Slots',
                //   link: '/dropins/cart/cart-slots/'
                // },
                // {
                //   label: 'Cart Styles',
                //   link: '/dropins/cart/cart-styles/'
                // },
                // {
                //   label: 'Cart Functions',
                //   link: '/dropins/cart/cart-functions/'
                // },
              ],
            },
            {
              label: 'User Auth',
              collapsed: false,
              items: [
                {
                  label: 'User Auth Introduction',
                  link: '/dropins/user-auth/userauth-introduction/',
                },
              ],
            },
            {
              label: 'User Account',
              collapsed: false,
              items: [
                {
                  label: 'User Account Introduction',
                  link: '/dropins/user-account/useraccount-introduction/',
                },
              ],
            },
          ],
        },
        {
          label: 'Blocks',
          collapsed: true,
          items: [
            {
              label: 'Blocks overview',
              link: '/blocks/blocks-overview/',
            },
          ],
        },
      ],
    }),
    (await import("@playform/compress")).default({
      CSS: true,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true,
    }),
  ],
});
