import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import react from '@astrojs/react';
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightImageZoom from 'starlight-image-zoom';
import starlightLinksValidator from 'starlight-links-validator';
import starlightHeadingBadges from 'starlight-heading-badges';
import starlightSidebarTopics from 'starlight-sidebar-topics';

import { remarkBasePathLinks } from './src/plugins/remarkBasePathLinks';

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
  ? fs.readdirSync(sdkComponentsDir).filter((file) => file.endsWith('.mdx'))
  : [];

const sdkComponentEntries = sdkComponentFiles.map((file) => {
  const componentName = path.basename(file, '.mdx');
  const label = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  return { label, link: `/sdk/components/${componentName}/` };
});

// https://astro.build/config
async function config() {
  const compressIntegration = (await import('@playform/compress')).default({
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
    build: {
      inlineStylesheets: 'always',
    },

    redirects: {
      '/customize/design-tokens': `${basePath}/dropins/all/branding`,
      '/customize/enrich': `${basePath}/dropins/all/enriching`,
      '/customize/localize': `${basePath}/dropins/all/localizing`,
      '/customize/slots': `${basePath}/dropins/all/extending`,
      '/customize/style': `${basePath}/dropins/all/styling`,
      '/customize': `${basePath}/dropins/all/introduction`,
      '/dropins': `${basePath}/dropins/all/introduction`,
      '/dropins/cart/cart-introduction': `${basePath}/dropins/cart`,
      '/dropins/checkout/checkout-introduction': `${basePath}/dropins/checkout`,
      '/dropins/user-account/useraccount-introduction': `${basePath}/dropins/user-account`,
      '/dropins/user-auth/userauth-introduction': `${basePath}/dropins/user-auth`,
      '/faq': `${basePath}/troubleshooting/faq`,
      '/get-started/launch-checklist': `${basePath}/launch`,
      '/get-started/requirements': `${basePath}/setup/discovery/architecture`,
      '/get-started/configurations': `${basePath}/setup/configuration/commerce-configuration`,
      '/get-started/storefront-structure': `${basePath}/get-started/boilerplate-project`,
      '/merchants/get-started/multistore': `${basePath}/setup/configuration/multistore-setup`,
      '/merchants/multistore': `${basePath}/setup/configuration/multistore-setup`,
      '/setup/multistore': `${basePath}/setup/configuration/multistore-setup`,
      // Quick start redirects (storefront-builder → quick-start)
      '/merchants/get-started/': `${basePath}/merchants/quick-start`,
      '/merchants/storefront-builder/create-content': `${basePath}/merchants/quick-start/create-content`,
      '/merchants/storefront-builder/document-authoring': `${basePath}/merchants/quick-start/document-authoring`,
      '/merchants/storefront-builder/visual-editor': `${basePath}/merchants/quick-start/visual-editor`,
      '/merchants/storefront-builder/content-commerce-blocks': `${basePath}/merchants/quick-start/content-commerce-blocks`,
      '/merchants/storefront-builder/page-metadata': `${basePath}/merchants/quick-start/page-metadata`,
      '/merchants/storefront-builder/section-metadata': `${basePath}/merchants/quick-start/section-metadata`,
      '/merchants/storefront-builder/your-first-page': `${basePath}/merchants/quick-start/your-first-page`,
      // Commerce blocks redirects (storefront-builder → commerce-blocks)
      '/merchants/storefront-builder/': `${basePath}/merchants/commerce-blocks`,
      '/merchants/storefront-builder/personalization': `${basePath}/merchants/commerce-blocks/personalization`,
      '/merchants/storefront-builder/product-recommendations': `${basePath}/merchants/commerce-blocks/product-recommendations`,
      '/merchants/get-started/personalization': `${basePath}/merchants/commerce-blocks/personalization`,
      '/merchants/get-started/product-recommendations': `${basePath}/merchants/commerce-blocks/product-recommendations`,
      // Content customizations redirects (get-started → content-customizations)
      '/merchants/get-started/content-customizations': `${basePath}/merchants/content-customizations`,
      '/merchants/get-started/enrichment': `${basePath}/merchants/content-customizations/enrichment`,
      '/merchants/get-started/experiments': `${basePath}/merchants/content-customizations/experiments`,
      '/merchants/get-started/terms-and-conditions': `${basePath}/merchants/content-customizations/terms-and-conditions`,
      '/product-details/pdp-containers': `${basePath}/dropins/product-details/containers`,
      '/product-details/pdp-functions': `${basePath}/dropins/product-details/functions`,
      '/product-details/pdp-installation': `${basePath}/dropins/product-details/installation`,
      '/product-details/pdp-introduction': `${basePath}/dropins/product-details/`,
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
      '/merchants/terms-and-conditions': `${basePath}/merchants/get-started/terms-and-conditions`,
      '/dropins/all/enriching': `${basePath}/merchants/get-started/enrichment`,
      '/dropins/all/experimenting': `${basePath}/merchants/get-started/experiments`,
      '/analytics/instrumentation': `${basePath}/setup/analytics/instrumentation`,
      '/launch': `${basePath}/setup/launch`,
      // Product Discovery Container Redirects
      '/dropins/product-discovery/containers/product-list': `${basePath}/dropins/product-discovery/containers/search-results`,
      '/dropins/product-discovery/containers/results-info': `${basePath}/dropins/product-discovery/containers/pagination`,
      '/dropins/product-discovery/containers/search-bar-input': `${basePath}/dropins/product-discovery`,
      '/dropins/product-discovery/containers/search-bar-results': `${basePath}/dropins/product-discovery`,
      // Cart Tutorial Redirects
      '/dropins/cart/tutorials/add-inline-messages-to-mini-cart': `${basePath}/dropins/cart/tutorials/add-messages-to-mini-cart`,
      '/dropins/cart/tutorials/add-overlay-messages-to-mini-cart': `${basePath}/dropins/cart/tutorials/add-messages-to-mini-cart`,
      // Dropin General Redirects
      '/dropins/all/anatomy': `${basePath}/dropins/all/introduction`,
      // SDK Redirects
      '/sdk/get-started/create-a-dropin': `${basePath}/dropins/all/creating`,
      '/sdk/get-started': `${basePath}/sdk/get-started/cli`,
      '/sdk/reference/initialize': `${basePath}/sdk/reference/initializer`,
      // Merchant/Storefront Builder Redirects
      '/merchants/get-started/localization': `${basePath}/merchants/multistore/content-localization`,
      '/merchants/multistore/commerce-localization': `${basePath}/merchants/multistore/content-localization`,
      '/merchants/multistore/localization': `${basePath}/merchants/multistore/content-localization`,
      // Miscellaneous Redirects
      '/activate': `${basePath}/setup`,
      '/resources/product-discovery-diagrams': `${basePath}/dropins/product-discovery`,
      '/setup/aem-assets-integration': `${basePath}/merchants/storefront-builder/visual-editor`,
      '/discovery': `${basePath}/setup`,
      '/discovery/architecture': `${basePath}/setup/discovery/architecture`,
      '/discovery/data-export-validation': `${basePath}/setup/discovery/data-export-validation`,
      '/discovery/luma-bridge': `${basePath}/setup/discovery/luma-bridge`,
      '/dropins/all/eventbus': `${basePath}/dropins/all/events`,
      '/sdk/reference/common-events': `${basePath}/dropins/all/events`,
      '/dropins/other/recommendations': `${basePath}/dropins/recommendations`,
      '/dropins/other/search': `${basePath}/dropins/product-discovery`,
      '/dropins/all/localizing': `${basePath}/dropins/all/labeling`,
      '/get-started/overview/': `${basePath}/get-started/`,
      '/merchants/storefront-builder/overview/': `${basePath}/merchants/storefront-builder/`,
      '/merchants/storefront-builder/create-your-content/': `${basePath}/merchants/storefront-builder/create-content/`,
    },

    integrations: [
      starlight({
        editLink: {
          baseUrl: 'https://github.com/commerce-docs/microsite-commerce-storefront/edit/develop/',
        },

        head: [
          // DNS prefetch for the site's own domain
          {
            tag: 'link',
            attrs: {
              rel: 'dns-prefetch',
              href: 'https://commerce-docs.github.io',
            },
          },
          // Preconnect to Adobe DTM for faster script loading
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://assets.adobedtm.com',
              crossorigin: 'anonymous',
            },
          },
          // DNS prefetch for Adobe DTM
          {
            tag: 'link',
            attrs: {
              rel: 'dns-prefetch',
              href: 'https://assets.adobedtm.com',
            },
          },
          // Using font-display: block for h1 font to prevent CLS (no preload needed)
          // Inline critical CSS for instant above-the-fold render on mobile
          {
            tag: 'style',
            content: `
              /* Critical mobile-first styles for instant LCP */
              @media (max-width:50rem){
                body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif}
                .page{display:flex;flex-direction:column;min-height:100vh}
                .hero{display:flex;justify-content:center;align-items:center;padding:1.5rem 1rem;width:100%}
                .hero .stack{flex-direction:column;gap:2rem;text-align:center;align-items:center}
                .hero h1{font-size:clamp(2.5rem,8vw,4rem);line-height:.95;font-weight:900;color:#1a1a1a;margin:0}
                .hero .tagline{font-size:clamp(1.125rem,2.5vw,1.5rem);line-height:1.6;color:#2a2a2a;font-weight:400}
                .hero .actions{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center}
                .action{display:inline-flex;padding:.75rem 1.25rem;border-radius:.5rem;text-decoration:none;font-weight:600;font-size:1rem}
                .action.primary{background:#0d47a1;color:#fff;border:1px solid rgba(255,255,255,.6)}
                .action.minimal{background:#6b21a8;color:#fff;border:1px solid rgba(255,255,255,.6)}
                .hero-splash::before{content:"";position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;background:linear-gradient(135deg,#dbeafe 0%,#fce7f3 50%,#ede9fe 100%)}
                html[data-theme="dark"] .hero h1{color:#fff !important}
                html[data-theme="dark"] .hero .tagline{color:#e8e8e8 !important}
                html[data-theme="dark"] .hero-splash::before{background:linear-gradient(135deg,hsl(240deg 90% 15%),hsl(280deg 80% 22%),hsl(320deg 70% 28%)) !important}
                html[data-theme="dark"] .action.primary{background:#0a3d91;color:#e8e8e8}
                html[data-theme="dark"] .action.minimal{background:#5c1c8f;color:#e8e8e8}
                .sl-link-card{display:grid;background-color:#9e9e9e24;border:1px solid rgba(255,255,255,.2);border-radius:.75rem;padding:1.25rem;opacity:1 !important;transform:none !important}
                .content-panel{padding:1rem 2rem}
              }
            `,
          },
          // Lazy-load Adobe Launch only in production to reduce main-thread work
          // and unused JS on initial load. Loads on idle or first interaction.
          {
            tag: 'script',
            content: `
              (function(){
                try {
                  var isProd = ${isProduction ? 'true' : 'false'};
                  if (!isProd) return;
                  var loaded = false;
                  function loadLaunch(){
                    if (loaded) return; loaded = true;
                    var s = document.createElement('script');
                    s.src = 'https://assets.adobedtm.com/d4d114c60e50/9f881954c8dc/launch-7a902c4895c3.min.js';
                    s.async = true;
                    document.head.appendChild(s);
                  }
                  if ('requestIdleCallback' in window) {
                    requestIdleCallback(loadLaunch, { timeout: 3000 });
                  } else {
                    setTimeout(loadLaunch, 2000);
                  }
                  ['pointerdown','keydown','scroll','touchstart'].forEach(function(evt){
                    window.addEventListener(evt, loadLaunch, { once: true, passive: true });
                  });
                } catch(e) { /* no-op */ }
              })();
            `,
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
          starlightSidebarTopics(
            [
              // ========= STORE FRONT DEVELOPERS =========
              {
                label: 'Storefront Developers',
                link: '/get-started/',
                icon: 'seti:json',
                items: [
                  {
                    label: 'Essentials',
                    collapsed: false,
                    items: [
                      { label: 'Overview', link: '/get-started/' },
                      { label: 'Create a storefront', link: '/get-started/create-storefront' },
                      { label: 'Learn the architecture', link: '/setup/discovery/architecture/' },
                      { label: 'Browser compatibility', link: '/get-started/browser-compatibility/' },
                      { label: 'Explore the boilerplate', link: '/get-started/boilerplate-project/' },
                      { label: 'Update the boilerplate', link: '/get-started/update-boilerplate/' },
                      { label: 'Run Lighthouse audits', link: '/get-started/run-lighthouse/' },
                    ],
                  },
                  {
                    label: 'Storefront setup',
                    collapsed: true,
                    items: [
                      {
                        label: 'Setup overview',
                        link: '/setup/',
                      },
                      {
                        label: 'Configuration',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/setup/configuration/' },
                          { label: 'Storefront configuration', link: '/setup/configuration/commerce-configuration/' },
                          { label: 'AEM Assets integration', link: '/setup/configuration/aem-assets-configuration/' },
                          { label: 'Content delivery network', link: '/setup/configuration/content-delivery-network/' },
                          { label: 'CORS setup', link: '/setup/configuration/cors-setup/' },
                          { label: 'CORS troubleshooting', link: '/setup/configuration/cors-troubleshooting/' },
                          { label: 'Gated content', link: '/setup/configuration/gated-content/' },
                          { label: 'Data export validation', link: '/setup/discovery/data-export-validation/' },
                        ],
                      },
                      {
                        label: 'Advanced setup',
                        collapsed: true,
                        items: [
                          { label: 'Multistore setup', link: '/setup/configuration/multistore-setup/' },
                          {
                            label: 'Luma Bridge',
                            collapsed: true,
                            items: [{ label: 'Introduction to Luma Bridge', link: '/setup/discovery/luma-bridge/' }],
                          },
                        ],
                      },
                      {
                        label: 'Compatibility package',
                        collapsed: true,
                        items: [
                          { label: 'Installation', link: '/setup/configuration/storefront-compatibility/install/' },
                          { label: 'Adobe Commerce 2.4.8', link: '/setup/configuration/storefront-compatibility/v248/' },
                          { label: 'Adobe Commerce 2.4.7', link: '/setup/configuration/storefront-compatibility/v247/' },
                        ],
                      },
                      {
                        label: 'Launch preparation',
                        collapsed: true,
                        items: [
                          { label: 'Analytics instrumentation', link: '/setup/analytics/instrumentation/' },
                          { label: 'Adobe Experience Platform', link: '/setup/analytics/adobe-experience-platform/' },
                          { label: 'SEO indexing', link: '/setup/seo/indexing/' },
                          { label: 'SEO metadata', link: '/setup/seo/metadata/' },
                          { label: 'Launch checklist', link: '/setup/launch/' },
                        ],
                      },
                    ]
                  },
                  // ---------- DROP-INS Overview ----------
                  {
                    label: 'Drop-ins overview',
                    collapsed: true,
                    items: [
                      { label: 'Overview', link: '/dropins/all/introduction/' },
                      { label: 'Extend or create?', link: '/dropins/all/extend-or-create/' },
                      { label: 'Installing', link: '/dropins/all/installing/' },
                      { label: 'Branding', link: '/dropins/all/branding/' },
                      { label: 'Styling', link: '/dropins/all/styling/' },
                      { label: 'Labeling', link: '/dropins/all/labeling/' },
                      { label: 'Dictionaries', link: '/dropins/all/dictionaries/' },
                      { label: 'Linking', link: '/dropins/all/linking/' },
                      { label: 'Slots', link: '/dropins/all/slots/' },
                      { label: 'Layouts', link: '/dropins/all/layouts/' },
                      { label: 'Events', link: '/dropins/all/events/' },
                      { label: 'Common events', link: '/dropins/all/common-events/' },
                      { label: 'Extending', link: '/dropins/all/extending/' },
                      { label: 'Creating', link: '/dropins/all/creating/' },
                    ],
                  },
                  // ---------- DROP-INS (B2C) ----------
                  {
                    label: 'Drop-ins',
                    collapsed: true,
                    items: [
                      {
                        label: 'Cart',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/cart/' },
                          { label: 'Installation', link: '/dropins/cart/installation/' },
                          { label: 'Initialization', link: '/dropins/cart/initialization/' },
                          { label: 'Styling', link: '/dropins/cart/styles/' },
                          { label: 'Slots', link: '/dropins/cart/slots/' },
                          { label: 'Functions', link: '/dropins/cart/functions/' },
                          { label: 'Events', link: '/dropins/cart/events/' },
                          { label: 'Dictionary', link: '/dropins/cart/dictionary/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/cart/containers/' },
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
                            ],
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
                            ],
                          },
                        ],
                      },
                      {
                        label: 'Checkout',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/checkout/' },
                          { label: 'Installation', link: '/dropins/checkout/installation/' },
                          { label: 'Initialization', link: '/dropins/checkout/initialization/' },
                          { label: 'Styling', link: '/dropins/checkout/styles/' },
                          { label: 'Extending', link: '/dropins/checkout/extending/' },
                          { label: 'Error handling', link: '/dropins/checkout/error-handling/' },
                          { label: 'Event handling', link: '/dropins/checkout/event-handling/' },
                          { label: 'Utility functions', link: '/dropins/checkout/utilities/' },
                          { label: 'Slots', link: '/dropins/checkout/slots/' },
                          { label: 'Functions', link: '/dropins/checkout/functions/' },
                          { label: 'Events', link: '/dropins/checkout/events/' },
                          { label: 'Dictionary', link: '/dropins/checkout/dictionary/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/checkout/containers/' },
                              { label: 'AddressValidation', link: '/dropins/checkout/containers/address-validation/' },
                              { label: 'BillToShippingAddress', link: '/dropins/checkout/containers/bill-to-shipping-address/' },
                              { label: 'EstimateShipping', link: '/dropins/checkout/containers/estimate-shipping/' },
                              { label: 'LoginForm', link: '/dropins/checkout/containers/login-form/' },
                              { label: 'MergedCartBanner', link: '/dropins/checkout/containers/merged-cart-banner/' },
                              { label: 'OutOfStock', link: '/dropins/checkout/containers/out-of-stock/' },
                              { label: 'PaymentMethods', link: '/dropins/checkout/containers/payment-methods/' },
                              { label: 'PlaceOrder', link: '/dropins/checkout/containers/place-order/' },
                              { label: 'ServerError', link: '/dropins/checkout/containers/server-error/' },
                              { label: 'ShippingMethods', link: '/dropins/checkout/containers/shipping-methods/' },
                              { label: 'TermsAndConditions', link: '/dropins/checkout/containers/terms-and-conditions/' },
                            ],
                          },
                          {
                            label: 'Tutorials',
                            collapsed: false,
                            items: [
                              { label: 'Add payment method', link: '/dropins/checkout/tutorials/add-payment-method/' },
                              { label: 'Address verification', link: '/dropins/checkout/tutorials/address-integration/' },
                              { label: 'Validate shipping address', link: '/dropins/checkout/tutorials/validate-shipping-address/' },
                              { label: 'Buy online, pickup in store', link: '/dropins/checkout/tutorials/buy-online-pickup-in-store/' },
                              { label: 'Multi-step checkout', link: '/dropins/checkout/tutorials/multi-step/' },
                            ],
                          },
                        ],
                      },
                      {
                        label: 'Order Management',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/order/' },
                          { label: 'Initialization', link: '/dropins/order/initialization/' },
                          { label: 'Styling', link: '/dropins/order/styles/' },
                          { label: 'Slots', link: '/dropins/order/slots/' },
                          { label: 'Functions', link: '/dropins/order/functions/' },
                          { label: 'Events', link: '/dropins/order/events/' },
                          { label: 'Dictionary', link: '/dropins/order/dictionary/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/order/containers/' },
                              { label: 'CreateReturn', link: '/dropins/order/containers/create-return/' },
                              { label: 'CustomerDetails', link: '/dropins/order/containers/customer-details/' },
                              { label: 'OrderCancelForm', link: '/dropins/order/containers/order-cancel-form/' },
                              { label: 'OrderCostSummary', link: '/dropins/order/containers/order-cost-summary/' },
                              { label: 'OrderProductList', link: '/dropins/order/containers/order-product-list/' },
                              { label: 'OrderReturns', link: '/dropins/order/containers/order-returns/' },
                              { label: 'OrderSearch', link: '/dropins/order/containers/order-search/' },
                              { label: 'ReturnsList', link: '/dropins/order/containers/returns-list/' },
                              { label: 'ShippingStatus', link: '/dropins/order/containers/shipping-status/' },
                            ],
                          },
                          {
                            label: 'Tutorials',
                            collapsed: false,
                            items: [{ label: 'Order cancellation tutorial', link: '/dropins/order/tutorials/order-cancellation/' }],
                          },
                        ],
                      },
                      {
                        label: 'Payment Services',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/payment-services/' },
                          { label: 'Installation', link: '/dropins/payment-services/installation/' },
                          { label: 'Initialization', link: '/dropins/payment-services/initialization/' },
                          { label: 'Functions', link: '/dropins/payment-services/functions/' },
                          { label: 'Slots', link: '/dropins/payment-services/slots/' },
                          { label: 'Dictionary', link: '/dropins/payment-services/dictionary/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/payment-services/containers/' },
                              { label: 'ApplePay', link: '/dropins/payment-services/containers/apple-pay/' },
                              { label: 'CreditCard', link: '/dropins/payment-services/containers/credit-card/' }
                            ],
                          },
                        ],
                      },
                      {
                        label: 'Personalization',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/personalization/' },
                          { label: 'Initialization', link: '/dropins/personalization/initialization/' },
                          { label: 'Events', link: '/dropins/personalization/events/' },
                          { label: 'Dictionary', link: '/dropins/personalization/dictionary/' },
                          { label: 'Functions', link: '/dropins/personalization/functions/' },
                          { label: 'Slots', link: '/dropins/personalization/slots/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/personalization/containers/' },
                              { label: 'TargetedBlock', link: '/dropins/personalization/containers/targeted-block/' }
                            ],
                          },
                        ],
                      },
                      {
                        label: 'Product details (PDP)',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/product-details/' },
                          { label: 'Installation', link: '/dropins/product-details/installation/' },
                          { label: 'Initialization', link: '/dropins/product-details/initialization/' },
                          { label: 'Styles', link: '/dropins/product-details/styles/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/product-details/containers/' },
                              { label: 'ProductAttributes', link: '/dropins/product-details/containers/product-attributes/' },
                              { label: 'ProductDescription', link: '/dropins/product-details/containers/product-description/' },
                              { label: 'ProductGallery', link: '/dropins/product-details/containers/product-gallery/' },
                              { label: 'ProductGiftCardOptions', link: '/dropins/product-details/containers/product-giftcard-options/' },
                              { label: 'ProductHeader', link: '/dropins/product-details/containers/product-header/' },
                              { label: 'ProductOptions', link: '/dropins/product-details/containers/product-options/' },
                              { label: 'ProductPrice', link: '/dropins/product-details/containers/product-price/' },
                              { label: 'ProductQuantity', link: '/dropins/product-details/containers/product-quantity/' },
                              { label: 'ProductShortDescription', link: '/dropins/product-details/containers/product-short-description/' },
                            ],
                          },
                          { label: 'Functions', link: '/dropins/product-details/functions/' },
                          { label: 'Slots', link: '/dropins/product-details/slots/' },
                          { label: 'Events', link: '/dropins/product-details/events/' },
                          { label: 'Dictionary', link: '/dropins/product-details/dictionary/' },
                        ],
                      },
                      {
                        label: 'Product Discovery',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/product-discovery/' },
                          { label: 'Installation', link: '/dropins/product-discovery/installation/' },
                          { label: 'Initialization', link: '/dropins/product-discovery/initialization/' },
                          { label: 'Styling', link: '/dropins/product-discovery/styles/' },
                          { label: 'Functions', link: '/dropins/product-discovery/functions/' },
                          { label: 'Events', link: '/dropins/product-discovery/events/' },
                          { label: 'Dictionary', link: '/dropins/product-discovery/dictionary/' },
                          { label: 'Slots', link: '/dropins/product-discovery/slots/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/product-discovery/containers/' },
                              { label: 'SearchResults', link: '/dropins/product-discovery/containers/search-results/' },
                              { label: 'Facets', link: '/dropins/product-discovery/containers/facets/' },
                              { label: 'SortBy', link: '/dropins/product-discovery/containers/sort-by/' },
                              { label: 'Pagination', link: '/dropins/product-discovery/containers/pagination/' },
                            ],
                          },
                        ],
                      },
                      {
                        label: 'Recommendations',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/recommendations/' },
                          { label: 'Installation', link: '/dropins/recommendations/installation/' },
                          { label: 'Initialization', link: '/dropins/recommendations/initialization/' },
                          { label: 'Styling', link: '/dropins/recommendations/styles/' },
                          { label: 'Functions', link: '/dropins/recommendations/functions/' },
                          { label: 'Events', link: '/dropins/recommendations/events/' },
                          { label: 'Dictionary', link: '/dropins/recommendations/dictionary/' },
                          { label: 'Slots', link: '/dropins/recommendations/slots/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/recommendations/containers/' },
                              { label: 'ProductList', link: '/dropins/recommendations/containers/product-list/' }
                            ],
                          },
                        ],
                      },
                      {
                        label: 'User Account',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/user-account/' },
                          { label: 'Initialization', link: '/dropins/user-account/initialization/' },
                          { label: 'Styling', link: '/dropins/user-account/styles/' },
                          { label: 'Functions', link: '/dropins/user-account/functions/' },
                          { label: 'Slots', link: '/dropins/user-account/slots/' },
                          { label: 'Events', link: '/dropins/user-account/events/' },
                          { label: 'Dictionary', link: '/dropins/user-account/dictionary/' },
                          { label: 'Sidebar', link: '/dropins/user-account/sidebar/' },
                          {
                            label: 'Tutorials',
                            collapsed: false,
                            items: [
                              { label: 'Customize layout', link: '/dropins/user-account/tutorials/customize-layout/' },
                              { label: 'Validate address', link: '/dropins/user-account/tutorials/validate-address/' },
                            ],
                          },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/user-account/containers/' },
                              { label: 'Addresses', link: '/dropins/user-account/containers/addresses/' },
                              { label: 'AddressForm', link: '/dropins/user-account/containers/address-form/' },
                              { label: 'AddressValidation', link: '/dropins/user-account/containers/address-validation/' },
                              { label: 'CustomerInformation', link: '/dropins/user-account/containers/customer-information/' },
                              { label: 'OrdersList', link: '/dropins/user-account/containers/orders-list/' },
                            ],
                          },
                        ],
                      },
                      {
                        label: 'User Authentication',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/user-auth/' },
                          { label: 'Installation', link: '/dropins/user-auth/installation/' },
                          { label: 'Initialization', link: '/dropins/user-auth/initialization/' },
                          { label: 'reCAPTCHA', link: '/dropins/user-auth/recaptcha/' },
                          { label: 'Slots', link: '/dropins/user-auth/slots/' },
                          { label: 'Events', link: '/dropins/user-auth/events/' },
                          { label: 'Functions', link: '/dropins/user-auth/functions/' },
                          { label: 'Dictionary', link: '/dropins/user-auth/dictionary/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/user-auth/containers/' },
                              { label: 'AuthCombine', link: '/dropins/user-auth/containers/auth-combine/' },
                              { label: 'ResetPassword', link: '/dropins/user-auth/containers/reset-password/' },
                              { label: 'SignIn', link: '/dropins/user-auth/containers/sign-in/' },
                              { label: 'SignUp', link: '/dropins/user-auth/containers/sign-up/' },
                              { label: 'SuccessNotification', link: '/dropins/user-auth/containers/success-notification/' },
                              { label: 'UpdatePassword', link: '/dropins/user-auth/containers/update-password/' },
                            ],
                          },
                        ],
                      },
                      {
                        label: 'Wishlist',
                        collapsed: true,
                        items: [
                          { label: 'Overview', link: '/dropins/wishlist/' },
                          { label: 'Installation', link: '/dropins/wishlist/installation/' },
                          { label: 'Initialization', link: '/dropins/wishlist/initialization/' },
                          { label: 'Functions', link: '/dropins/wishlist/functions/' },
                          { label: 'Slots', link: '/dropins/wishlist/slots/' },
                          { label: 'Events', link: '/dropins/wishlist/events/' },
                          { label: 'Dictionary', link: '/dropins/wishlist/dictionary/' },
                          { label: 'Styling', link: '/dropins/wishlist/styles/' },
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              { label: 'Overview', link: '/dropins/wishlist/containers/' },
                              { label: 'Wishlist Container', link: '/dropins/wishlist/containers/wishlist/' },
                              { label: 'WishlistAlert', link: '/dropins/wishlist/containers/wishlist-alert/' },
                              { label: 'WishlistItem', link: '/dropins/wishlist/containers/wishlist-item/' },
                              { label: 'WishlistToggle', link: '/dropins/wishlist/containers/wishlist-toggle/' },
                            ],
                          },
                        ],
                      },
                    ],
                  },

                  // ---------- DROP-INS (B2B) ----------
                  {
                    label: 'Drop-ins for B2B',
                    collapsed: true,
                    items: [
                      { label: 'Overview', link: '/dropins-b2b/overview/' },
                      {
                        label: 'Company Management',
                        collapsed: true,
                        items: [
                          { label: 'Events', link: '/dropins-b2b/company-management/events/' },
                        ],
                      },
                    ],
                  },

                  // ---------- DROP-INS SDK ----------
                  {
                    label: 'Drop-ins SDK',
                    collapsed: true,
                    items: [
                      { label: 'SDK introduction', link: '/sdk/' },
                      { label: 'SDK CLI usage', link: '/sdk/get-started/cli/' },
                      {
                        label: 'SDK components',
                        collapsed: true,
                        items: [
                          { label: 'Components overview', link: '/sdk/components/overview/' },
                          { label: 'Accordion', link: '/sdk/components/accordion/' },
                          { label: 'ActionButton', link: '/sdk/components/actionbutton/' },
                          { label: 'ActionButtonGroup', link: '/sdk/components/actionbuttongroup/' },
                          { label: 'AlertBanner', link: '/sdk/components/alertbanner/' },
                          { label: 'Breadcrumbs', link: '/sdk/components/breadcrumbs/' },
                          { label: 'Button', link: '/sdk/components/button/' },
                          { label: 'Card', link: '/sdk/components/card/' },
                          { label: 'CartItem', link: '/sdk/components/cartitem/' },
                          { label: 'CartList', link: '/sdk/components/cartlist/' },
                          { label: 'Checkbox', link: '/sdk/components/checkbox/' },
                          { label: 'ColorSwatch', link: '/sdk/components/colorswatch/' },
                          { label: 'ContentGrid', link: '/sdk/components/contentgrid/' },
                          { label: 'Divider', link: '/sdk/components/divider/' },
                          { label: 'Field', link: '/sdk/components/field/' },
                          { label: 'Header', link: '/sdk/components/header/' },
                          { label: 'Icon', link: '/sdk/components/icon/' },
                          { label: 'IllustratedMessage', link: '/sdk/components/illustratedmessage/' },
                          { label: 'Image', link: '/sdk/components/image/' },
                          { label: 'ImageSwatch', link: '/sdk/components/imageswatch/' },
                          { label: 'Incrementer', link: '/sdk/components/incrementer/' },
                          { label: 'InlineAlert', link: '/sdk/components/inlinealert/' },
                          { label: 'Input', link: '/sdk/components/input/' },
                          { label: 'InputDate', link: '/sdk/components/inputdate/' },
                          { label: 'InputFile', link: '/sdk/components/inputfile/' },
                          { label: 'InputPassword', link: '/sdk/components/inputpassword/' },
                          { label: 'Modal', link: '/sdk/components/modal/' },
                          { label: 'Pagination', link: '/sdk/components/pagination/' },
                          { label: 'Picker', link: '/sdk/components/picker/' },
                          { label: 'Portal', link: '/sdk/components/portal/' },
                          { label: 'Price', link: '/sdk/components/price/' },
                          { label: 'PriceRange', link: '/sdk/components/pricerange/' },
                          { label: 'ProductItemCard', link: '/sdk/components/productitemcard/' },
                          { label: 'ProgressSpinner', link: '/sdk/components/progressspinner/' },
                          { label: 'RadioButton', link: '/sdk/components/radiobutton/' },
                          { label: 'Skeleton', link: '/sdk/components/skeleton/' },
                          { label: 'Tag', link: '/sdk/components/tag/' },
                          { label: 'TextArea', link: '/sdk/components/textarea/' },
                          { label: 'TextSwatch', link: '/sdk/components/textswatch/' },
                          { label: 'ToggleButton', link: '/sdk/components/togglebutton/' },
                        ],
                      },
                      {
                        label: 'SDK design',
                        collapsed: true,
                        items: [
                          { label: 'Design overview', link: '/sdk/design/' },
                          { label: 'Design tokens', link: '/sdk/design/base/' },
                          { label: 'Colors', link: '/sdk/design/colors/' },
                          { label: 'Typography', link: '/sdk/design/typography/' },
                          { label: 'Spacing', link: '/sdk/design/spacing/' },
                          { label: 'Shapes', link: '/sdk/design/shapes/' },
                          { label: 'Grid', link: '/sdk/design/grid/' },
                        ],
                      },
                      {
                        label: 'SDK reference',
                        collapsed: true,
                        items: [
                          { label: 'Reference overview', link: '/sdk/reference/' },
                          { label: 'Events', link: '/sdk/reference/events/' },
                          { label: 'GraphQL', link: '/sdk/reference/graphql/' },
                          { label: 'Initializer', link: '/sdk/reference/initializer/' },
                          { label: 'Links', link: '/sdk/reference/links/' },
                          { label: 'Render', link: '/sdk/reference/render/' },
                          { label: 'reCAPTCHA', link: '/sdk/reference/recaptcha/' },
                          { label: 'Slots', link: '/sdk/reference/slots/' },
                          { label: 'VComponent', link: '/sdk/reference/vcomponent/' },
                        ],
                      },
                      {
                        label: 'SDK utilities',
                        collapsed: true,
                        items: [
                          { label: 'Utilities overview', link: '/sdk/utilities/' },
                          { label: 'classList', link: '/sdk/utilities/classlist/' },
                          { label: 'debounce', link: '/sdk/utilities/debounce/' },
                          { label: 'deepmerge', link: '/sdk/utilities/deepmerge/' },
                          { label: 'getCookie', link: '/sdk/utilities/getcookie/' },
                          { label: 'getFormErrors', link: '/sdk/utilities/getformerrors/' },
                          { label: 'getFormValues', link: '/sdk/utilities/getformvalues/' },
                          { label: 'getPathValue', link: '/sdk/utilities/getpathvalue/' },
                        ],
                      },
                    ],
                  },

                  // ---------- OTHER ----------
                  {
                    label: 'Boilerplate',
                    collapsed: true,
                    items: [
                      { label: 'Overview', link: '/boilerplate/' },
                      { label: 'Structure', link: '/boilerplate/structure/' },
                      { label: 'Build Process', link: '/boilerplate/build-process/' },
                      { label: 'Configuration', link: '/boilerplate/configuration/' },
                      {
                        label: 'Blocks',
                        collapsed: true,
                        autogenerate: { directory: '/boilerplate/blocks/' },
                      },
                    ],
                  },
                  {
                    label: 'Troubleshooting',
                    collapsed: true,
                    autogenerate: { directory: '/troubleshooting/' },
                  },
                  {
                    label: 'Resources',
                    collapsed: true,
                    autogenerate: { directory: '/resources/' },
                  },
                ],
              },

              // ========= STOREFRONT AUTHORS =========
              {
                label: 'Storefront Authors',
                link: '/merchants/storefront-builder/',
                icon: 'seti:svg',
                items: [
                  {
                    label: 'Quick start',
                    items: [
                      { label: 'Overview', link: '/merchants/quick-start/' },
                      { label: 'Your first page', link: '/merchants/quick-start/your-first-page/' },
                      { label: 'What is Commerce Storefront?', link: '/merchants/quick-start/create-content/' },
                      { label: 'Using the Document Authoring tool', link: '/merchants/quick-start/document-authoring/' },
                      { label: 'Using the Visual Editor', link: '/merchants/quick-start/visual-editor/' },
                      // { label: 'Using digital assets management', link: '/merchants/quick-start/digital-assets-management/' },
                      { label: 'Using Content and Commerce blocks', link: '/merchants/quick-start/content-commerce-blocks/' },
                      { label: 'Page metadata', link: '/merchants/quick-start/page-metadata/' },
                      { label: 'Section metadata', link: '/merchants/quick-start/section-metadata/' },
                    ],
                  },
                  {
                    label: 'Commerce blocks',
                    items: [
                      { label: 'Overview', link: '/merchants/commerce-blocks/' },
                      { label: 'Personalization', link: '/merchants/commerce-blocks/personalization/' },
                      { label: 'Product recommendations', link: '/merchants/commerce-blocks/product-recommendations/' },
                      { label: 'Commerce Account Header', link: '/merchants/blocks/commerce-account-header/' },
                      { label: 'Commerce Account Sidebar', link: '/merchants/blocks/commerce-account-sidebar/' },
                      { label: 'Commerce Addresses', link: '/merchants/blocks/commerce-addresses/' },
                      { label: 'Commerce Cart', link: '/merchants/blocks/commerce-cart/' },
                      { label: 'Commerce Checkout', link: '/merchants/blocks/commerce-checkout/' },
                      { label: 'Commerce Confirm Account', link: '/merchants/blocks/commerce-confirm-account/' },
                      { label: 'Commerce Create Account', link: '/merchants/blocks/commerce-create-account/' },
                      { label: 'Commerce Create Password', link: '/merchants/blocks/commerce-create-password/' },
                      { label: 'Commerce Create Return', link: '/merchants/blocks/commerce-create-return/' },
                      { label: 'Commerce Customer Details', link: '/merchants/blocks/commerce-customer-details/' },
                      { label: 'Commerce Customer Information', link: '/merchants/blocks/commerce-customer-information/' },
                      { label: 'Commerce Forgot Password', link: '/merchants/blocks/commerce-forgot-password/' },
                      { label: 'Commerce Gift Options', link: '/merchants/blocks/commerce-gift-options/' },
                      { label: 'Commerce Login', link: '/merchants/blocks/commerce-login/' },
                      { label: 'Commerce Mini Cart', link: '/merchants/blocks/commerce-mini-cart/' },
                      { label: 'Commerce Order Cost Summary', link: '/merchants/blocks/commerce-order-cost-summary/' },
                      { label: 'Commerce Order Header', link: '/merchants/blocks/commerce-order-header/' },
                      { label: 'Commerce Order Product List', link: '/merchants/blocks/commerce-order-product-list/' },
                      { label: 'Commerce Order Returns', link: '/merchants/blocks/commerce-order-returns/' },
                      { label: 'Commerce Order Status', link: '/merchants/blocks/commerce-order-status/' },
                      { label: 'Commerce Orders List', link: '/merchants/blocks/commerce-orders-list/' },
                      { label: 'Commerce Return Header', link: '/merchants/blocks/commerce-return-header/' },
                      { label: 'Commerce Returns List', link: '/merchants/blocks/commerce-returns-list/' },
                      { label: 'Commerce Search Order', link: '/merchants/blocks/commerce-search-order/' },
                      { label: 'Commerce Shipping Status', link: '/merchants/blocks/commerce-shipping-status/' },
                      { label: 'Commerce Wishlist', link: '/merchants/blocks/commerce-wishlist/' },
                      { label: 'Product Details', link: '/merchants/blocks/product-details/' },
                      { label: 'Product List Page', link: '/merchants/blocks/product-list-page/' },
                      { label: 'Product Recommendations', link: '/merchants/blocks/product-recommendations/' },
                    ],
                  },
                  {
                    label: 'Content customizations',
                    items: [
                      { label: 'Overview', link: '/merchants/content-customizations/' },
                      { label: 'Enrichment', link: '/merchants/content-customizations/enrichment/' },
                      { label: 'Experiments', link: '/merchants/content-customizations/experiments/' },
                      { label: 'Terms and conditions', link: '/merchants/content-customizations/terms-and-conditions/' },
                    ],
                  },
                  {
                    label: 'Multistore',
                    items: [
                      { label: 'Setup', link: '/merchants/multistore/' },
                      { label: 'Localization', link: '/merchants/multistore/content-localization/' },
                    ],
                  },
                ],
              },

              // ========= VIDEOS =========
              {
                label: 'Videos',
                link: '/videos/',
                icon: 'seti:video',
                items: [
                  {
                    label: 'Storefront videos',
                    items: [
                      { label: 'Overview', link: '/videos/' },
                      { label: 'Add custom product lines to cart summary', link: '/videos/add-product-lines-to-cart-summary/' },
                      { label: 'Buy online, pickup in store', link: '/videos/buy-online-pickup-in-store/' },
                      { label: 'Customize address form layout and address lookup', link: '/videos/customize-address-form-layout/' },
                      { label: 'Customize cart summary', link: '/videos/customize-cart-summary/' },
                      { label: 'Customize order summary lines', link: '/videos/customize-order-summary-lines/' },
                      { label: 'Multi-step checkout', link: '/videos/multi-step-checkout/' },
                      { label: 'Shopper experience', link: '/videos/shopper-experience/' },
                    ],
                  },
                ],
              },

              // ========= PLAYGROUNDS =========
              {
                label: 'Playgrounds',
                link: '/playgrounds/',
                icon: 'laptop',
                items: [
                  {
                    label: 'Storefront playgrounds',
                    items: [
                      { label: 'Introduction', link: '/playgrounds/' },
                      { label: 'Commerce API Playground', link: '/playgrounds/commerce-services/' },
                      { label: 'Commerce Optimizer API Playground', link: '/playgrounds/commerce-optimizer/' },
                    ],
                  },
                ],
              },

              // ========= RELEASES =========
              {
                label: 'Releases',
                link: '/releases/',
                icon: 'rocket',
                collapsed: true,
                items: [
                  {
                    label: 'Release notes',
                    items: [
                      { label: 'Overview', link: '/releases/' },
                      { label: 'Changelog', link: '/releases/changelog/' },
                    ],
                  },
                  {
                    label: 'Hotfixes',
                    items: [
                      { label: 'Centralized FetchGraphQL', link: '/releases/hotfixes/centralized-fetchgraphql/' },
                    ],
                  },
                ],
              },
            ],
            {
              exclude: ['/sdk/**', '/videos/**', '/dropins-b2b/**'],
            }
          ),
          starlightHeadingBadges(),
          starlightLinksValidator({
            errorOnFallbackPages: false,
            errorOnInconsistentLocale: true,
          }),
          starlightImageZoom({ showCaptions: false }),
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
          replacesTitle: false,
        },

        social: [
          { icon: 'github', label: 'GitHub', href: 'https://github.com/commerce-docs/microsite-commerce-storefront/tree/develop' },
          { icon: 'discord', label: 'Discord', href: 'https://discord.com/channels/1131492224371277874/1220042081209421945' },
        ],
      }),

      // Optional compression (skip with SKIP_COMPRESSION=true)
      ...(!skipCompression ? [compressIntegration] : []),

      react(),
    ],

    vite: {
      build: {
        chunkSizeWarningLimit: 1000, // Increase limit to 1MB to reduce noise
        rollupOptions: {
          onwarn(warning, warn) {
            // Suppress warnings about unused imports from expressive-code packages
            if (warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
              warning.source &&
              (warning.source.includes('@expressive-code/') ||
                warning.source.includes('expressive-code'))) {
              return;
            }
            warn(warning);
          }
        }
      },
      logLevel: 'warn',
      customLogger: {
        warn(msg, options) {
          // Suppress specific expressive-code warnings
          if (msg.includes('@expressive-code/plugin-text-markers') &&
            msg.includes('never used')) {
            return;
          }
          console.warn(msg, options);
        }
      }
    }
  });
}

export default config();
