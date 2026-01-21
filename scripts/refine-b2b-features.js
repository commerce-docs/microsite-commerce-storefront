#!/usr/bin/env node

/**
 * Refine B2B Feature Tables
 * 
 * Updates B2B drop-in feature tables to follow the established pattern:
 * - Mix of Commerce capabilities (high-level features)
 * - Implementation details (GraphQL, API extensibility)
 * - UI capabilities (specific containers/views)
 * - Technical features (authentication, multi-language support)
 * 
 * This aligns B2B drop-ins with the B2C pattern seen in Cart, Checkout, etc.
 */

import { readFileSync, writeFileSync } from 'fs';

const refinedFeatures = {
    'purchase-order': [
        { feature: 'Purchase order creation', status: 'Supported' },
        { feature: 'Purchase order approval rules', status: 'Supported' },
        { feature: 'Purchase order approval workflows', status: 'Supported' },
        { feature: 'Purchase order comments and history', status: 'Supported' },
        { feature: 'Purchase order list views', status: 'Supported' },
        { feature: 'Purchase order details view', status: 'Supported' },
        { feature: 'Conditional checkout logic', status: 'Supported' },
        { feature: 'Company and subordinate views', status: 'Supported' },
        { feature: 'Bulk approve/reject actions', status: 'Supported' },
        { feature: 'Convert purchase order to order', status: 'Supported' },
        { feature: 'ACL permission-based access control', status: 'Supported' },
        { feature: 'GraphQL API integration', status: 'Supported' }
    ],

    'quote-management': [
        { feature: 'Negotiable quotes', status: 'Supported' },
        { feature: 'Quote requests with file attachments', status: 'Supported' },
        { feature: 'Quote lifecycle management', status: 'Supported' },
        { feature: 'Quote comments and history tracking', status: 'Supported' },
        { feature: 'Quote templates for repeat ordering', status: 'Supported' },
        { feature: 'Quote item management', status: 'Supported' },
        { feature: 'Quote status tracking', status: 'Supported' },
        { feature: 'Shipping address selection', status: 'Supported' },
        { feature: 'Quote duplication', status: 'Supported' },
        { feature: 'Convert quotes to orders', status: 'Supported' },
        { feature: 'Quote list views with filtering', status: 'Supported' },
        { feature: 'Customer authentication required', status: 'Supported' },
        { feature: 'Multi-language support', status: 'Supported' },
        { feature: 'GraphQL API integration', status: 'Supported' }
    ],

    'requisition-list': [
        { feature: 'Create and manage requisition lists', status: 'Supported' },
        { feature: 'Multiple requisition lists per account', status: 'Supported' },
        { feature: 'Add products from product pages', status: 'Supported' },
        { feature: 'Add products from list pages', status: 'Supported' },
        { feature: 'Requisition list item management', status: 'Supported' },
        { feature: 'Update item quantities', status: 'Supported' },
        { feature: 'Delete items and lists', status: 'Supported' },
        { feature: 'Add list items to cart', status: 'Supported' },
        { feature: 'Batch item operations', status: 'Supported' },
        { feature: 'Requisition list grid view', status: 'Supported' },
        { feature: 'Customer authentication required', status: 'Supported' },
        { feature: 'GraphQL API integration', status: 'Supported' }
    ],

    'company-switcher': [
        { feature: 'Multi-company user access', status: 'Supported' },
        { feature: 'Company context switching', status: 'Supported' },
        { feature: 'Company context retrieval', status: 'Supported' },
        { feature: 'Automatic GraphQL header management', status: 'Supported' },
        { feature: 'Customer group header management', status: 'Supported' },
        { feature: 'Real-time context change events', status: 'Supported' },
        { feature: 'Data isolation across companies', status: 'Supported' },
        { feature: 'Permission-based access control', status: 'Supported' },
        { feature: 'Session persistence', status: 'Supported' },
        { feature: 'GraphQL API integration', status: 'Supported' }
    ]
};

console.log('🔄 Refining B2B drop-in feature tables...\n');

for (const [dropin, features] of Object.entries(refinedFeatures)) {
    const enrichmentPath = `_dropin-enrichments/${dropin}/overview.json`;

    try {
        // Read existing enrichment
        const enrichment = JSON.parse(readFileSync(enrichmentPath, 'utf8'));

        // Update features
        enrichment.supported_features = features;

        // Write back
        writeFileSync(enrichmentPath, JSON.stringify(enrichment, null, 2) + '\n', 'utf8');

        console.log(`✅ ${dropin}: Updated to ${features.length} features`);

    } catch (error) {
        console.error(`❌ ${dropin}: ${error.message}`);
    }
}

console.log('\n✅ All B2B feature tables refined!\n');
console.log('Next steps:');
console.log('  1. Review the updated enrichment files');
console.log('  2. Regenerate MDX files:');
console.log('     for dropin in purchase-order quote-management requisition-list company-switcher; do');
console.log('       node scripts/@generate-overview-docs.js "$dropin"');
console.log('     done\n');

