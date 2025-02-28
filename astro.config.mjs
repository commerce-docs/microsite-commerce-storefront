import dotenv from 'dotenv';
dotenv.config();
import { defineConfig, passthroughImageService } from 'astro/config';
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
  image: {
    service: passthroughImageService(),
  },
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
    '/dropins/cart/cart-containers': '/developer/commerce/storefront/dropins/cart/',
    '/dropins/checkout/checkout-introduction': '/developer/commerce/storefront/dropins/checkout',
    '/dropins/user-account/useraccount-introduction': '/developer/commerce/storefront/dropins/user-account',
    '/dropins/user-auth/userauth-introduction': '/developer/commerce/storefront/dropins/user-auth',
    '/faq': '/developer/commerce/storefront/troublshooting/faq',
    '/get-started/launch-checklist': '/developer/commerce/storefront/launch',
    '/get-started/requirements': '/developer/commerce/storefront/discovery/architecture',
    '/get-started/configurations': '/developer/commerce/storefront/config/commerce-configuration',
    '/product-details/pdp-containers': '/developer/commerce/storefront/dropins/product-details/containers',
    '/product-details/pdp-functions': '/developer/commerce/storefront/dropins/product-details/functions',
    '/product-details/pdp-installation': '/developer/commerce/storefront/dropins/product-details/installation',
    '/product-details/pdp-introduction': '/developer/commerce/storefront/dropins/product-details/',
    '/product-details/pdp-slots': '/developer/commerce/storefront/dropins/product-details/slots',
    '/product-details/pdp-styles': '/developer/commerce/storefront/dropins/product-details/styles',
    '/references/configurations': '/developer/commerce/storefront/config/commerce-configuration',
    '/references/requirements': '/developer/commerce/storefront/discovery/architecture',
    '/dropins/cart/cart-installation': '/developer/commerce/storefront/dropins/cart/installation',
    '/dropins/cart/cart-styles': '/developer/commerce/storefront/dropins/cart/styles',
    '/dropins/cart/cart-containers': '/developer/commerce/storefront/dropins/cart/containers',
    '/dropins/cart/cart-slots': '/developer/commerce/storefront/dropins/cart/slots',
    '/dropins/cart/cart-functions': '/developer/commerce/storefront/dropins/cart/functions',
    '/dropins/cart/cart-dictionary': '/developer/commerce/storefront/dropins/cart/dictionary',
    '/dropins/order/order-dictionary': '/developer/commerce/storefront/dropins/order/dictionary',
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
          src: 'https://assets.adobedtm.com/d4d114c60e50/9f881954c8dc/launch-7a902c4895c3.min.js'
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
        Footer: './src/components/overrides/Footer.astro',
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
        items: [
          {
            label: 'Create your storefront',
            link: '/get-started/'
          },
          {
            label: 'Explore the boilerplate',
            link: '/get-started/storefront-structure/'
          },
          {
            label: 'Run Lighthouse audits',
            link: '/get-started/run-lighthouse/'
          },
        ]
      },
      {
        label: 'Set up Storefront',
        items: [
          {
            label: 'Discovery',
            collapsed: true,
            autogenerate: {
              directory: '/discovery/'
            },
          },
          {
            label: 'Configuration',
            collapsed: true,
            autogenerate: {
              directory: '/config/'
            },
          },
          {
            label: 'Analytics',
            collapsed: true,
            autogenerate: {
              directory: '/analytics/'
            },
          },
          {
            label: 'SEO',
            collapsed: true,
            autogenerate: {
              directory: '/seo/'
            },
          },
          {
            label: 'Launch',
            collapsed: true,
            autogenerate: {
              directory: '/launch/'
            },
          },
        ]
      },
      {
        label: 'Customize Drop-ins',
        collapsed: true,
        items: [
          {
            label: 'Overview',
            link: '/dropins/all/introduction/'
          },
          // {
          //   label: 'Anatomy',
          //   link: '/dropins/all/anatomy/'
          // },
          {
            label: 'Installing',
            link: '/dropins/all/installing/'
          },
          {
            label: 'Branding',
            link: '/dropins/all/branding/'
          },
          {
            label: 'Labeling',
            link: '/dropins/all/labeling/'
          },
          {
            label: 'Styling',
            link: '/dropins/all/styling/'
          },
          {
            label: 'Slots',
            link: '/dropins/all/slots/'
          },
          {
            label: 'Layouts',
            link: '/dropins/all/layouts/'
          },
          {
            label: 'Extending',
            link: '/dropins/all/extending/'
          },
          {
            label: 'Enriching',
            link: '/dropins/all/enriching/'
          },
          {
            label: 'Experimenting',
            link: '/dropins/all/experimenting/'
          },
          {
            label: 'Product details page',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/product-details/' },
              { label: 'Installation', link: '/dropins/product-details/installation/' },
              { label: 'Initialization', link: '/dropins/product-details/initialization/' },
              { label: 'Styles', link: '/dropins/product-details/styles/' },
              {
                label: 'Containers', collapsed: true,
                items: [
                  { label: 'ProductAttributes', link: '/dropins/product-details/containers/product-attributes/' },
                  { label: 'ProductDescription', link: '/dropins/product-details/containers/product-description/' },
                  { label: 'ProductGallery', link: '/dropins/product-details/containers/product-gallery/' },
                  { label: 'ProductHeader', link: '/dropins/product-details/containers/product-header/' },
                  { label: 'ProductOptions', link: '/dropins/product-details/containers/product-options/' },
                  { label: 'ProductPrice', link: '/dropins/product-details/containers/product-price/' },
                  { label: 'ProductQuantity', link: '/dropins/product-details/containers/product-quantity/' },
                  { label: 'ProductShortDescription', link: '/dropins/product-details/containers/product-short-description/' },
                  { label: 'ProductDetails', link: '/dropins/product-details/containers/product-details/' },
                ]
              },
              { label: 'Slots', link: '/dropins/product-details/slots/' },
              { label: 'Functions', link: '/dropins/product-details/functions/' },
              { label: 'Dictionary', link: '/dropins/product-details/dictionary/' },
            ]
          },
          {
            label: 'Cart',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/cart/' },
              { label: 'Installation', link: '/dropins/cart/installation/' },
              { label: 'Initialization', link: '/dropins/cart/initialization/' },
              { label: 'Styles', link: '/dropins/cart/styles/' },
              {
                label: 'Containers', collapsed: true,
                items: [
                  { label: 'CartSummaryGrid', link: '/dropins/cart/containers/cart-summary-grid/' },
                  { label: 'CartSummaryList', link: '/dropins/cart/containers/cart-summary-list/' },
                  { label: 'Coupons', link: '/dropins/cart/containers/coupons/' },
                  { label: 'EmptyCart', link: '/dropins/cart/containers/empty-cart/' },
                  { label: 'EstimateShipping', link: '/dropins/cart/containers/estimate-shipping/' },
                  { label: 'MiniCart', link: '/dropins/cart/containers/minicart/' },
                  { label: 'OrderSummary', link: '/dropins/cart/containers/order-summary/' },
                  { label: 'OrderSummaryLine', link: '/dropins/cart/containers/order-summary-line/' },

                ]
              },
              { label: 'Slots', link: '/dropins/cart/slots/' },
              { label: 'Functions', link: '/dropins/cart/functions/' },
              { label: 'Dictionary', link: '/dropins/cart/dictionary/' },
              {
                label: 'Tutorials',
                collapsed: true,
                items: [
                  { label: 'Configure the cart summary block', link: '/dropins/cart/tutorials/configure-cart-summary/' },
                  { label: 'Add custom product lines to the cart summary', link: '/dropins/cart/tutorials/add-product-lines-to-cart-summary/' },
                  { label: 'Order summary lines', link: '/dropins/cart/tutorials/order-summary-lines/' },
                ]
              },
            ]
          },
          {
            label: 'Checkout',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/checkout/' },
              { label: 'Installation', link: '/dropins/checkout/installation/' },
              { label: 'Initialization', link: '/dropins/checkout/initialization/' },
              { label: 'Styles', link: '/dropins/checkout/styles/' },
              {
                label: 'Containers',
                collapsed: true,
                items: [
                  { label: 'BillToShippingAddress', link: '/dropins/checkout/containers/bill-to-shipping-address/' },
                  { label: 'EstimateShipping', link: '/dropins/checkout/containers/estimate-shipping/' },
                  { label: 'LoginForm', link: '/dropins/checkout/containers/login-form/' },
                  { label: 'MergedCartBanner', link: '/dropins/checkout/containers/merged-cart-banner/' },
                  { label: 'OrderConfirmationHeader', link: '/dropins/checkout/containers/order-confirmation-header/' },
                  { label: 'OutOfStock', link: '/dropins/checkout/containers/out-of-stock/' },
                  { label: 'PaymentMethods', link: '/dropins/checkout/containers/payment-methods/' },
                  { label: 'PlaceOrder', link: '/dropins/checkout/containers/place-order/' },
                  { label: 'ServerError', link: '/dropins/checkout/containers/server-error/' },
                  { label: 'ShippingMethods', link: '/dropins/checkout/containers/shipping-methods/' },
                ]
              },
              { label: 'Slots', link: '/dropins/checkout/slots/' },
              { label: 'Functions', link: '/dropins/checkout/functions/' },
              { label: 'Dictionary', link: '/dropins/checkout/dictionary/' },
              {
                label: 'Tutorials',
                collapsed: true,
                items: [
                  { label: 'Add a payment method', link: '/dropins/checkout/tutorials/add-payment-method/' },
                  { label: 'Buy online, pickup in store', link: '/dropins/checkout/tutorials/buy-online-pickup-in-store/' },
                  { label: 'Multi-step guest checkout', link: '/dropins/checkout/tutorials/multi-step/' },
                  { label: 'Address verification', link: '/dropins/checkout/tutorials/address-integration/' },
                ]
              },
            ],
          },
          {
            label: 'Order',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/order/' },
              { label: 'Initialization', link: '/dropins/order/initialization/' },
              { label: 'Styles', link: '/dropins/order/styles/' },
              {
                label: 'Containers',
                collapsed: true,
                items: [
                  { label: 'CreateReturn', link: '/dropins/order/containers/create-return/' },
                  { label: 'CustomerDetails', link: '/dropins/order/containers/customer-details/' },
                  { label: 'OrderCancelForm', link: '/dropins/order/containers/order-cancel-form/' },
                  { label: 'OrderCostSummary', link: '/dropins/order/containers/order-cost-summary/' },
                  { label: 'OrderProductList', link: '/dropins/order/containers/order-product-list/' },
                  { label: 'OrderReturns', link: '/dropins/order/containers/order-returns/' },
                  { label: 'OrderSearch', link: '/dropins/order/containers/order-search/' },
                  { label: 'ReturnsList', link: '/dropins/order/containers/returns-list/' },
                  { label: 'ShippingStatus', link: '/dropins/order/containers/shipping-status/' },
                ]
              },
              { label: 'Slots', link: '/dropins/order/slots/' },
              { label: 'Functions', link: '/dropins/order/functions/' },
              { label: 'Dictionary', link: '/dropins/order/dictionary/' },
              {
                label: 'Tutorials',
                collapsed: true,
                items: [
                  { label: 'Order cancellation', link: '/dropins/order/tutorials/order-cancellation/' },
                ]
              },
            ]
          },
          {
            label: 'Payment Services',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/payment-services/' },
              { label: 'Installation', link: '/dropins/payment-services/installation/' },
              {
                label: 'Containers', collapsed: true,
                items: [
                  { label: 'CreditCard', link: '/dropins/payment-services/containers/credit-card/' },
                ]
              },
              { label: 'Dictionary', link: '/dropins/payment-services/dictionary/' },
            ]
          },
          {
            label: 'User auth',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/user-auth/' },
              { label: 'reCAPTCHA', link: '/dropins/user-auth/recaptcha/' },
              {
                label: 'Containers',
                collapsed: true,
                items: [
                  { label: 'AuthCombine', link: '/dropins/user-auth/containers/auth-combine/' },
                  { label: 'ResetPassword', link: '/dropins/user-auth/containers/reset-password/' },
                  { label: 'SignIn', link: '/dropins/user-auth/containers/sign-in/' },
                  { label: 'SignUp', link: '/dropins/user-auth/containers/sign-up/' },
                  { label: 'SuccessNotification', link: '/dropins/user-auth/containers/success-notification/' },
                  { label: 'UpdatePassword', link: '/dropins/user-auth/containers/update-password/' },
                ]
              },
              { label: 'Slots', link: '/dropins/user-auth/slots/' },
              { label: 'Functions', link: '/dropins/user-auth/auth-functions/' },
              { label: 'Dictionary', link: '/dropins/user-auth/dictionary/' },
            ],
          },
          {
            label: 'User account',
            collapsed: true,
            items: [
              { label: 'Overview', link: '/dropins/user-account/' },
              { label: 'Initialization', link: '/dropins/user-account/initialization/' },
              { label: 'Styles', link: '/dropins/user-account/styles/' },
              {
                label: 'Containers',
                collapsed: true,
                items: [
                  { label: 'Addresses', link: '/dropins/user-account/containers/addresses/' },
                  { label: 'AddressForm', link: '/dropins/user-account/containers/address-form/' },
                  { label: 'CustomerInformation', link: '/dropins/user-account/containers/customer-information/' },
                  { label: 'OrdersList', link: '/dropins/user-account/containers/orders-list/' },
                ]
              },
              // { label: 'Slots', link: '/dropins/user-account/slots/' },
              { label: 'Functions', link: '/dropins/user-account/functions/' },
              { label: 'Dictionary', link: '/dropins/user-account/dictionary/' },
              { label: 'Sidebar', link: '/dropins/user-account/sidebar/' },
              { label: 'Tutorial', link: '/dropins/user-account/tutorials/' },
            ]
          }]
      },
     
      {
        label: 'Troubleshooting',
        collapsed: true,
        autogenerate: {
          directory: '/troubleshooting/'
        }
      },
      {
        label: 'Resources',
        collapsed: true,
        autogenerate: {
          directory: '/resources/'
        },
      },
      {
        label: 'Releases',
        link: '/releases/'
      },
      ],
    }), (await import("@playform/compress")).default({
      CSS: false,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true
    }), react()]
});
