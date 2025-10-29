/**
 * Shared Drop-in Repository Configuration
 * 
 * This module contains the centralized configuration for all drop-in repositories.
 * Used by all documentation generators to maintain consistency across the system.
 * 
 * Each entry maps a drop-in name to its repository information:
 * - packageName: NPM package name
 * - gitUrl: GitHub repository URL
 * - type: 'B2C' or 'B2B'
 * - displayName: Human-readable name for documentation
 * - isPublic: Whether the repository is publicly accessible (default: false)
 *   ⚠️ IMPORTANT: Private repo links should NEVER appear in public docs (404 errors)
 */

export const DROPIN_REPOS = {
    // B2C Drop-ins
    'cart': {
        packageName: '@dropins/storefront-cart',
        gitUrl: 'git@github.com:adobe-commerce/storefront-cart.git',
        type: 'B2C',
        displayName: 'Cart',
        isPublic: false  // Private repo - no source links in public docs
    },
    'checkout': {
        packageName: '@dropins/storefront-checkout',
        gitUrl: 'git@github.com:adobe-commerce/storefront-checkout.git',
        type: 'B2C',
        displayName: 'Checkout',
        isPublic: false
    },
    'order': {
        packageName: '@dropins/storefront-order',
        gitUrl: 'git@github.com:adobe-commerce/storefront-order.git',
        type: 'B2C',
        displayName: 'Order',
        isPublic: false
    },
    'product-details': {
        packageName: '@dropins/storefront-pdp',
        gitUrl: 'git@github.com:adobe-commerce/storefront-pdp.git',
        type: 'B2C',
        displayName: 'Product Details',
        isPublic: false
    },
    'product-discovery': {
        packageName: '@dropins/storefront-product-discovery',
        gitUrl: 'git@github.com:adobe-commerce/storefront-search-dropin.git',
        type: 'B2C',
        displayName: 'Product Discovery',
        isPublic: false
    },
    'recommendations': {
        packageName: '@dropins/storefront-recommendations',
        gitUrl: 'git@github.com:adobe-commerce/storefront-recommendations.git',
        type: 'B2C',
        displayName: 'Recommendations',
        isPublic: false
    },
    'user-account': {
        packageName: '@dropins/storefront-account',
        gitUrl: 'git@github.com:adobe-commerce/storefront-account.git',
        type: 'B2C',
        displayName: 'User Account',
        isPublic: false
    },
    'user-auth': {
        packageName: '@dropins/storefront-auth',
        gitUrl: 'git@github.com:adobe-commerce/storefront-auth.git',
        type: 'B2C',
        displayName: 'User Auth',
        isPublic: false
    },
    'wishlist': {
        packageName: '@dropins/storefront-wishlist',
        gitUrl: 'git@github.com:adobe-commerce/storefront-wishlist.git',
        type: 'B2C',
        displayName: 'Wishlist',
        isPublic: false
    },
    'payment-services': {
        packageName: '@dropins/storefront-payment-services',
        gitUrl: 'git@github.com:adobe-commerce/storefront-payment-services.git',
        type: 'B2C',
        displayName: 'Payment Services',
        isPublic: false
    },
    'personalization': {
        packageName: '@dropins/storefront-personalization',
        gitUrl: 'git@github.com:adobe-commerce/storefront-personalization.git',
        type: 'B2C',
        displayName: 'Personalization',
        isPublic: false
    }
};

/**
 * Reference Repositories
 * 
 * These repositories are used as reference sources for documentation,
 * examples, and enrichment data. They are not drop-ins themselves but
 * provide valuable context and working examples.
 */
export const REFERENCE_REPOS = {
    'storefront-sdk': {
        gitUrl: 'git@github.com:adobe-commerce/StorefrontSDK.git',
        displayName: 'Storefront SDK',
        description: 'Core SDK for storefront functionality and shared utilities',
        isPublic: false
    },
    'dropin-template': {
        gitUrl: 'git@github.com:adobe-commerce/dropin-template.git',
        displayName: 'Drop-in Template',
        description: 'Official template for creating custom drop-ins with working examples',
        isPublic: false
    },
    'storefront-tools': {
        gitUrl: 'git@github.com:adobe-commerce/storefront-tools.git',
        displayName: 'Storefront Tools',
        description: 'Development tools and utilities for storefront projects',
        isPublic: false
    },
    'da-live': {
        gitUrl: 'git@github.com:adobe/da-live.git',
        displayName: 'Edge Delivery Authoring',
        description: 'Authoring experience and patterns for merchants, includes blocks and UI examples',
        isPublic: true  // Public repo - source links are safe to include
    }
};

/**
 * Check if a repository is publicly accessible
 * 
 * @param {string} repoName - Name of the repository (e.g., 'cart', 'storefront-sdk')
 * @returns {boolean} True if the repository is public, false otherwise
 */
export function isRepoPublic(repoName) {
    const repo = DROPIN_REPOS[repoName] || REFERENCE_REPOS[repoName];
    return repo?.isPublic === true;
}

