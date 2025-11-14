/**
 * Example configuration file for generate-dropins-overview.js
 * 
 * Copy this file and customize it for your needs:
 *   cp overview-config.example.js my-custom-config.js
 * 
 * Then run:
 *   pnpm run generate-dropins-overview -- --config scripts/my-custom-config.js
 */

export default {
    // ============================================================================
    // REQUIRED: Directory to scan
    // ============================================================================
    targetDir: 'src/content/docs/dropins',

    // ============================================================================
    // OUTPUT
    // ============================================================================

    // Name of the generated file (will be created in targetDir)
    outputFile: 'index.mdx',

    // ============================================================================
    // FILTERING
    // ============================================================================

    // Only include these subdirectories (null = include all)
    // Examples:
    //   include: ['cart', 'checkout', 'order']          // Only these three
    //   include: ['b2c/cart', 'b2c/checkout']           // Nested paths
    //   include: null                                    // All subdirectories
    include: null,

    // Exclude patterns (supports wildcards with *)
    // Examples:
    //   exclude: ['all']                                 // Exclude utility folder
    //   exclude: ['deprecated-*', 'test-*']             // Exclude by pattern
    //   exclude: ['internal', 'draft-*']                // Multiple patterns
    exclude: ['all'],

    // ============================================================================
    // ORDERING
    // ============================================================================

    // How to order items in the table
    // Options:
    //   'alphabetical' - Sort A-Z (default)
    //   'discovery'    - Keep filesystem order
    //   'custom'       - Use customOrder array below
    order: 'alphabetical',

    // Custom ordering (only used if order: 'custom')
    // Items not listed will appear at the end alphabetically
    customOrder: [
        'cart',
        'checkout',
        'product-details',
        'product-discovery',
        'order',
        'user-account',
        'user-auth',
        'wishlist',
        'recommendations',
        'payment-services',
        'personalization'
    ],

    // ============================================================================
    // PAGE CONTENT
    // ============================================================================

    // Page title (appears in frontmatter and page heading)
    title: 'Overview',

    // Page description (appears in frontmatter for SEO)
    description: 'Explore Adobe Commerce drop-in components for building high-performance storefronts with pre-built UI components and commerce functionality.',

    // Introduction paragraph (appears before the table)
    introText: 'Drop-ins are pre-built, customizable UI components that provide complete commerce functionality for your storefront. Each drop-in handles a specific aspect of the shopping experience, from browsing products to completing checkout.'
};

