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
      '/merchants/get-started/multistore': `${basePath}/merchants/multistore`,
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
                      { label: 'Overview', link: '/merchants/storefront-builder/' },
                      { label: 'Create your content', link: '/merchants/storefront-builder/create-content/' },
                      { label: 'Using the Document Authoring tool', link: '/merchants/storefront-builder/document-authoring/' },
                      { label: 'Using the Visual Editor', link: '/merchants/storefront-builder/visual-editor/' },
                      // { label: 'Using digital assets management', link: '/merchants/storefront-builder/digital-assets-management/' },
                      { label: 'Using Content and Commerce blocks', link: '/merchants/storefront-builder/content-commerce-blocks/' },
                      { label: 'Page metadata', link: '/merchants/storefront-builder/page-metadata/' },
                      { label: 'Section metadata', link: '/merchants/storefront-builder/section-metadata/' },
                    ],
                  },
                  {
                    label: 'Commerce blocks',
                    items: [
                      { label: 'Overview', link: '/merchants/storefront-builder/commerce-blocks/' },
                      { label: 'Personalization', link: '/merchants/get-started/personalization/' },
                      { label: 'Product recommendations', link: '/merchants/get-started/product-recommendations/' },
                    ],
                  },
                  {
                    label: 'Content customizations',
                    items: [
                      { label: 'Overview', link: '/merchants/get-started/' },
                      { label: 'Enrichment', link: '/merchants/get-started/enrichment/' },
                      { label: 'Experiments', link: '/merchants/get-started/experiments/' },
                      { label: 'Terms and conditions', link: '/merchants/get-started/terms-and-conditions/' },
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
              exclude: ['/sdk/**', '/videos/**', '/dropins-b2b/**', '/boilerplate/**'],
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
