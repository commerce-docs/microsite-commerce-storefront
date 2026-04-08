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
import { generateRedirects } from './astro.redirects.mjs';
import { generateSidebar } from './astro.sidebar.mjs';

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
/** @returns {Promise<import('astro').AstroUserConfig>} */
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
      shikiConfig: { theme: 'css-variables' },
    },
    trailingSlash: 'ignore',
    outDir: './dist',
    build: {
      inlineStylesheets: 'always',
    },

    redirects: generateRedirects(basePath),

    integrations: [
      starlight({
        editLink: {
          baseUrl: 'https://github.com/commerce-docs/microsite-commerce-storefront/edit/release/',
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
            generateSidebar(),
            {
              exclude: ['/sdk/**', '/videos/**', '/dropins-b2b/**', '/merchants/storefront-builder/**', '/merchants/edge-delivery-services/**', '/dropins/product-details/tutorials/**', '/get-started/howitallworks/**'],
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
          MarkdownContent: './src/components/overrides/MarkdownContent.astro',
        },

        pagefind: {
          ranking: {
            // Reduce term saturation so pages with many incidental mentions of a
            // term don't outrank pages whose *title* matches the query.
            // Starlight's default is 2 (maximum); 1.4 is Pagefind's own default.
            termSaturation: 2.0,
          },
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
          { icon: 'github', label: 'GitHub', href: 'https://github.com/commerce-docs/microsite-commerce-storefront/tree/release' },
          { icon: 'discord', label: 'Discord', href: 'https://discord.com/channels/1131492224371277874/1220042081209421945' },
        ],
      }),

      // Optional compression (skip with SKIP_COMPRESSION=true)
      ...(!skipCompression ? [compressIntegration] : []),

      react(),
    ],

    vite: {
      plugins: [
        {
          // Patch the Vite logger after config is resolved so the filter applies
          // to all logging paths, including environment-level loggers in Vite 6+.
          name: 'suppress-known-build-warnings',
          configResolved(resolvedConfig) {
            const isKnownSafe = (msg) =>
              typeof msg === 'string' && (
                // Public SVG assets used in CSS url() — resolved correctly by the browser
                // at runtime even though Vite can't resolve them at build time.
                (msg.includes("didn't resolve at build time") && (
                  msg.includes('hero-bg-light.svg') ||
                  msg.includes('hero-bg-dark.svg')
                )) ||
                // Empty chunk from starlight-heading-badges — deduplication artifact.
                (msg.includes('empty chunk') && msg.includes('HeadingBadgesTableOfContents')) ||
                // Unused import noise from expressive-code packages.
                (msg.includes('@expressive-code/plugin-text-markers') && msg.includes('never used'))
              );

            const patchLogger = (logger) => {
              if (!logger) return;
              for (const method of ['warn', 'warnOnce']) {
                const original = logger[method]?.bind(logger);
                if (original) {
                  logger[method] = (msg, opts) => { if (!isKnownSafe(msg)) original(msg, opts); };
                }
              }
            };

            // Patch the root logger.
            patchLogger(resolvedConfig.logger);
            // Patch each environment logger (Vite 6+). Environment-level loggers are
            // separate instances; the CSS url() resolution warning is emitted via
            // environment.logger, so the root logger patch alone may not catch it.
            if (resolvedConfig.environments) {
              for (const env of Object.values(resolvedConfig.environments)) {
                patchLogger(env.logger);
              }
            }
          },
        },
      ],
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
            // Suppress empty chunk warning from starlight-heading-badges plugin — the
            // starlight-toc custom element it re-registers is deduplicated by Rollup.
            if (warning.code === 'EMPTY_BUNDLE' &&
              warning.names?.some((n) => n.includes('HeadingBadgesTableOfContents'))) {
              return;
            }
            warn(warning);
          }
        }
      },
      logLevel: 'warn',
    }
  });
}

export default config();
