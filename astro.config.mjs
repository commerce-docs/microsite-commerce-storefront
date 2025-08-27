import dotenv from 'dotenv';
dotenv.config();
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';
import { remarkBasePathLinks } from './src/plugins/remarkBasePathLinks';
import react from "@astrojs/react";
import starlightHeadingBadges from 'starlight-heading-badges';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const isGitHub = process.env.NODE_ENV === 'github';
const skipCompression = process.env.SKIP_COMPRESSION === 'true';

// Determine the base path based on the environment
const basePath = isProduction
  ? '/developer/commerce/storefront'
  : isGitHub
    ? process.env.VITE_GITHUB_BASE_PATH
    : '';


const sdkComponentsDir = path.resolve('./sdk/components');
const sdkComponentFiles = fs.existsSync(sdkComponentsDir)
  ? fs.readdirSync(sdkComponentsDir).filter(file => file.endsWith('.mdx'))
  : [];

const sdkComponentEntries = sdkComponentFiles.map(file => {
  const componentName = path.basename(file, '.mdx');
  // Capitalize the first letter (just like the Button entry)
  const label = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  return { label, link: `/sdk/components/${componentName}/` };
});

// https://astro.build/config
async function config() {
  const compress = (await import("@playform/compress")).default({
    CSS: false,
    HTML: false,
    Image: true,
    JavaScript: true,
    SVG: false,
  });

  return defineConfig({
    image: {
      service: passthroughImageService(),
    },
    site: 'https://experienceleague.adobe.com',
    base: basePath,
    markdown: {
      remarkPlugins: [remarkBasePathLinks],
      syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    },
    trailingSlash: 'ignore',
    outDir: './dist',

    redirects: {
      '/customize/design-tokens': `${basePath}/dropins/all/branding`,
      '/customize/enrich': `${basePath}/dropins/all/enriching`,
      '/customize/localize': `${basePath}/dropins/all/localizing`,
      '/customize/slots': `${basePath}/dropins/all/extending`,
      '/customize/style': `${basePath}/dropins/all/styling`,
      '/customize': `${basePath}/dropins/all/introduction`,
      '/dropins': `${basePath}/dropins/all/introduction`,
      '/dropins/cart/cart-introduction': `${basePath}/dropins/cart`,
      '/dropins/cart/cart-containers': `${basePath}/dropins/cart/`,
      '/dropins/checkout/checkout-introduction': `${basePath}/dropins/checkout`,
      '/dropins/user-account/useraccount-introduction': `${basePath}/dropins/user-account`,
      '/dropins/user-auth/userauth-introduction': `${basePath}/dropins/user-auth`,
      '/faq': `${basePath}/troublshooting/faq`,
      '/get-started/launch-checklist': `${basePath}/launch`,
      '/get-started/requirements': `${basePath}/setup/discovery/architecture`,
      '/get-started/configurations': `${basePath}/setup/configuration/commerce-configuration`,
      '/get-started/storefront-structure': `${basePath}/get-started/boilerplate-project`,
      '/merchants/get-started/multistore': `${basePath}/merchants/multistore`,
      '/product-details/pdp-containers': `${basePath}/dropins/product-details/containers`,
      '/product-details/pdp-functions': `${basePath}/dropins/product-details/functions`,
      '/product-details/pdp-installation': `${basePath}/dropins/product-details/installation`,
      '/product-details/pdp-introduction': `${basePath}/dropins/product-details/`,
      '/product-details/pdp-slots': `${basePath}/dropins/product-details/slots`,
      '/product-details/pdp-styles': `${basePath}/dropins/product-details/styles`,
      '/references/configurations': `${basePath}/setup/configuration/commerce-configuration`,
      '/references/requirements': `${basePath}/setup/discovery/architecture`,
      '/dropins/cart/cart-installation': `${basePath}/dropins/cart/installation`,
      '/dropins/cart/cart-styles': `${basePath}/dropins/cart/styles`,
      '/dropins/cart/cart-containers': `${basePath}/dropins/cart/containers`,
      '/dropins/cart/cart-slots': `${basePath}/dropins/cart/slots`,
      '/dropins/cart/cart-functions': `${basePath}/dropins/cart/functions`,
      '/dropins/cart/cart-dictionary': `${basePath}/dropins/cart/dictionary`,
      '/dropins/order/order-dictionary': `${basePath}/dropins/order/dictionary`,
      '/config': `${basePath}/setup/configuration`,
      '/config/commerce-configuration': `${basePath}/setup/configuration/commerce-configuration`,
      '/config/content-delivery-network': `${basePath}/setup/configuration/content-delivery-network`,
      '/config/gated-content': `${basePath}/setup/configuration/gated-content`,
      '/config/storefront-compatibility': `${basePath}/setup/configuration/storefront-compatibility/install`,
      '/setup/configuration/storefront-compatibility': `${basePath}/setup/configuration/storefront-compatibility/install`,
      '/get-started/release': `${basePath}/releases/`,
      '/seo/indexing': `${basePath}/setup/seo/indexing`,
      '/seo/metadata': `${basePath}/setup/seo/metadata`,
      '/merchants/get-started/multistore': `${basePath}/merchants/multistore`,
      '/merchants/terms-and-conditions': `${basePath}/merchants/get-started/terms-and-conditions`,
      '/dropins/all/enriching': `${basePath}/merchants/get-started/enrichment`,
      '/dropins/all/experimenting': `${basePath}/merchants/get-started/experiments`,
      '/analytics/instrumentation': `${basePath}/setup/analytics/instrumentation`,
      '/launch': `${basePath}/setup/launch`,
      '/discovery': `${basePath}/setup`,
      '/discovery/architecture': `${basePath}/setup/discovery/architecture`,
      '/discovery/data-export-validation': `${basePath}/setup/discovery/data-export-validation`,
      '/discovery/luma-bridge': `${basePath}/setup/discovery/luma-bridge`,
      '/dropins/all/eventbus': `${basePath}/sdk/reference/events`,
      '/dropins/other/recommendations': `${basePath}/dropins/recommendations`,
      '/dropins/other/search': `${basePath}/dropins/product-discovery`,
      '/dropins/all/localizing': `${basePath}/dropins/all/labeling`
    },
    integrations: [
      starlight({
        editLink: {
          baseUrl: 'https://github.com/commerce-docs/microsite-commerce-storefront/edit/develop/'
        },

        head: [{
          tag: 'script',
          attrs: {
            src: 'https://assets.adobedtm.com/d4d114c60e50/9f881954c8dc/launch-7a902c4895c3.min.js'
          }
        },
        {
          tag: 'meta',
          attrs: {
            name: 'google-site-verification',
            content: 'NwoVbL9MrtJAa4vdfMC0vJmKV3Hvuc4L_UHlv4Uzjgk'
          }
        },
        {
          tag: 'script',
          content: `
                        console.log("🔧 Cascading Expansion feature temporarily disabled to avoid navigation conflicts");
          `,
        },
        ],
        title: 'Adobe Commerce Storefront',
        favicon: 'favicon.ico',
        lastUpdated: true,
        plugins: [
          starlightSidebarTopics([
            {
              label: 'Storefront B2C',
              link: '/get-started/',
              icon: 'seti:json',
              items: [
                {
                  label: 'Getting Started',
                  items: [
                    {
                      label: 'Quick Start',
                      collapsed: false,
                      items: [
                        {
                          label: 'Create your storefront',
                          link: '/get-started/'
                        },
                        {
                          label: 'Explore the boilerplate',
                          link: '/get-started/boilerplate-project/'
                        },
                        {
                          label: 'Run Lighthouse audits',
                          link: '/get-started/run-lighthouse/'
                        },
                        {
                          label: 'Setup Overview',
                          link: '/setup/'
                        },
                      ]
                    },
                    {
                      label: 'Core Concepts',
                      collapsed: true,
                      items: [
                        {
                          label: 'Storefront architecture',
                          link: '/setup/discovery/architecture/'
                        },
                        {
                          label: 'Data export validation',
                          link: '/setup/discovery/data-export-validation/'
                        },
                        {
                          label: 'Compatibility Package Installation',
                          link: '/setup/configuration/storefront-compatibility/install/'
                        },
                        {
                          label: 'Adobe Commerce 2.4.7',
                          link: '/setup/configuration/storefront-compatibility/v247/'
                        },
                        {
                          label: 'Adobe Commerce 2.4.8',
                          link: '/setup/configuration/storefront-compatibility/v248/'
                        },
                      ]
                    },
                    {
                      label: 'Configuration',
                      collapsed: true,
                      items: [
                        {
                          label: 'Overview',
                          link: '/setup/configuration/'
                        },
                        {
                          label: 'Storefront configuration',
                          link: '/setup/configuration/commerce-configuration/'
                        },
                        {
                          label: 'Multistore setup',
                          link: '/setup/configuration/multistore-setup/'
                        },
                        {
                          label: 'Content delivery network',
                          link: '/setup/configuration/content-delivery-network/'
                        },
                        {
                          label: 'Gated content',
                          link: '/setup/configuration/gated-content/'
                        },
                      ]
                    },
                    {
                      label: 'Launch Preparation',
                      collapsed: true,
                      items: [
                        { label: 'Analytics Instrumentation', link: '/setup/analytics/instrumentation/' },
                        { label: 'Adobe Experience Platform', link: '/setup/analytics/adobe-experience-platform/' },
                        { label: 'SEO Indexing', link: '/setup/seo/indexing/' },
                        { label: 'SEO Metadata', link: '/setup/seo/metadata/' },
                        { label: 'Launch Checklist', link: '/setup/launch/' },
                      ]
                    },
                    {
                      label: 'Advanced Topics',
                      collapsed: true,
                      items: [
                        {
                          label: 'Luma Bridge Integration',
                          link: '/setup/discovery/luma-bridge/'
                        },
                      ]
                    },
                  ]
                },
                // Reorganized B2C Drop-ins with flatter, workflow-based structure
                {
                  label: 'Drop-in Essentials',
                  collapsed: true,
                  items: [
                    { label: 'Overview', link: '/dropins/all/introduction/' },
                    { label: 'Creating', link: '/dropins/all/creating/' },
                    { label: 'Installing', link: '/dropins/all/installing/' },
                    { label: 'Branding', link: '/dropins/all/branding/' },
                    { label: 'Styling', link: '/dropins/all/styling/' },
                    { label: 'Labeling', link: '/dropins/all/labeling/' },
                    { label: 'Linking', link: '/dropins/all/linking/' },
                    { label: 'Slots & Extensions', link: '/dropins/all/slots/' },
                    { label: 'Layouts', link: '/dropins/all/layouts/' },
                    { label: 'Extending', link: '/dropins/all/extending/' },
                  ]
                },
                // Shopping Experience Drop-ins (alphabetically ordered)
                {
                  label: 'Cart',
                  collapsed: true,
                  items: [
                    { label: 'Cart Overview', link: '/dropins/cart/' },
                    { label: 'Cart Installation', link: '/dropins/cart/installation/' },
                    { label: 'Cart Initialization', link: '/dropins/cart/initialization/' },
                    { label: 'Cart Styling', link: '/dropins/cart/styles/' },
                    { label: 'Cart Slots', link: '/dropins/cart/slots/' },
                    { label: 'Cart Functions', link: '/dropins/cart/functions/' },
                    { label: 'Cart Dictionary', link: '/dropins/cart/dictionary/' },
                    {
                      label: 'Cart Containers',
                      collapsed: false,
                      items: [
                        { label: 'CartSummaryGrid', link: '/dropins/cart/containers/cart-summary-grid/' },
                        { label: 'CartSummaryList', link: '/dropins/cart/containers/cart-summary-list/' },
                        { label: 'CartSummaryTable', link: '/dropins/cart/containers/cart-summary-table/' },
                        { label: 'Coupons', link: '/dropins/cart/containers/coupons/' },
                        { label: 'EmptyCart', link: '/dropins/cart/containers/empty-cart/' },
                        { label: 'EstimateShipping', link: '/dropins/cart/containers/estimate-shipping/' },
                        { label: 'GiftCards', link: '/dropins/cart/containers/gift-cards/' },
                        { label: 'GiftOptions', link: '/dropins/cart/containers/gift-options/' },
                        { label: 'MiniCart', link: '/dropins/cart/containers/minicart/' },
                        { label: 'OrderSummary', link: '/dropins/cart/containers/order-summary/' },
                        { label: 'OrderSummaryLine', link: '/dropins/cart/containers/order-summary-line/' },
                      ]
                    },
                    {
                      label: 'Cart Tutorials',
                      collapsed: false,
                      items: [
                        { label: 'Configure cart summary', link: '/dropins/cart/tutorials/configure-cart-summary/' },
                        { label: 'Add custom product lines', link: '/dropins/cart/tutorials/add-product-lines-to-cart-summary/' },
                        { label: 'Order summary lines', link: '/dropins/cart/tutorials/order-summary-lines/' },
                        { label: 'Add gift options to PDP', link: '/dropins/cart/tutorials/gift-options/' },
                        { label: 'Mini cart messages', link: '/dropins/cart/tutorials/add-messages-to-mini-cart/' },
                        { label: 'Product variation updates', link: '/dropins/cart/tutorials/enable-product-variation-updates-in-cart/' },
                      ]
                    },
                  ]
                },
                {
                  label: 'Checkout',
                  collapsed: true,
                  items: [
                    { label: 'Checkout Overview', link: '/dropins/checkout/' },
                    { label: 'Checkout Installation', link: '/dropins/checkout/installation/' },
                    { label: 'Checkout Initialization', link: '/dropins/checkout/initialization/' },
                    { label: 'Checkout Styling', link: '/dropins/checkout/styles/' },
                    { label: 'Checkout Extending', link: '/dropins/checkout/extending/' },
                    { label: 'Checkout Error Handling', link: '/dropins/checkout/error-handling/' },
                    { label: 'Checkout Event Handling', link: '/dropins/checkout/event-handling/' },
                    { label: 'Checkout Slots', link: '/dropins/checkout/slots/' },
                    { label: 'Checkout Functions', link: '/dropins/checkout/functions/' },
                    { label: 'Checkout Dictionary', link: '/dropins/checkout/dictionary/' },
                    {
                      label: 'Checkout Containers',
                      collapsed: false,
                      items: [
                        { label: 'Checkout Overview', link: '/dropins/checkout/containers/overview/' },
                        { label: 'BillToShippingAddress', link: '/dropins/checkout/containers/bill-to-shipping-address/' },
                        { label: 'Checkout EstimateShipping', link: '/dropins/checkout/containers/estimate-shipping/' },
                        { label: 'LoginForm', link: '/dropins/checkout/containers/login-form/' },
                        { label: 'MergedCartBanner', link: '/dropins/checkout/containers/merged-cart-banner/' },
                        { label: 'OutOfStock', link: '/dropins/checkout/containers/out-of-stock/' },
                        { label: 'PaymentMethods', link: '/dropins/checkout/containers/payment-methods/' },
                        { label: 'PlaceOrder', link: '/dropins/checkout/containers/place-order/' },
                        { label: 'ServerError', link: '/dropins/checkout/containers/server-error/' },
                        { label: 'ShippingMethods', link: '/dropins/checkout/containers/shipping-methods/' },
                        { label: 'TermsAndConditions', link: '/dropins/checkout/containers/terms-and-conditions/' },
                      ]
                    },
                    {
                      label: 'Checkout Tutorials',
                      collapsed: false,
                      items: [
                        { label: 'Add payment method', link: '/dropins/checkout/tutorials/add-payment-method/' },
                        { label: 'Address verification', link: '/dropins/checkout/tutorials/address-integration/' },
                        { label: 'Buy online, pickup in store', link: '/dropins/checkout/tutorials/buy-online-pickup-in-store/' },
                        { label: 'Multi-step checkout', link: '/dropins/checkout/tutorials/multi-step/' },
                      ]
                    },
                  ]
                },
                {
                  label: 'Order Management',
                  collapsed: true,
                  items: [
                    { label: 'Order Overview', link: '/dropins/order/' },
                    { label: 'Order Initialization', link: '/dropins/order/initialization/' },
                    { label: 'Order Styling', link: '/dropins/order/styles/' },
                    { label: 'Order Slots', link: '/dropins/order/slots/' },
                    { label: 'Order Functions', link: '/dropins/order/functions/' },
                    { label: 'Order Dictionary', link: '/dropins/order/dictionary/' },
                    {
                      label: 'Order Containers',
                      collapsed: false,
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
                    {
                      label: 'Order Tutorials',
                      collapsed: false,
                      items: [
                        { label: 'Order cancellation tutorial', link: '/dropins/order/tutorials/order-cancellation/' },
                      ]
                    },
                  ]
                },
                {
                  label: 'Payment Services',
                  collapsed: true,
                  items: [
                    { label: 'Payment Services Overview', link: '/dropins/payment-services/' },
                    { label: 'Payment Services Installation', link: '/dropins/payment-services/installation/' },
                    { label: 'Payment Services Dictionary', link: '/dropins/payment-services/dictionary/' },
                    {
                      label: 'Payment Containers',
                      collapsed: false,
                      items: [
                        { label: 'CreditCard', link: '/dropins/payment-services/containers/credit-card/' },
                      ]
                    },
                  ]
                },
                {
                  label: 'Personalization',
                  collapsed: true,
                  items: [
                    { label: 'Personalization Overview', link: '/dropins/personalization/' },
                    { label: 'Personalization Initialization', link: '/dropins/personalization/initialization/' },
                    { label: 'Personalization Functions', link: '/dropins/personalization/functions/' },
                    {
                      label: 'Personalization Containers',
                      collapsed: false,
                      items: [
                        { label: 'TargetedBlock', link: '/dropins/personalization/containers/targeted-block/' },
                      ]
                    },
                  ]
                },
                {
                  label: 'Product Details',
                  collapsed: true,
                  items: [
                    { label: 'Product Details Overview', link: '/dropins/product-details/' },
                    { label: 'PDP Installation', link: '/dropins/product-details/installation/' },
                    { label: 'PDP Initialization', link: '/dropins/product-details/initialization/' },
                    { label: 'PDP Styling', link: '/dropins/product-details/styles/' },
                    { label: 'PDP Slots', link: '/dropins/product-details/slots/' },
                    { label: 'PDP Functions', link: '/dropins/product-details/functions/' },
                    { label: 'PDP Dictionary', link: '/dropins/product-details/dictionary/' },
                    {
                      label: 'Product Detail Containers',
                      collapsed: false,
                      items: [
                        { label: 'ProductAttributes', link: '/dropins/product-details/containers/product-attributes/' },
                        { label: 'ProductDescription', link: '/dropins/product-details/containers/product-description/' },
                        { label: 'ProductGallery', link: '/dropins/product-details/containers/product-gallery/' },
                        { label: 'ProductHeader', link: '/dropins/product-details/containers/product-header/' },
                        { label: 'ProductOptions', link: '/dropins/product-details/containers/product-options/' },
                        { label: 'ProductPrice', link: '/dropins/product-details/containers/product-price/' },
                        { label: 'ProductQuantity', link: '/dropins/product-details/containers/product-quantity/' },
                        { label: 'ProductShortDescription', link: '/dropins/product-details/containers/product-short-description/' },
                        { label: 'ProductDetails', link: '/dropins/product-details/containers/product-details/', badge: 'Deprecated' },
                      ]
                    },
                  ]
                },
                {
                  label: 'Product Discovery',
                  collapsed: true,
                  items: [
                    { label: 'Discovery Overview', link: '/dropins/product-discovery/' },
                    { label: 'Discovery Installation', link: '/dropins/product-discovery/installation/' },
                    { label: 'Discovery Styling', link: '/dropins/product-discovery/styles/' },
                    { label: 'Discovery Functions', link: '/dropins/product-discovery/functions/' },
                    { label: 'Discovery Dictionary', link: '/dropins/product-discovery/dictionary/' },
                    { label: 'Discovery Slots', link: '/dropins/product-discovery/slots/' },
                    {
                      label: 'Product Discovery Containers',
                      collapsed: false,
                      items: [
                        { label: 'SearchResults', link: '/dropins/product-discovery/containers/search-results/' },
                        { label: 'Facets', link: '/dropins/product-discovery/containers/facets/' },
                        { label: 'SortBy', link: '/dropins/product-discovery/containers/sort-by/' },
                        { label: 'Pagination', link: '/dropins/product-discovery/containers/pagination/' },
                      ]
                    },
                  ]
                },
                {
                  label: 'Recommendations',
                  collapsed: true,
                  items: [
                    { label: 'Recommendations Overview', link: '/dropins/recommendations/' },
                    { label: 'Recommendations Installation', link: '/dropins/recommendations/installation/' },
                    { label: 'Recommendations Styling', link: '/dropins/recommendations/styles/' },
                    { label: 'Recommendations Functions', link: '/dropins/recommendations/functions/' },
                    { label: 'Recommendations Slots', link: '/dropins/recommendations/slots/' },
                    { label: 'Recommendations Dictionary', link: '/dropins/recommendations/dictionary/' },
                    {
                      label: 'Recommendation Containers',
                      collapsed: false,
                      items: [
                        { label: 'ProductList', link: '/dropins/recommendations/containers/product-list/' },
                      ]
                    },
                  ]
                },
                {
                  label: 'User Account',
                  collapsed: true,
                  items: [
                    { label: 'User Account Overview', link: '/dropins/user-account/' },
                    { label: 'Account Initialization', link: '/dropins/user-account/initialization/' },
                    { label: 'Account Styling', link: '/dropins/user-account/styles/' },
                    { label: 'Account Functions', link: '/dropins/user-account/functions/' },
                    { label: 'Account Dictionary', link: '/dropins/user-account/dictionary/' },
                    { label: 'Account Sidebar', link: '/dropins/user-account/sidebar/' },
                    { label: 'Account Tutorial', link: '/dropins/user-account/tutorials/' },
                    {
                      label: 'Account Containers',
                      collapsed: false,
                      items: [
                        { label: 'Addresses', link: '/dropins/user-account/containers/addresses/' },
                        { label: 'AddressForm', link: '/dropins/user-account/containers/address-form/' },
                        { label: 'CustomerInformation', link: '/dropins/user-account/containers/customer-information/' },
                        { label: 'OrdersList', link: '/dropins/user-account/containers/orders-list/' },
                      ]
                    },
                  ]
                },
                {
                  label: 'User Authentication',
                  collapsed: true,
                  items: [
                    { label: 'User Auth Overview', link: '/dropins/user-auth/' },
                    { label: 'reCAPTCHA', link: '/dropins/user-auth/recaptcha/' },
                    { label: 'Auth Slots', link: '/dropins/user-auth/slots/' },
                    { label: 'Auth Functions', link: '/dropins/user-auth/auth-functions/' },
                    { label: 'Auth Dictionary', link: '/dropins/user-auth/dictionary/' },
                    {
                      label: 'Authentication Containers',
                      collapsed: false,
                      items: [
                        { label: 'AuthCombine', link: '/dropins/user-auth/containers/auth-combine/' },
                        { label: 'ResetPassword', link: '/dropins/user-auth/containers/reset-password/' },
                        { label: 'SignIn', link: '/dropins/user-auth/containers/sign-in/' },
                        { label: 'SignUp', link: '/dropins/user-auth/containers/sign-up/' },
                        { label: 'SuccessNotification', link: '/dropins/user-auth/containers/success-notification/' },
                        { label: 'UpdatePassword', link: '/dropins/user-auth/containers/update-password/' },
                      ]
                    },
                  ]
                },
                {
                  label: 'Wishlist',
                  collapsed: true,
                  items: [
                    { label: 'Wishlist Overview', link: '/dropins/wishlist/' },
                    { label: 'Wishlist Installation', link: '/dropins/wishlist/installation/' },
                    { label: 'Wishlist Dictionary', link: '/dropins/wishlist/dictionary/' },
                    { label: 'Wishlist Functions', link: '/dropins/wishlist/functions/' },
                    { label: 'Wishlist Styling', link: '/dropins/wishlist/styles/' },
                    {
                      label: 'Wishlist Containers',
                      collapsed: false,
                      items: [
                        { label: 'Wishlist Container', link: '/dropins/wishlist/containers/wishlist/' },
                        { label: 'WishlistAlert', link: '/dropins/wishlist/containers/wishlist-alert/' },
                        { label: 'WishlistItem', link: '/dropins/wishlist/containers/wishlist-item/' },
                        { label: 'WishlistToggle', link: '/dropins/wishlist/containers/wishlist-toggle/' },
                      ]
                    },
                  ]
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
                  collapsed: true,
                  autogenerate: {
                    directory: '/releases/'
                  },
                },
              ],
            },
            // New top-level section for B2B content (placeholder, safe links)
            {
              label: 'Storefront B2B',
              link: '/setup/',
              icon: 'laptop',
              items: [
                // TODO: Replace placeholder links with real B2B overview and IA once paths exist
                {
                  label: 'B2B overview (placeholder)',
                  link: '/setup/'
                },
                {
                  label: 'B2B Drop-ins',
                  collapsed: true,
                  items: [
                    { label: 'Overview (placeholder)', link: '/dropins/all/introduction/' }
                  ]
                },
                {
                  label: 'B2B Guides and How-tos',
                  collapsed: true,
                  items: [
                    { label: 'Integration guide (placeholder)', link: '/setup/' }
                  ]
                }
              ]
            },
            {
              label: 'Storefront Authors',
              link: 'merchants/storefront-builder/',
              icon: 'seti:svg',
              items: [
                {
                  label: 'Commerce Storefront',
                  items: [
                    {
                      label: 'Create your content',
                      link: 'merchants/storefront-builder/'
                    },
                    {
                      label: 'Using the Document Authoring tool',
                      link: 'merchants/storefront-builder/document-authoring/'
                    },
                    {
                      label: 'Using the Visual Editor',
                      link: 'merchants/storefront-builder/visual-editor/'
                    },
                    // {
                    //   label: 'Using digital assets management',
                    //   link: 'merchants/storefront-builder/digital-assets-management/'
                    // },
                    {
                      label: 'Using Content and Commerce blocks',
                      link: 'merchants/storefront-builder/content-commerce-blocks/'
                    },
                  ],
                },
                {
                  label: 'Content customizations',
                  items: [
                    {
                      label: 'Introduction',
                      link: 'merchants/get-started/'
                    },
                    {
                      label: 'Enrichment',
                      link: 'merchants/get-started/enrichment/'
                    },
                    {
                      label: 'Experiments',
                      link: 'merchants/get-started/experiments/'
                    },
                    {
                      label: 'Personalization',
                      link: 'merchants/get-started/personalization/'
                    },
                    {
                      label: 'Product recommendations',
                      link: 'merchants/get-started/product-recommendations/'
                    },
                    {
                      label: 'Terms and conditions',
                      link: 'merchants/get-started/terms-and-conditions/'
                    },
                  ],
                },
                {
                  label: 'Multistore',
                  items: [
                    {
                      label: 'Introduction',
                      link: 'merchants/multistore/'
                    },
                    {
                      label: 'Localization',
                      link: 'merchants/multistore/content-localization/'
                    },
                  ],
                },
              ],
            },
            {
              label: 'Drop-in SDK',
              icon: 'puzzle',
              link: '/sdk/',
              items: [
                {
                  label: 'Getting started',
                  items: [
                    {
                      label: 'Introduction',
                      link: '/sdk/'
                    },
                    {
                      label: 'CLI usage',
                      link: '/sdk/get-started/cli/'
                    },
                  ],
                },
                {
                  label: 'Components',
                  collapsed: true,
                  items: [
                    {
                      label: 'Overview',
                      link: '/sdk/components/overview/'
                    },
                    {
                      label: 'Accordion',
                      link: '/sdk/components/accordion/'
                    },
                    {
                      label: 'ActionButton',
                      link: '/sdk/components/actionbutton/'
                    },
                    {
                      label: 'ActionButtonGroup',
                      link: '/sdk/components/actionbuttongroup/'
                    },
                    {
                      label: 'AlertBanner',
                      link: '/sdk/components/alertbanner/'
                    },
                    {
                      label: 'Breadcrumbs',
                      link: '/sdk/components/breadcrumbs/'
                    },
                    {
                      label: 'Button',
                      link: '/sdk/components/button/'
                    },
                    {
                      label: 'Card',
                      link: '/sdk/components/card/'
                    },
                    {
                      label: 'CartItem',
                      link: '/sdk/components/cartitem/'
                    },
                    {
                      label: 'CartList',
                      link: '/sdk/components/cartlist/'
                    },
                    {
                      label: 'Checkbox',
                      link: '/sdk/components/checkbox/'
                    },
                    {
                      label: 'ColorSwatch',
                      link: '/sdk/components/colorswatch/'
                    },
                    {
                      label: 'ContentGrid',
                      link: '/sdk/components/contentgrid/'
                    },
                    {
                      label: 'Divider',
                      link: '/sdk/components/divider/'
                    },
                    {
                      label: 'Field',
                      link: '/sdk/components/field/'
                    },
                    {
                      label: 'Header',
                      link: '/sdk/components/header/'
                    },
                    {
                      label: 'Icon',
                      link: '/sdk/components/icon/'
                    },
                    {
                      label: 'IllustratedMessage',
                      link: '/sdk/components/illustratedmessage/'
                    },
                    {
                      label: 'Image',
                      link: '/sdk/components/image/'
                    },
                    {
                      label: 'ImageSwatch',
                      link: '/sdk/components/imageswatch/'
                    },
                    {
                      label: 'InlineAlert',
                      link: '/sdk/components/inlinealert/'
                    },
                    {
                      label: 'Incrementer',
                      link: '/sdk/components/incrementer/'
                    },
                    {
                      label: 'Input',
                      link: '/sdk/components/input/'
                    },
                    {
                      label: 'InputDate',
                      link: '/sdk/components/inputdate/'
                    },
                    {
                      label: 'InputFile',
                      link: '/sdk/components/inputfile/'
                    },
                    {
                      label: 'InputPassword',
                      link: '/sdk/components/inputpassword/'
                    },
                    {
                      label: 'Modal',
                      link: '/sdk/components/modal/'
                    },
                    {
                      label: 'Pagination',
                      link: '/sdk/components/pagination/'
                    },
                    {
                      label: 'Picker',
                      link: '/sdk/components/picker/'
                    },
                    {
                      label: 'Portal',
                      link: '/sdk/components/portal/'
                    },
                    {
                      label: 'Price',
                      link: '/sdk/components/price/'
                    },
                    {
                      label: 'PriceRange',
                      link: '/sdk/components/pricerange/'
                    },
                    {
                      label: 'ProductItemCard',
                      link: '/sdk/components/productitemcard/'
                    },
                    {
                      label: 'ProgressSpinner',
                      link: '/sdk/components/progressspinner/'
                    },
                    {
                      label: 'RadioButton',
                      link: '/sdk/components/radiobutton/'
                    },
                    {
                      label: 'Skeleton',
                      link: '/sdk/components/skeleton/'
                    },
                    {
                      label: 'Tag',
                      link: '/sdk/components/tag/'
                    },
                    {
                      label: 'TextArea',
                      link: '/sdk/components/textarea/'
                    },
                    {
                      label: 'TextSwatch',
                      link: '/sdk/components/textswatch/'
                    },
                    {
                      label: 'ToggleButton',
                      link: '/sdk/components/togglebutton/'
                    },
                  ],
                },
                {
                  label: 'Base Design',
                  collapsed: true,
                  items: [{
                    label: 'Overview',
                    link: '/sdk/design/'
                  }, {
                    label: 'Design tokens',
                    link: '/sdk/design/base/'
                  }, {
                    label: 'Colors',
                    link: '/sdk/design/colors/'
                  }, {
                    label: 'Typography',
                    link: '/sdk/design/typography/'
                  }, {
                    label: 'Spacing',
                    link: '/sdk/design/spacing/'
                  }, {
                    label: 'Shapes',
                    link: '/sdk/design/shapes/'
                  }, {
                    label: 'Grids',
                    link: '/sdk/design/grid/'
                  }]
                }, {
                  label: 'Reference',
                  collapsed: true,
                  items: [
                    {
                      label: 'Overview',
                      link: '/sdk/reference/'
                    },
                    {
                      label: 'Events',
                      link: '/sdk/reference/events/'
                    }, {
                      label: 'GraphQL',
                      link: '/sdk/reference/graphql/'
                    }, {
                      label: 'Initializer',
                      link: '/sdk/reference/initializer/'
                    }, {
                      label: 'Links',
                      link: '/sdk/reference/links/'
                    }, {
                      label: 'Render',
                      link: '/sdk/reference/render/'
                    }, {
                      label: 'reCAPTCHA',
                      link: '/sdk/reference/recaptcha/'
                    }, {
                      label: 'Slots',
                      link: '/sdk/reference/slots/'
                    }, {
                      label: 'VComponent',
                      link: '/sdk/reference/vcomponent/'
                    },
                  ]
                }, {
                  label: 'Utilities',
                  collapsed: true,
                  items: [
                    {
                      label: 'Overview',
                      link: '/sdk/utilities/'
                    },
                    {
                      label: 'classList',
                      link: '/sdk/utilities/classlist/'
                    }, {
                      label: 'debounce',
                      link: '/sdk/utilities/debounce/'
                    }, {
                      label: 'deepmerge',
                      link: '/sdk/utilities/deepmerge/'
                    }, {
                      label: 'getCookie',
                      link: '/sdk/utilities/getcookie/'
                    }, {
                      label: 'getFormErrors',
                      link: '/sdk/utilities/getformerrors/'
                    }, {
                      label: 'getFormValues',
                      link: '/sdk/utilities/getformvalues/'
                    }, {
                      label: 'getPathValue',
                      link: '/sdk/utilities/getpathvalue/'
                    },]
                },
              ],
            },
            {
              label: 'Videos',
              link: '/videos/',
              icon: 'seti:video',
              items: [
                {
                  label: 'Storefront Videos',
                  items: [
                    { label: 'Overview', link: '/videos/' },
                    {
                      label: 'Add custom product lines to cart summary',
                      link: '/videos/add-product-lines-to-cart-summary/',
                    },
                    { label: 'Buy online, pickup in store', link: '/videos/buy-online-pickup-in-store/' },
                    {
                      label: 'Customize address form layout and address lookup',
                      link: '/videos/customize-address-form-layout/',
                    },
                    { label: 'Customize cart summary', link: '/videos/customize-cart-summary/' },
                    { label: 'Customize order summary lines', link: '/videos/customize-order-summary-lines/' },
                    { label: 'Multi-step checkout', link: '/videos/multi-step-checkout/' },
                    { label: 'Shopper experience', link: '/videos/shopper-experience/' },
                  ],
                },
              ],
            },
            {
              label: 'Playgrounds',
              link: '/playgrounds/',
              icon: 'laptop',
              items: [
                {
                  label: 'Storefront Playgrounds',
                  items: [
                    {
                      label: 'Introduction',
                      link: '/playgrounds/'
                    },
                    {
                      label: 'Commerce API Playground',
                      link: '/playgrounds/commerce-services/'
                    },
                    {
                      label: 'Commerce Optimizer API Playground',
                      link: '/playgrounds/commerce-optimizer/'
                    },
                  ],
                },
              ],
            },
          ]),
          starlightHeadingBadges(),
          starlightLinksValidator({
            errorOnFallbackPages: false,
            errorOnInconsistentLocale: true
          }),
          starlightImageZoom({
            showCaptions: false
          })
        ],
        // Component overrides
        components: {
          CallToAction: './src/components/overrides/CallToAction.astro',
          Footer: './src/components/overrides/Footer.astro',
          Icon: './src/components/overrides/Icon.astro',
          Header: './src/components/overrides/Header.astro',
          Hero: './src/components/overrides/Hero.astro',
          PageTitle: './src/components/overrides/PageTitle.astro',

          SiteTitle: './src/components/overrides/SiteTitle.astro',
          SocialIcons: './src/components/overrides/SocialIcons.astro',
          LinkCard: './src/components/LinkCard.astro',
          ContentPanel: './src/components/overrides/ContentPanel.astro',
          CardGrid: './src/components/CardGrid.astro',
          Pagination: './src/components/overrides/Pagination.astro',
        },
        customCss: [
          './src/styles/reset.css',
          './src/fonts/font-face.css',
          './src/styles/colors.css',
          './src/styles/badge.css',
          './src/styles/asides.css',
          './src/styles/layout.css',
          './src/styles/text.css',
          './src/styles/custom.css',
        ],
        logo: {
          src: './src/assets/sitelogo.svg',
          replacesTitle: false
        },
        social: [
          { icon: 'github', label: 'GitHub', href: 'https://github.com/commerce-docs/microsite-commerce-storefront/tree/develop' },
          { icon: 'discord', label: 'Discord', href: 'https://discord.com/channels/1131492224371277874/1220042081209421945' },
        ],
      }),
      compress,
      react()
    ]
  });
}


export default config();
