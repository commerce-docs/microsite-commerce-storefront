#!/usr/bin/env node

/**
 * Standardize all GraphQL links to use schema format
 * Converts: /graphql-api/index.html#{type}-{operationName}
 * To: /schema/{module}/{mutations|queries}/{operation-kebab-case}/
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Convert graphql-api format to schema format
 * Maps operation names to their schema URLs with correct module and kebab-case names
 */
function convertToSchemaFormat(url) {
    // Pattern: /graphql-api/index.html#{mutation|query}-{operationName}
    const apiMatch = url.match(/graphql-api\/index\.html#(mutation|query)-(\w+)/);
    if (apiMatch) {
        const [, type, operationName] = apiMatch;

        // Map operation names to their schema module and kebab-case URL format
        const operationMap = {
            // Cart mutations
            'addProductsToCart': { module: 'cart', kebab: 'add-products' },
            'updateCartItems': { module: 'cart', kebab: 'update-items' },
            'removeGiftCardFromCart': { module: 'cart', kebab: 'remove-giftcard' },
            'setGiftOptionsOnCart': { module: 'cart', kebab: 'set-gift-options' },
            'applyCouponsToCart': { module: 'cart', kebab: 'apply-coupons-to-cart' },
            'applyGiftCardToCart': { module: 'cart', kebab: 'apply-gift-card-to-cart' },
            'applyGiftCartToCart': { module: 'cart', kebab: 'apply-gift-card-to-cart' },
            'estimateTotals': { module: 'cart', kebab: 'estimate-totals' },
            'estimateShippingMethods': { module: 'cart', kebab: 'estimate-shipping-methods' },
            'mergeCarts': { module: 'cart', kebab: 'merge-carts' },
            'setBillingAddressOnCart': { module: 'cart', kebab: 'set-billing-address-on-cart' },
            'setShippingAddressesOnCart': { module: 'cart', kebab: 'set-shipping-addresses-on-cart' },
            'setShippingMethodsOnCart': { module: 'cart', kebab: 'set-shipping-methods-on-cart' },
            'setPaymentMethodOnCart': { module: 'cart', kebab: 'set-payment-method-on-cart' },
            'setGuestEmailOnCart': { module: 'cart', kebab: 'set-guest-email-on-cart' },

            // Cart queries
            'isEmailAvailable': { module: 'cart', kebab: 'is-email-available' },
            'negotiableQuote': { module: 'cart', kebab: 'negotiable-quote' },

            // Customer mutations
            'createCustomerAddress': { module: 'customer', kebab: 'create-address' },
            'updateCustomerAddress': { module: 'customer', kebab: 'update-address' },
            'deleteCustomerAddress': { module: 'customer', kebab: 'delete-address' },
            'updateCustomerV2': { module: 'customer', kebab: 'update-v2' },
            'updateCustomerEmail': { module: 'customer', kebab: 'update-email' },
            'changeCustomerPassword': { module: 'customer', kebab: 'change-password' },
            'generateCustomerToken': { module: 'customer', kebab: 'generate-token' },
            'revokeCustomerToken': { module: 'customer', kebab: 'revoke-token' },
            'requestPasswordResetEmail': { module: 'customer', kebab: 'request-password-reset-email' },
            'resendConfirmationEmail': { module: 'customer', kebab: 'resend-confirmation-email' },
            'resetPassword': { module: 'customer', kebab: 'reset-password' },
            'confirmEmail': { module: 'customer', kebab: 'confirm-email' },
            'createCustomer': { module: 'customer', kebab: 'create' },
            'createCustomerV2': { module: 'customer', kebab: 'create-v2' },

            // Customer queries
            'customer': { module: 'customer', kebab: 'customer' },

            // Orders mutations
            'cancelOrder': { module: 'orders', kebab: 'cancel-order' },
            'confirmCancelOrder': { module: 'orders', kebab: 'confirm-cancel-order' },
            'reorderItems': { module: 'orders', kebab: 'reorder-items' },
            'requestReturn': { module: 'orders', kebab: 'request-return' },
            'requestGuestOrderCancel': { module: 'orders', kebab: 'request-guest-order-cancel' },
            'confirmReturn': { module: 'orders', kebab: 'confirm-return' },
            'requestGuestReturn': { module: 'orders', kebab: 'request-guest-return' },
            'placeNegotiableQuoteOrder': { module: 'orders', kebab: 'place-negotiable-quote-order' },

            // Orders queries
            'guestOrder': { module: 'orders', kebab: 'guest-order' },
            'guestOrderByToken': { module: 'orders', kebab: 'guest-order-by-token' },

            // Products queries
            'products': { module: 'products', kebab: 'products' },
            'refineProduct': { module: 'products', kebab: 'refine-product' },
            'recommendations': { module: 'products', kebab: 'recommendations' },

            // Attributes queries
            'attributesForm': { module: 'attributes', kebab: 'attributes-form' },
            'attributesList': { module: 'attributes', kebab: 'attributes-list' },

            // Store queries
            'storeConfig': { module: 'store', kebab: 'store-config' },
            'countries': { module: 'store', kebab: 'countries' },
            'country': { module: 'store', kebab: 'country' },

            // Wishlist mutations
            'addProductsToWishlist': { module: 'wishlist', kebab: 'add-products-to-wishlist' },
            'removeProductsFromWishlist': { module: 'wishlist', kebab: 'remove-products-from-wishlist' },
            'updateProductsInWishlist': { module: 'wishlist', kebab: 'update-products-in-wishlist' },

            // Wishlist queries
            'wishlist_v2': { module: 'wishlist', kebab: 'wishlist' },
            'wishlist': { module: 'wishlist', kebab: 'wishlist' }
        };

        const mapping = operationMap[operationName];
        if (mapping) {
            const typePath = type === 'mutation' ? 'mutations' : 'queries';
            return `https://developer.adobe.com/commerce/webapi/graphql/schema/${mapping.module}/${typePath}/${mapping.kebab}/`;
        }

        // Fallback: convert camelCase to kebab-case and guess module
        const kebabName = operationName
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .toLowerCase();

        // Guess module from operation name
        let module = 'cart';
        if (operationName.includes('Customer') || operationName.includes('customer')) {
            module = 'customer';
        } else if (operationName.includes('Order') || operationName.includes('order')) {
            module = 'orders';
        } else if (operationName.includes('Product') || operationName.includes('product')) {
            module = 'products';
        } else if (operationName.includes('Wishlist') || operationName.includes('wishlist')) {
            module = 'wishlist';
        } else if (operationName.includes('Attribute') || operationName.includes('attribute')) {
            module = 'attributes';
        } else if (operationName.includes('Store') || operationName.includes('store')) {
            module = 'store';
        }

        const typePath = type === 'mutation' ? 'mutations' : 'queries';
        return `https://developer.adobe.com/commerce/webapi/graphql/schema/${module}/${typePath}/${kebabName}/`;
    }

    // Already in schema format, return as-is
    if (url.includes('/schema/')) {
        return url;
    }

    // Unknown format, return as-is
    return url;
}

/**
 * Standardize GraphQL links in a file
 */
function standardizeFile(filePath) {
    const content = readFileSync(filePath, 'utf8');
    let updated = false;

    // Find all GraphQL URLs and replace them
    const updatedContent = content.replace(
        /(https:\/\/developer\.adobe\.com\/commerce\/webapi\/graphql[^\)"]+)/g,
        (match) => {
            const converted = convertToSchemaFormat(match);
            if (converted !== match) {
                updated = true;
                return converted;
            }
            return match;
        }
    );

    if (updated) {
        writeFileSync(filePath, updatedContent, 'utf8');
        return true;
    }

    return false;
}

// Find all function enrichment files
const enrichmentDir = join(projectRoot, '_dropin-enrichments');
const dropinDirs = readdirSync(enrichmentDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const files = [];
for (const dropin of dropinDirs) {
    const functionsFile = join(enrichmentDir, dropin, 'functions.json');
    if (existsSync(functionsFile)) {
        files.push(join(enrichmentDir, dropin, 'functions.json'));
    }
}

console.log('🔄 Standardizing GraphQL links...\n');

let updatedCount = 0;
for (const file of files) {
    if (standardizeFile(file)) {
        const relativePath = file.replace(projectRoot + '/', '');
        console.log(`✅ Updated: ${relativePath}`);
        updatedCount++;
    }
}

console.log(`\n✅ Standardized ${updatedCount} file(s)`);

