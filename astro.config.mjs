import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';
import { remarkBasePathLinks } from './src/plugins/remarkBasePathLinks';
import react from "@astrojs/react";

const isProduction = process.env.NODE_ENV === 'production';


// https://astro.build/config
export default defineConfig({
  site: 'https://experienceleague.adobe.com',
  base: isProduction ? import.meta.env.VITE_PROD_BASE_PATH : '',
  markdown: {
    remarkPlugins: [remarkBasePathLinks]
  },
  trailingSlash: 'ignore',
  outDir: './dist',
  integrations: [
    tailwind({
      nesting: true
    }), starlight({
      editLink: {
        baseUrl: 'https://github.com/commerce-docs/microsite-commerce-storefront/edit/develop/'
      },
      head: [{
        tag: 'script',
        attrs: {
          src: 'https://assets.adobedtm.com/a7d65461e54e/6e9802a06173/launch-43baf8381f4b.min.js'
        }
      }, {
        tag: 'meta',
        attrs: {
          name: 'google-site-verification',
          content: 'NwoVbL9MrtJAa4vdfMC0vJmKV3Hvuc4L_UHlv4Uzjgk'
        }
      }],
      title: 'Adobe Commerce Storefront',
      favicon: 'favicon.ico',
      lastUpdated: true,
      plugins: [starlightLinksValidator({
        errorOnFallbackPages: false,
        errorOnInconsistentLocale: true
      }), starlightImageZoom({
        showCaptions: false
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
        PageSidebar: './src/components/overrides/PageSidebar.astro',
        TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
        Pagination: './src/components/overrides/Pagination.astro',
        Sidebar: './src/components/overrides/Sidebar.astro',
        SidebarSublist: './src/components/overrides/SidebarSublist.astro',
        SocialIcons: './src/components/overrides/SocialIcons.astro'
      },
      customCss: ['./src/styles/tailwind.css', './src/fonts/font-face.css', './src/styles/badge.css', './src/styles/colors.css', './src/styles/custom.css', './src/styles/asides.css', './src/styles/reset.css'],
      logo: {
        src: './src/assets/sitelogo.svg',
        replacesTitle: false
      },
      social: {
        discord: 'https://discord.gg/TxtVA6ac',
        github: 'https://github.com/commerce-docs/microsite-commerce-storefront/tree/develop'
      },
      sidebar: [{
        label: 'Get Started',
        autogenerate: {
          directory: '/get-started/'
        }
      },
      {
        label: 'Dropins',
        items: [
          {
            label: 'Overview',
            link: '/dropins/'
          },
          {
            label: 'How to customize',
            autogenerate: {
              directory: '/dropins/customize/'
            }
          },
          {
            label: 'Product Details Page',
            collapsed: false,
            items: [
              { label: 'Overview', link: '/dropins/product-details/' },
              { label: 'PDP Installation', link: '/dropins/product-details/pdp-installation/' },
              { label: 'PDP Styles', link: '/dropins/product-details/pdp-styles/' },
              { label: 'PDP Containers', link: '/dropins/product-details/pdp-containers/' },
              { label: 'PDP Slots', link: '/dropins/product-details/pdp-slots/' },
              { label: 'PDP Functions', link: '/dropins/product-details/pdp-functions/' }
            ]
          },
          {
            label: 'Cart',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/cart/' },
              // {label: 'Cart Installation', link: '/dropins/cart/cart-installation/'},
              // {label: 'Cart Styles', link: '/dropins/cart/cart-styles/'},
              // {label: 'Cart Containers', link: '/dropins/cart/cart-containers/'},
              // {label: 'Cart Slots', link: '/dropins/cart/cart-slots/'},
              // {label: 'Cart Functions', link: '/dropins/cart/cart-functions/'},
            ]
          },
          {
            label: 'Checkout',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/checkout/' },
              // {label: 'Checkout Installation', link: '/dropins/checkout/checkout-installation/'},
              // {label: 'Checkout Styles', link: '/dropins/checkout/checkout-styles/'},
              // {label: 'Checkout Containers', link: '/dropins/checkout/checkout-containers/'},
              // {label: 'Checkout Slots', link: '/dropins/checkout/checkout-slots/'},
              // {label: 'Checkout Functions', link: '/dropins/checkout/checkout-functions/'},
            ]
          },
          {
            label: 'User Auth',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/user-auth/' },
            ]
          },
          {
            label: 'User Account',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/user-account/' },
            ]
          }]
      },
      {
        label: 'Toubleshooting',
        autogenerate: {
          directory: '/troubleshooting/'
        }
      },
      {
        label: 'Launch',
        autogenerate: {
          directory: '/launch/'
        }
      },]
    }), (await import("@playform/compress")).default({
      CSS: false,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true
    }), react()]
});
