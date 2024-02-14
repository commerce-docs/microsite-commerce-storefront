import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator';
import preact from "@astrojs/preact";
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';

// https://astro.build/config
export default defineConfig({
  site: 'https://dropins.dev',
  integrations: [tailwind(), preact(), starlight({
    title: 'Adobe Drop-in Components',
    favicon: 'favicon.ico',
    lastUpdated: true,
    plugins: [starlightLinksValidator({
      errorOnFallbackPages: false,
      errorOnInconsistentLocale: true
    })],
    components: {
      CallToAction: './src/components/overrides/CallToAction.astro',
      Icon: './src/components/overrides/Icon.astro',
      Header: './src/components/overrides/Header.astro',
      Hero: './src/components/overrides/Hero.astro',
      PageTitle: './src/components/overrides/PageTitle.astro',
      SiteTitle: './src/components/overrides/SiteTitle.astro',
      PageFrame: './src/components/overrides/PageFrame.astro',
      TwoColumnContent: './src/components/overrides/TwoColumnContent.astro'
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
      replacesTitle: false
    },
    social: {
      github: 'https://github.com/commerce-docs/dropins.dev'
    },
    sidebar: [
      // {
      //   label: "Docs for Summit '24",
      //   link: '/summit'
      // },
      {
        label: 'Essentials',
        badge: 'IP',
        items: [{
          label: 'Explore options',
          link: '/essentials/explore/'
        }, {
          label: 'Install drop-ins',
          link: '/essentials/install/'
        }, {
          label: 'Connect drop-ins',
          link: '/essentials/connect/'
        }, {
          badge: 'IP',
          label: 'Brand drop-ins',
          link: '/essentials/brand/'
        }, {
          label: 'Localize drop-ins',
          link: '/essentials/localize/'
        }, {
          label: 'Customize drop-ins',
          link: '/essentials/customize/'
        }]
      }, {
        label: 'Product Details',
        badge: 'IP',
        items: [{
          label: 'Anatomy',
          link: '/pdp/pdp-anatomy/'
        }, {
          label: 'Configure',
          link: '/pdp/pdp-configure/'
        }, {
          label: 'Brand',
          link: '/pdp/pdp-brand/'
        }, {
          label: 'Customize',
          link: '/pdp/pdp-customize/'
        }, {
          label: 'Reference',
          link: '/pdp/pdp-reference/'
        }]
      }, {
        label: 'Cart',
        badge: 'TBD',
        collapsed: true,
        items: [{
          label: 'Anatomy',
          link: '/cart/cart-anatomy/'
        }, {
          label: 'Configure',
          link: '/cart/cart-configure/'
        }, {
          label: 'Brand',
          link: '/cart/cart-brand/'
        }, {
          label: 'Customize',
          link: '/cart/cart-customize/'
        }, {
          label: 'Reference',
          link: '/cart/cart-reference/'
        }]
      }, {
        label: 'Checkout',
        badge: 'TBD',
        collapsed: true,
        items: [{
          label: 'Anatomy',
          link: '/checkout/checkout-anatomy/'
        }, {
          label: 'Configure',
          link: '/checkout/checkout-configure/'
        }, {
          label: 'Brand',
          link: '/checkout/checkout-brand/'
        }, {
          label: 'Customize',
          link: '/checkout/checkout-customize/'
        }, {
          label: 'Reference',
          link: '/checkout/checkout-reference/'
        }]
      }, {
        label: 'Integrations',
        badge: 'TBD',
        collapsed: true,
        items: [{
          label: 'Edge Delivery',
          link: '/integrate/integrate-eds/'
        }, {
          label: 'React',
          link: '/integrate/integrate-react/'
        }, {
          label: 'Vue',
          link: '/integrate/integrate-vue/'
        }]
      }]
  }),],
  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});
