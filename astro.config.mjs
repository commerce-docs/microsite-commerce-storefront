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
const isGitHub = process.env.NODE_ENV === 'github';

// Determine the base path based on the environment
const basePath = isProduction
  ? '/developer/commerce/storefront'
  : isGitHub
    ? process.env.VITE_GITHUB_BASE_PATH
    : '/microsite-commerce-storefront';

// https://astro.build/config
export default defineConfig({
  site: 'https://experienceleague.adobe.com',
  base: basePath,
  markdown: {
    remarkPlugins: [remarkBasePathLinks]
  },
  trailingSlash: 'ignore',
  outDir: './dist',
  redirects: {
    '/customize/design-tokens': '/developer/commerce/storefront/dropins/all/branding',
    '/customize/enrich': '/developer/commerce/storefront/dropins/all/enriching',
    '/customize/localize': '/developer/commerce/storefront/dropins/all/localizing',
    '/customize/slots': '/developer/commerce/storefront/dropins/all/extending',
    '/customize/style': '/developer/commerce/storefront/dropins/all/styling',
    '/customize': '/developer/commerce/storefront/dropins/all/introduction',
    '/dropins': '/developer/commerce/storefront/dropins/all/introduction',
    '/dropins/cart/cart-introduction': '/developer/commerce/storefront/dropins/cart',
    '/dropins/checkout/checkout-introduction': '/developer/commerce/storefront/dropins/checkout',
    '/dropins/user-account/useraccount-introduction': '/developer/commerce/storefront/dropins/user-account',
    '/dropins/user-auth/userauth-introduction': '/developer/commerce/storefront/dropins/user-auth',
    '/faq': '/developer/commerce/storefront/troublshooting/faq',
    '/get-started/launch-checklist': '/developer/commerce/storefront/implementation/launch',
    '/get-started/requirements': '/developer/commerce/storefront/discovery/requirements',
    '/get-started/configurations': '/developer/commerce/storefront/setup/commerce-configuration',
    '/launch': '/developer/commerce/storefront/implementation/launch',
    '/product-details/pdp-containers': '/developer/commerce/storefront/dropins/product-details/pdp-containers',
    '/product-details/pdp-functions': '/developer/commerce/storefront/dropins/product-details/pdp-functions',
    '/product-details/pdp-installation': '/developer/commerce/storefront/dropins/product-details/pdp-installation',
    '/product-details/pdp-introduction': '/developer/commerce/storefront/dropins/product-details/',
    '/product-details/pdp-slots': '/developer/commerce/storefront/dropins/product-details/pdp-slots',
    '/product-details/pdp-styles': '/developer/commerce/storefront/dropins/product-details/pdp-styles',
    '/references/configurations': '/developer/commerce/storefront/setup/commerce-configuration',
    '/references/requirements': '/developer/commerce/storefront/discovery/requirements',
  },
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
          src: 'https://assets.adobedtm.com/d4d114c60e50/9f881954c8dc/launch-7a902c4895c3.min.js" async'
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
        SocialIcons: './src/components/overrides/SocialIcons.astro',
        LinkCard: './src/components/LinkCard.astro',
      },
      customCss: ['./src/styles/reset.css', './src/styles/tailwind.css', './src/fonts/font-face.css', './src/styles/colors.css', './src/styles/badge.css', './src/styles/custom.css', './src/styles/asides.css', './src/styles/layout.css', './src/styles/text.css',],
      logo: {
        src: './src/assets/sitelogo.svg',
        replacesTitle: false
      },
      social: {
        discord: 'https://discord.com/channels/1131492224371277874/1220042081209421945',
        github: 'https://github.com/commerce-docs/microsite-commerce-storefront/tree/develop'
      },
      sidebar: [{
        label: 'Get Started',
        autogenerate: {
          directory: '/get-started/'
        }
      },
      {
        label: 'Storefront Implementation',
        items: [
          {
            label: 'Overview',
            link: '/implementation/'
          },
          {
            label: 'Discovery',
            collapsed: true,
            items: [
              {
                label: 'Overview',
                link: '/implementation/discovery/'
              },
              {
                label: 'Commerce requirements',
                link: '/implementation/discovery/requirements/'
              },
              {
                label: 'Data export validation',
                link: '/implementation/discovery/data-export-validation/'
              },
              {
                label: 'Luma Bridge',
                link: '/implementation/discovery/luma-bridge/'
              },
            ]
          },
          {
            label: 'Setup',
            collapsed: true,
            items: [
              {
                label: 'Overview',
                link: '/implementation/setup/'
              },
              {
                label: 'Content delivery network',
                link: '/implementation/setup/content-delivery-network/'
              },
              {
                label: 'Commerce configuration',
                link: '/implementation/setup/commerce-configuration/'
              },
              {
                label: 'Dropins and widgets',
                link: '/implementation/setup/dropins-and-widgets/'
              },
              {
                label: 'Commerce blocks',
                link: '/implementation/setup/commerce-blocks/'
              },
            ]
          },
          {
            label: 'Marketing and SEO',
            collapsed: true,
            items: [
              {
                label: 'Overview',
                link: '/implementation/marketing/'
              },
              {
                label: 'Instrumentation',
                link: '/implementation/marketing/commerce-instrumentation/'
              },
              {
                label: 'Indexing and metadata',
                link: '/implementation/marketing/metadata/'
              },
            ]
          },
          {
            label: 'Launch',
            collapsed: true,
            items: [
              {
                label: 'Overview',
                link: '/implementation/launch/'
              },
              {
                label: 'Checklist',
                link: '/implementation/launch/checklist/'
              },
            ]
          },
        ]
      },
      {
        label: 'Dropins',
        items: [
          {
            label: 'Overview',
            link: '/dropins/all/introduction/'
          },
          // {
          //   label: 'Anatomy of a dropin',
          //   link: '/dropins/all/anatomy/'
          // },
          {
            label: 'Installing dropins',
            link: '/dropins/all/installing/'
          },
          {
            label: 'Branding dropins',
            link: '/dropins/all/branding/'
          },
          // {
          //   label: 'Localizing dropins',
          //   link: '/dropins/all/localizing/'
          // },
          {
            label: 'Styling dropins',
            link: '/dropins/all/styling/'
          },
          {
            label: 'Extending dropins',
            link: '/dropins/all/extending/'
          },
          // {
          //   label: 'Enriching dropins',
          //   link: '/dropins/all/enriching/'
          // },
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
              { label: 'Cart Installation', link: '/dropins/cart/cart-installation/' },
              { label: 'Cart Styles', link: '/dropins/cart/cart-styles/' },
              { label: 'Cart Containers', link: '/dropins/cart/cart-containers/' },
              { label: 'Cart Slots', link: '/dropins/cart/cart-slots/' },
              { label: 'Cart Functions', link: '/dropins/cart/cart-functions/' },
            ]
          },
          {
            label: 'Checkout',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/checkout/' },
              // { label: 'Checkout Installation', link: '/dropins/checkout/checkout-installation/' },
              // { label: 'Checkout Styles', link: '/dropins/checkout/checkout-styles/' },
              // { label: 'Checkout Containers', link: '/dropins/checkout/checkout-containers/' },
              // { label: 'Checkout Slots', link: '/dropins/checkout/checkout-slots/' },
              // { label: 'Checkout Functions', link: '/dropins/checkout/checkout-functions/' },
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
      ]
    }), (await import("@playform/compress")).default({
      CSS: false,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true
    }), react()]
});
