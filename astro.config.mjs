import dotenv from 'dotenv';
dotenv.config();
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: 'https://experienceleague.adobe.com',
  base: '/developer/commerce/storefront',
  trailingSlash: "ignore",
  outDir: './dist',
  editLink: {
    baseUrl: 'https://git.corp.adobe.com/AdobeDocs/microsite-commerce-storefront/'
  },
  integrations: [tailwind({
    nesting: true
  }), starlight({
    head: [
      {
        tag: 'script',
        attrs: {
          src: 'https://assets.adobedtm.com/a7d65461e54e/6e9802a06173/launch-43baf8381f4b.min.js'
        }
      }],
    title: 'Adobe Commerce Storefront',
    favicon: 'favicon.ico',
    lastUpdated: true,
    plugins: [starlightLinksValidator({
      errorOnFallbackPages: false,
      errorOnInconsistentLocale: true
    }), starlightImageZoom()],
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
    sidebar: [{
      label: 'Getting Started',
      autogenerate: {
        directory: '/create/'
      }
    }, {
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
        {
          label: 'Product Details',
          attrs: {
            style: 'font-size: 1rem; font-weight: 400'
          },
          items: [{
            label: 'PDP Introduction',
            link: '/dropins/product-details/pdp-introduction/'
          }, {
            label: 'PDP Installation',
            link: '/dropins/product-details/pdp-installation/'
          }, {
            label: 'PDP Container',
            link: '/dropins/product-details/pdp-containers/'
          }, {
            label: 'PDP Slots',
            link: '/dropins/product-details/pdp-slots/'
          }, {
            label: 'PDP Styles',
            link: '/dropins/product-details/pdp-styles/'
          }, {
            label: 'PDP Functions',
            link: '/dropins/product-details/pdp-functions/'
          }]
        }, {
          label: 'Checkout',
          collapsed: true,
          attrs: {
            style: 'font-size: 1rem; font-weight: 400'
          },
          items: [{
            label: 'Checkout Introduction',
            link: '/dropins/checkout/checkout-introduction/'
          }, {
            label: 'Checkout Installation',
            link: '/dropins/checkout/checkout-installation/'
          }, {
            label: 'Checkout Containers',
            link: '/dropins/checkout/checkout-containers/'
          }, {
            label: 'Checkout Slots',
            link: '/dropins/checkout/checkout-slots/'
          }, {
            label: 'Checkout Styles',
            link: '/dropins/checkout/checkout-styles/'
          }, {
            label: 'Checkout Functions',
            link: '/dropins/checkout/checkout-functions/'
          },]
        }, {
          label: 'Cart',
          collapsed: true,
          attrs: {
            style: 'font-size: 1rem; font-weight: 400'
          },
          items: [{
            label: 'Cart Introduction',
            link: '/dropins/cart/cart-introduction/'
          }, {
            label: 'Cart Installation',
            link: '/dropins/cart/cart-installation/'
          }, {
            label: 'Cart Containers',
            link: '/dropins/cart/cart-containers/'
          }, {
            label: 'Cart Slots',
            link: '/dropins/cart/cart-slots/'
          }, {
            label: 'Cart Styles',
            link: '/dropins/cart/cart-styles/'
          }, {
            label: 'Cart Functions',
            link: '/dropins/cart/cart-functions/'
          },]
        }, {
          label: 'User Authentication',
          collapsed: true,
          attrs: {
            style: 'font-size: 1rem; font-weight: 400'
          },
          items: [{
            label: 'User Authentication Install',
            link: '/dropins/user-auth/userauth-install/'
          }]
        }, {
          label: 'User Account',
          collapsed: true,
          attrs: {
            style: 'font-size: 1rem; font-weight: 400'
          },
          items: [{
            label: 'User Account Install',
            link: '/dropins/user-account/useraccount-install/'
          }]
        }]
    }, {
      label: 'Blocks',
      collapsed: true,
      items: [{
        label: 'Blocks overview',
        link: '/blocks/blocks-overview/'
      }]
    }, {
      label: 'References',
      collapsed: true,
      autogenerate: {
        directory: '/references/'
      }
    }, {
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
    SVG: true
  })],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});
