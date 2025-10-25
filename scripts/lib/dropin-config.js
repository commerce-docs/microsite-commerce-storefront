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
 */

export const DROPIN_REPOS = {
    // B2C Drop-ins
    'cart': {
        packageName: '@dropins/storefront-cart',
        gitUrl: 'https://github.com/adobe-commerce/storefront-cart.git',
        type: 'B2C',
        displayName: 'Cart'
    },
    'checkout': {
        packageName: '@dropins/storefront-checkout',
        gitUrl: 'https://github.com/adobe-commerce/storefront-checkout.git',
        type: 'B2C',
        displayName: 'Checkout'
    },
    'order': {
        packageName: '@dropins/storefront-order',
        gitUrl: 'https://github.com/adobe-commerce/storefront-order.git',
        type: 'B2C',
        displayName: 'Order'
    },
    'product-details': {
        packageName: '@dropins/storefront-pdp',
        gitUrl: 'https://github.com/adobe-commerce/storefront-pdp.git',
        type: 'B2C',
        displayName: 'Product Details'
    },
    'product-discovery': {
        packageName: '@dropins/storefront-product-discovery',
        gitUrl: 'https://github.com/adobe-commerce/storefront-search-dropin.git',
        type: 'B2C',
        displayName: 'Product Discovery'
    },
    'recommendations': {
        packageName: '@dropins/storefront-recommendations',
        gitUrl: 'https://github.com/adobe-commerce/storefront-recommendations.git',
        type: 'B2C',
        displayName: 'Recommendations'
    },
    'user-account': {
        packageName: '@dropins/storefront-account',
        gitUrl: 'https://github.com/adobe-commerce/storefront-account.git',
        type: 'B2C',
        displayName: 'User Account'
    },
    'user-auth': {
        packageName: '@dropins/storefront-auth',
        gitUrl: 'https://github.com/adobe-commerce/storefront-auth.git',
        type: 'B2C',
        displayName: 'User Auth'
    },
    'wishlist': {
        packageName: '@dropins/storefront-wishlist',
        gitUrl: 'https://github.com/adobe-commerce/storefront-wishlist.git',
        type: 'B2C',
        displayName: 'Wishlist'
    },
    'payment-services': {
        packageName: '@dropins/storefront-payment-services',
        gitUrl: 'https://github.com/adobe-commerce/storefront-payment-services.git',
        type: 'B2C',
        displayName: 'Payment Services'
    },
    // B2B Drop-ins
    'company-management': {
        packageName: '@dropins/storefront-company-management',
        gitUrl: 'https://github.com/adobe-commerce/storefront-company-management.git',
        type: 'B2B',
        displayName: 'Company Management'
    },
};

