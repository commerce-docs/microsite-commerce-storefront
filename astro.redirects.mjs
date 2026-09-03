/**
 * Site-wide redirects configuration
 *
 * This file maintains all URL redirects for the Adobe Commerce Storefront documentation.
 * Redirects are organized by category for easier maintenance.
 *
 * @returns {Object} Redirects object keyed by old path, valued by new path
 */

/**
 * Generate redirects with base path prefix
 * @param {string} basePath - The base path to prefix redirects with
 * @returns {Object} Complete redirects object
 */
export function generateRedirects(basePath) {
    return {
        // ========= CUSTOMIZE REDIRECTS =========
        '/customize/design-tokens': `${basePath}/dropins/all/branding`,
        '/customize/enrich': `${basePath}/dropins/all/enriching`,
        '/customize/localize': `${basePath}/dropins/all/localizing`,
        '/customize/slots': `${basePath}/dropins/all/extending`,
        '/customize/style': `${basePath}/dropins/all/styling`,
        '/customize': `${basePath}/dropins/all/introduction`,

        // Legacy /dropins/customize/* URLs (same targets as /customize/*; crawlers still hit the old paths)
        '/dropins/customize/design-tokens': `${basePath}/dropins/all/branding`,
        '/dropins/customize/enrich': `${basePath}/dropins/all/enriching`,
        '/dropins/customize/localize': `${basePath}/dropins/all/localizing`,
        '/dropins/customize/slots': `${basePath}/dropins/all/extending`,
        '/dropins/customize/style': `${basePath}/dropins/all/styling`,
        '/dropins/customize': `${basePath}/dropins/all/introduction`,

        // Cart container slug alias
        '/dropins/cart/containers/minicart': `${basePath}/dropins/cart/containers/mini-cart`,

        // Legacy PDP paths under /dropins/product-details/pdp-* (older site map and bookmarks)
        '/dropins/product-details/pdp-containers': `${basePath}/dropins/product-details/containers`,
        '/dropins/product-details/pdp-functions': `${basePath}/dropins/product-details/functions`,
        '/dropins/product-details/pdp-initialization': `${basePath}/dropins/product-details/initialization`,
        '/dropins/product-details/pdp-installation': `${basePath}/dropins/product-details/quick-start`,
        '/dropins/product-details/pdp-slots': `${basePath}/dropins/product-details/slots`,
        '/dropins/product-details/pdp-styles': `${basePath}/dropins/product-details/styles`,

        // Other legacy doc paths from crawlers and old bookmarks
        '/dropins/user-account/tutorials': `${basePath}/dropins/user-account/`,
        '/dropins/user-auth/auth-functions': `${basePath}/dropins/user-auth/functions`,
        '/dropins/b2b/overview': `${basePath}/dropins-b2b/`,
        '/dropins/checkout/containers/order-confirmation-header': `${basePath}/dropins/checkout/`,
        '/dropins/checkout/containers/overview': `${basePath}/dropins/checkout/containers/`,
        '/merchant/terms-and-conditions': `${basePath}/merchants/content-customizations/terms-and-conditions`,
        '/superstar': `${basePath}/`,

        // ========= DROP-INS REDIRECTS =========
        '/dropins/all/installing': `${basePath}/dropins/all/quick-start`,
        '/dropins/all/anatomy': `${basePath}/dropins/all/introduction`,
        '/dropins/all/enriching': `${basePath}/merchants/get-started/enrichment`,
        '/dropins/all/experimenting': `${basePath}/merchants/get-started/experiments`,
        '/dropins/all/localizing': `${basePath}/dropins/all/labeling`,
        '/dropins/all/eventbus': `${basePath}/dropins/all/events`,

        // Cart drop-in
        '/dropins/cart/cart-introduction': `${basePath}/dropins/cart`,
        '/dropins/cart/cart-installation': `${basePath}/dropins/cart/quick-start`,
        '/dropins/cart/cart-styles': `${basePath}/dropins/cart/styles`,
        '/dropins/cart/cart-containers': `${basePath}/dropins/cart/containers`,
        '/dropins/cart/cart-slots': `${basePath}/dropins/cart/slots`,
        '/dropins/cart/cart-functions': `${basePath}/dropins/cart/functions`,
        '/dropins/cart/cart-dictionary': `${basePath}/dropins/cart/dictionary`,
        '/dropins/cart/installation': `${basePath}/dropins/cart/quick-start`,

        // Cart tutorials
        '/dropins/cart/tutorials/add-inline-messages-to-mini-cart': `${basePath}/dropins/cart/tutorials/add-messages-to-mini-cart`,
        '/dropins/cart/tutorials/add-overlay-messages-to-mini-cart': `${basePath}/dropins/cart/tutorials/add-messages-to-mini-cart`,

        // Checkout drop-in
        '/dropins/checkout/checkout-introduction': `${basePath}/dropins/checkout`,
        '/dropins/checkout/installation': `${basePath}/dropins/checkout/quick-start`,

        // Order drop-in
        '/dropins/order/order-dictionary': `${basePath}/dropins/order/dictionary`,
        '/dropins/order/installation': `${basePath}/dropins/order/quick-start`,

        // Product Details drop-in
        '/product-details/pdp-containers': `${basePath}/dropins/product-details/containers`,
        '/product-details/pdp-functions': `${basePath}/dropins/product-details/functions`,
        '/product-details/pdp-initialization': `${basePath}/dropins/product-details/initialization`,
        '/product-details/pdp-installation': `${basePath}/dropins/product-details/quick-start`,
        '/product-details/pdp-introduction': `${basePath}/dropins/product-details/`,
        '/product-details/pdp-slots': `${basePath}/dropins/product-details/slots`,
        '/product-details/pdp-styles': `${basePath}/dropins/product-details/styles`,
        '/dropins/product-details/installation': `${basePath}/dropins/product-details/quick-start`,

        // Product Discovery drop-in
        '/dropins/product-discovery/containers/product-list': `${basePath}/dropins/product-discovery/containers/search-results`,
        '/dropins/product-discovery/containers/results-info': `${basePath}/dropins/product-discovery/containers/pagination`,
        '/dropins/product-discovery/containers/search-bar-input': `${basePath}/dropins/product-discovery`,
        '/dropins/product-discovery/containers/search-bar-results': `${basePath}/dropins/product-discovery`,
        '/dropins/product-discovery/installation': `${basePath}/dropins/product-discovery/quick-start`,

        // Other drop-ins
        '/dropins/personalization/installation': `${basePath}/dropins/personalization/quick-start`,
        '/dropins/recommendations/installation': `${basePath}/dropins/recommendations/quick-start`,
        '/dropins/user-account/useraccount-introduction': `${basePath}/dropins/user-account`,
        '/dropins/user-account/installation': `${basePath}/dropins/user-account/quick-start`,
        '/dropins/user-auth/userauth-introduction': `${basePath}/dropins/user-auth`,
        '/dropins/user-auth/installation': `${basePath}/dropins/user-auth/quick-start`,
        '/dropins/wishlist/installation': `${basePath}/dropins/wishlist/quick-start`,

        // Drop-in category redirects
        '/dropins/other/recommendations': `${basePath}/dropins/recommendations`,
        '/dropins/other/search': `${basePath}/dropins/product-discovery`,

        // ========= GET STARTED REDIRECTS =========
        '/get-started/launch-checklist': `${basePath}/launch`,
        '/get-started/requirements': `${basePath}/get-started/architecture`,
        '/get-started/boilerplate-project': `${basePath}/boilerplate`,
        '/get-started/working-with-boilerplate': `${basePath}/boilerplate`,
        '/get-started/update-boilerplate': `${basePath}/boilerplate/updates`,
        '/get-started/configurations': `${basePath}/setup/configuration/commerce-configuration`,
        '/get-started/release': `${basePath}/releases/`,
        '/get-started/run-lighthouse': `${basePath}/get-started/performance`,
        '/get-started/overview/': `${basePath}/get-started/`,
        '/get-started/seo': `${basePath}/setup/seo/`,
        '/get-started/seo/': `${basePath}/setup/seo/`,
        '/get-started/dropins-mcp': `${basePath}/ai/`,

        // ========= BOILERPLATE REDIRECTS =========
        '/boilerplate/getting-started': `${basePath}/boilerplate`,
        '/boilerplate/working-with-boilerplate': `${basePath}/boilerplate`,
        '/boilerplate/update-boilerplate': `${basePath}/boilerplate/updates`,
        '/boilerplate/blocks': `${basePath}/blocks`,
        '/dropins/all/commerce-blocks': `${basePath}/blocks`,

        // Blocks folder consolidation (blocks physically moved into src/content/docs/blocks/)
        '/get-started/architecture/blocks-and-repo': `${basePath}/blocks/blocks-and-dropins`,
        '/boilerplate/blocks-reference': `${basePath}/blocks`,
        '/dropins/all/layouts': `${basePath}/blocks/arrange-block-layouts`,
        '/dropins/all/build-custom-features': `${basePath}/blocks/build-custom-features`,
        '/boilerplate/create-commerce-blocks': `${basePath}/blocks/create-commerce-blocks`,
        '/boilerplate/customizing-blocks': `${basePath}/blocks/customize-blocks`,
        '/boilerplate/universal-editor': `${basePath}/blocks/universal-editor`,

        // ========= SETUP & CONFIG REDIRECTS =========
        '/config': `${basePath}/setup/configuration/commerce-configuration`,
        '/config/commerce-configuration': `${basePath}/setup/configuration/commerce-configuration`,
        '/config/content-delivery-network': `${basePath}/setup/configuration/content-delivery-network`,
        '/config/gated-content': `${basePath}/setup/configuration/gated-content`,
        '/config/storefront-compatibility': `${basePath}/setup/configuration/storefront-compatibility`,
        '/boilerplate/configuration': `${basePath}/setup/configuration/commerce-configuration`,
        '/boilerplate/configuration/': `${basePath}/setup/configuration/commerce-configuration`,
        '/setup/configuration/storefront-compatibility/v247': `${basePath}/reference/storefront-compatibility/v247`,
        '/setup/configuration/storefront-compatibility/v247/': `${basePath}/reference/storefront-compatibility/v247`,
        '/setup/configuration/storefront-compatibility/v248': `${basePath}/reference/storefront-compatibility/v248`,
        '/setup/configuration/storefront-compatibility/v248/': `${basePath}/reference/storefront-compatibility/v248`,
        '/resources/v247': `${basePath}/reference/storefront-compatibility/v247`,
        '/resources/v247/': `${basePath}/reference/storefront-compatibility/v247`,
        '/resources/v248': `${basePath}/reference/storefront-compatibility/v248`,
        '/resources/v248/': `${basePath}/reference/storefront-compatibility/v248`,
        '/setup/configuration/storefront-compatibility-b2b': `${basePath}/setup/configuration/storefront-compatibility/b2b`,
        '/setup/configuration/storefront-compatibility-b2b/': `${basePath}/setup/configuration/storefront-compatibility/b2b`,
        '/setup/discovery/architecture': `${basePath}/get-started/architecture`,
        '/setup/multistore': `${basePath}/setup/configuration/multistore-setup`,
        '/activate': `${basePath}/setup`,
        '/discovery': `${basePath}/setup`,
        '/discovery/architecture': `${basePath}/get-started/architecture`,
        '/discovery/data-export-validation': `${basePath}/setup/discovery/data-export-validation`,
        '/discovery/luma-bridge': `${basePath}/setup/discovery/luma-bridge`,

        // ========= ANALYTICS & LAUNCH REDIRECTS =========
        '/analytics/instrumentation': `${basePath}/setup/analytics/instrumentation`,
        '/launch': `${basePath}/setup/launch`,

        // ========= SEO REDIRECTS =========
        '/seo/indexing': `${basePath}/setup/seo/indexing`,
        '/seo/metadata': `${basePath}/setup/seo/metadata`,

        // ========= SDK REDIRECTS =========
        '/sdk/get-started/create-a-dropin': `${basePath}/dropins/all/creating`,
        '/sdk/get-started': `${basePath}/sdk/get-started/cli`,
        '/sdk/reference/initialize': `${basePath}/sdk/reference/initializer`,
        '/sdk/reference/common-events': `${basePath}/dropins/all/events`,

        // ========= MERCHANT REDIRECTS =========
        // Quick start redirects (storefront-builder → quick-start)
        '/merchants/get-started/': `${basePath}/merchants/quick-start`,
        '/merchants/storefront-builder/create-content': `${basePath}/merchants/quick-start/create-content`,
        '/merchants/storefront-builder/document-authoring': `${basePath}/merchants/quick-start/document-authoring`,
        '/merchants/storefront-builder/visual-editor': `${basePath}/merchants/quick-start/universal-editor`,
        '/merchants/storefront-builder/content-commerce-blocks': `${basePath}/merchants/quick-start/content-commerce-blocks`,
        '/merchants/storefront-builder/page-metadata': `${basePath}/merchants/quick-start/page-metadata`,
        '/merchants/storefront-builder/page-metadata/': `${basePath}/merchants/quick-start/page-metadata`,
        '/merchants/storefront-builder/section-metadata': `${basePath}/merchants/quick-start/section-metadata`,
        '/merchants/storefront-builder/section-metadata/': `${basePath}/merchants/quick-start/section-metadata`,
        '/merchants/storefront-builder/your-first-page': `${basePath}/merchants/quick-start/your-first-page`,
        '/merchants/storefront-builder/overview/': `${basePath}/merchants/storefront-builder/`,
        '/merchants/storefront-builder/create-your-content/': `${basePath}/merchants/storefront-builder/create-content/`,

        // Commerce blocks redirects (storefront-builder → blocks)
        '/merchants/storefront-builder/': `${basePath}/merchants/blocks`,
        '/merchants/storefront-builder/personalization': `${basePath}/merchants/content-customizations/personalization`,
        '/merchants/storefront-builder/product-recommendations': `${basePath}/merchants/content-customizations/product-recommendations`,
        '/merchants/get-started/personalization': `${basePath}/merchants/content-customizations/personalization`,
        '/merchants/get-started/product-recommendations': `${basePath}/merchants/content-customizations/product-recommendations`,

        // Commerce blocks folder consolidation redirects (commerce-blocks → blocks)
        '/merchants/commerce-blocks': `${basePath}/merchants/blocks`,
        '/merchants/commerce-blocks/personalization': `${basePath}/merchants/content-customizations/personalization`,
        '/merchants/commerce-blocks/product-recommendations': `${basePath}/merchants/content-customizations/product-recommendations`,

        // Personalization and Product Recommendations setup guides (blocks → content-customizations)
        '/merchants/blocks/personalization': `${basePath}/merchants/content-customizations/personalization`,
        '/merchants/blocks/personalization/': `${basePath}/merchants/content-customizations/personalization`,
        '/merchants/blocks/product-recommendations': `${basePath}/merchants/content-customizations/product-recommendations`,
        '/merchants/blocks/product-recommendations/': `${basePath}/merchants/content-customizations/product-recommendations`,

        // Legacy unified index redirects (blocks → b2c for B2C users, blocks → b2b for B2B users)
        // Note: Main /merchants/blocks/ now serves as a landing page with links to both B2C and B2B

        // Content customizations redirects (get-started → content-customizations)
        '/merchants/get-started/content-customizations': `${basePath}/merchants/content-customizations`,
        '/merchants/get-started/enrichment': `${basePath}/merchants/content-customizations/enrichment`,
        '/merchants/get-started/experiments': `${basePath}/merchants/content-customizations/experiments`,
        '/merchants/get-started/terms-and-conditions': `${basePath}/merchants/content-customizations/terms-and-conditions`,
        '/merchants/terms-and-conditions': `${basePath}/merchants/get-started/terms-and-conditions`,
        // IA moved prerendered PDP docs out of get-started; old paths still appear in Search Console
        '/merchants/get-started/prerendered-product-pages': `${basePath}/merchants/content-customizations/prerendered-product-pages`,
        '/merchants/get-started/prerendered-product-pages/': `${basePath}/merchants/content-customizations/prerendered-product-pages/`,

        // Multistore redirects
        '/merchants/get-started/multistore': `${basePath}/setup/configuration/multistore-setup`,
        '/merchants/multistore': `${basePath}/setup/configuration/multistore-setup`,

        // Localization redirects
        '/merchants/get-started/localization': `${basePath}/merchants/quick-start/content-localization`,
        '/merchants/multistore/commerce-localization': `${basePath}/merchants/quick-start/content-localization`,
        '/merchants/multistore/localization': `${basePath}/merchants/quick-start/content-localization`,
        '/merchants/multistore/content-localization': `${basePath}/merchants/quick-start/content-localization`,
        '/merchants/multistore/content-localization-universal-editor': `${basePath}/merchants/quick-start/content-localization-universal-editor`,

        // ========= MISC REDIRECTS =========
        // Short path / CTA used in older builds or external links; canonical tutorial is create-storefront
        '/create': `${basePath}/get-started/create-storefront`,
        '/create/': `${basePath}/get-started/create-storefront/`,
        '/faq': `${basePath}/troubleshooting/faq`,
        '/references/configurations': `${basePath}/setup/configuration/commerce-configuration`,
        '/references/requirements': `${basePath}/get-started/architecture`,
        '/resources/product-discovery-diagrams': `${basePath}/dropins/product-discovery`,
        '/merchants/quick-start/visual-editor': `${basePath}/merchants/quick-start/universal-editor`,
        '/setup/aem-assets-integration': `${basePath}/merchants/quick-start/universal-editor`,
        '/boilerplate/ai-agent-skills': `${basePath}/ai/boilerplate-skills`,
        '/build-with-ai': `${basePath}/get-started/build-with-ai`,
        '/resources/build-with-ai': `${basePath}/get-started/build-with-ai`,

        // ========= AI SECTION REDIRECTS =========
        // ai-agent-skills.mdx and build-with-ai.mdx renamed to match sidebar labels
        '/ai/ai-agent-skills': `${basePath}/ai/boilerplate-skills`,
        '/ai/build-with-ai': `${basePath}/ai/static-text-files`,
    };
}
