#!/usr/bin/env node

/**
 * Verify GraphQL Links in Function Descriptions
 * 
 * Checks that GraphQL mutation/query links in enrichment files match:
 * 1. The actual GraphQL operations used in source code (priority)
 * 2. The correct URL format for Adobe Commerce GraphQL docs
 */

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

import { DROPIN_REPOS } from './lib/dropin-config.js';
import { cloneDropinAtVersion, cloneOrUpdateBoilerplate, getBoilerplatePackageVersions } from './lib/repository.js';
import { loadFunctionEnrichments } from './lib/enrichment.js';

/**
 * Extract GraphQL mutation/query name from source code
 * Looks specifically in the function's graphql directory
 */
function extractGraphQLOperation(repoPath, functionName) {
    // Primary: Check function-specific graphql directory
    const graphqlDir = join(repoPath, 'src', 'api', functionName, 'graphql');
    if (existsSync(graphqlDir)) {
        try {
            const files = readdirSync(graphqlDir);
            // Prioritize files that match the function name
            const sortedFiles = files.sort((a, b) => {
                const aMatches = a.toLowerCase().includes(functionName.toLowerCase());
                const bMatches = b.toLowerCase().includes(functionName.toLowerCase());
                if (aMatches && !bMatches) return -1;
                if (!aMatches && bMatches) return 1;
                return 0;
            });

            for (const file of sortedFiles) {
                if (typeof file !== 'string') continue;
                if (!file.endsWith('.ts') && !file.endsWith('.graphql') && !file.endsWith('.js')) continue;

                const filePath = join(graphqlDir, file);
                if (!existsSync(filePath) || !statSync(filePath).isFile()) continue;

                const content = readFileSync(filePath, 'utf8');

                // Look for mutation - extract the actual mutation name inside the block
                // Pattern: mutation NAME(...) { mutationName(...) }
                const lines = content.split('\n');
                let inMutation = false;
                let inQuery = false;

                for (const line of lines) {
                    if (line.match(/^\s*mutation\s+\w+/)) {
                        inMutation = true;
                        inQuery = false;
                        continue;
                    }
                    if (line.match(/^\s*query\s+\w+/)) {
                        inQuery = true;
                        inMutation = false;
                        continue;
                    }
                    if ((inMutation || inQuery) && line.match(/^\s+(\w+)\s*\(/)) {
                        const match = line.match(/^\s+(\w+)\s*\(/);
                        if (match) {
                            const opName = match[1];
                            // Skip fragments and common words
                            if (!['cart', 'fragment', 'CART_FRAGMENT', 'input', 'user_errors', 'country', 'region'].includes(opName)) {
                                return {
                                    type: inMutation ? 'mutation' : 'query',
                                    name: opName
                                };
                            }
                        }
                    }
                    if (line.match(/^\s*\}/)) {
                        inMutation = false;
                        inQuery = false;
                    }
                }
            }
        } catch (error) {
            // Continue to next check
        }
    }

    return null;
}

/**
 * Convert camelCase to kebab-case for URL
 */
function camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Extract GraphQL link from description
 */
function extractGraphQLLink(description) {
    if (!description) return null;

    const linkMatch = description.match(/\[`?([^`\]]+)`?\]\((https?:\/\/[^\)]+)\)/);
    if (!linkMatch) return null;

    return {
        linkText: linkMatch[1],
        url: linkMatch[2]
    };
}

/**
 * Generate GraphQL URL from operation name and type
 * Uses the schema format: /schema/{module}/{mutations|queries}/{operation-kebab-case}/
 */
function generateGraphQLURL(operationName, operationType, dropinName) {
    // Map drop-in names to GraphQL schema modules
    const moduleMap = {
        'cart': 'cart',
        'checkout': 'cart', // Checkout uses cart mutations
        'order': 'orders',
        'user-account': 'customer',
        'user-auth': 'customer',
        'product-details': 'products',
        'product-discovery': 'products',
        'recommendations': 'products',
        'wishlist': 'wishlist'
    };

    // Map operation names to their kebab-case schema URL format
    const operationKebabMap = {
        'addProductsToCart': 'add-products',
        'updateCartItems': 'update-items',
        'removeGiftCardFromCart': 'remove-giftcard',
        'setGiftOptionsOnCart': 'set-gift-options',
        'applyCouponsToCart': 'apply-coupons-to-cart',
        'applyGiftCardToCart': 'apply-gift-card-to-cart',
        'estimateTotals': 'estimate-totals',
        'estimateShippingMethods': 'estimate-shipping-methods',
        'mergeCarts': 'merge-carts',
        'setBillingAddressOnCart': 'set-billing-address-on-cart',
        'setShippingAddressesOnCart': 'set-shipping-addresses-on-cart',
        'setShippingMethodsOnCart': 'set-shipping-methods-on-cart',
        'setPaymentMethodOnCart': 'set-payment-method-on-cart',
        'setGuestEmailOnCart': 'set-guest-email-on-cart',
        'isEmailAvailable': 'is-email-available',
        'negotiableQuote': 'negotiable-quote',
        'createCustomerAddress': 'create-address',
        'updateCustomerAddress': 'update-address',
        'deleteCustomerAddress': 'delete-address',
        'updateCustomerV2': 'update-v2',
        'updateCustomerEmail': 'update-email',
        'changeCustomerPassword': 'change-password',
        'generateCustomerToken': 'generate-token',
        'revokeCustomerToken': 'revoke-token',
        'requestPasswordResetEmail': 'request-password-reset-email',
        'resendConfirmationEmail': 'resend-confirmation-email',
        'resetPassword': 'reset-password',
        'confirmEmail': 'confirm-email',
        'createCustomer': 'create',
        'createCustomerV2': 'create-v2',
        'customer': 'customer',
        'cancelOrder': 'cancel-order',
        'confirmCancelOrder': 'confirm-cancel-order',
        'reorderItems': 'reorder-items',
        'requestReturn': 'request-return',
        'requestGuestOrderCancel': 'request-guest-order-cancel',
        'confirmReturn': 'confirm-return',
        'requestGuestReturn': 'request-guest-return',
        'placeNegotiableQuoteOrder': 'place-negotiable-quote-order',
        'guestOrder': 'guest-order',
        'guestOrderByToken': 'guest-order-by-token',
        'products': 'products',
        'refineProduct': 'refine-product',
        'recommendations': 'recommendations',
        'attributesForm': 'attributes-form',
        'attributesList': 'attributes-list',
        'storeConfig': 'store-config',
        'countries': 'countries',
        'country': 'country',
        'addProductsToWishlist': 'add-products-to-wishlist',
        'removeProductsFromWishlist': 'remove-products-from-wishlist',
        'updateProductsInWishlist': 'update-products-in-wishlist',
        'wishlist_v2': 'wishlist',
        'wishlist': 'wishlist'
    };

    const kebabName = operationKebabMap[operationName] || camelToKebab(operationName);
    const module = moduleMap[dropinName] || 'cart';
    const type = operationType === 'mutation' ? 'mutations' : 'queries';

    // Use schema URL format
    return `https://developer.adobe.com/commerce/webapi/graphql/schema/${module}/${type}/${kebabName}/`;
}

/**
 * Generate suggested description text with GraphQL link
 */
function generateSuggestedDescription(functionName, operationName, operationType, existingDescription, dropinName) {
    const operationTypeText = operationType === 'mutation' ? 'mutation' : 'query';
    const linkText = `\`${operationName}\``;
    const url = generateGraphQLURL(operationName, operationType, dropinName);

    // If description already exists, append the link
    if (existingDescription && existingDescription.trim()) {
        // Check if it already has a GraphQL link
        if (existingDescription.includes('developer.adobe.com/commerce/webapi/graphql')) {
            return null; // Already has a link
        }
        // Append the link
        return `${existingDescription} The function calls the [${linkText}](${url}) ${operationTypeText}.`;
    }

    // Generate new description
    return `The \`${functionName}\` function calls the [${linkText}](${url}) ${operationTypeText}.`;
}

/**
 * Verify GraphQL link matches source code and detect missing links
 */
async function verifyGraphQLLinks(options = {}) {
    const { suggestMissing = false, addMissing = false } = options;
    console.log('🔍 Verifying GraphQL Links Against Source Code');
    console.log('='.repeat(60));

    // Setup boilerplate to get versions
    console.log('\n📦 Setting up boilerplate repository...');
    const { path: boilerplatePath } = cloneOrUpdateBoilerplate();
    const packageVersions = getBoilerplatePackageVersions(boilerplatePath);
    console.log('✅ Boilerplate loaded\n');

    const allIssues = [];
    const verified = [];
    const missingLinks = [];
    const enrichmentUpdates = {}; // Track updates for --add mode

    for (const [dropinName, repoConfig] of Object.entries(DROPIN_REPOS)) {
        console.log(`\n📦 Checking ${dropinName}...`);

        try {
            const version = packageVersions[repoConfig.packageName];
            if (!version) {
                console.log(`  ⚠️  No version found`);
                continue;
            }

            const { path: repoPath } = cloneDropinAtVersion(
                dropinName,
                repoConfig,
                version
            );

            const enrichmentData = loadFunctionEnrichments(dropinName);
            if (!enrichmentData) continue;

            for (const [functionName, enrichment] of Object.entries(enrichmentData)) {
                const description = enrichment?.description || '';
                const graphQLLink = extractGraphQLLink(description);

                // Extract actual GraphQL operation from source (do this first to check for missing links)
                const actualOperation = extractGraphQLOperation(repoPath, functionName);

                // Check for missing links if operation exists but no link found
                if (actualOperation && !graphQLLink && (suggestMissing || addMissing)) {
                    const suggestedURL = generateGraphQLURL(actualOperation.name, actualOperation.type, dropinName);
                    const suggestedDescription = generateSuggestedDescription(
                        functionName,
                        actualOperation.name,
                        actualOperation.type,
                        description,
                        dropinName
                    );

                    // Only add to missingLinks if we have a valid suggestion
                    if (suggestedDescription) {
                        missingLinks.push({
                            dropin: dropinName,
                            function: functionName,
                            operation: actualOperation.name,
                            type: actualOperation.type,
                            suggestedURL,
                            suggestedDescription,
                            currentDescription: description || '(no description)'
                        });

                        // If addMissing is true, track the update
                        if (addMissing) {
                            if (!enrichmentUpdates[dropinName]) {
                                enrichmentUpdates[dropinName] = {
                                    path: join(projectRoot, '_dropin-enrichments', dropinName, 'functions.json'),
                                    updates: []
                                };
                            }
                            enrichmentUpdates[dropinName].updates.push({
                                function: functionName,
                                oldDescription: description || '',
                                newDescription: suggestedDescription
                            });
                        }
                    }

                    continue; // Skip verification for missing links
                }

                if (!graphQLLink) continue;

                if (actualOperation) {
                    const expectedKebab = camelToKebab(actualOperation.name);
                    const urlPath = graphQLLink.url.split('/').slice(-2).join('/'); // Get last two path segments

                    // Extract the operation name from URL (last segment before trailing slash)
                    const urlParts = graphQLLink.url.split('/').filter(p => p);
                    const urlOpName = urlParts[urlParts.length - 1]; // Last non-empty part

                    // Check if URL matches expected format - allow both full name and shortened version
                    // e.g., "update-customer-address" matches "update-address" (common pattern)
                    const urlMatches = urlOpName === expectedKebab ||
                        urlOpName === camelToKebab(actualOperation.name.replace(/^create|^update|^delete|^get|^set|^remove|^apply|^change/, '')) ||
                        urlPath.includes(expectedKebab) ||
                        urlPath.includes(actualOperation.name.toLowerCase()) ||
                        urlOpName.includes(expectedKebab.split('-').slice(-2).join('-')) || // Last two words
                        expectedKebab.includes(urlOpName);

                    // Special case: ACDL links are not GraphQL links
                    if (graphQLLink.url.includes('github.com/adobe/adobe-client-data-layer')) {
                        // This is an ACDL link, not a GraphQL link - skip verification
                        continue;
                    }

                    // Special case: graphql-api/index.html URLs use hash anchors - extract from hash
                    if (graphQLLink.url.includes('graphql-api/index.html#')) {
                        const hashMatch = graphQLLink.url.match(/#(mutation|query)-(\w+)/);
                        if (hashMatch) {
                            const urlOpName = hashMatch[2];
                            const urlMatches = urlOpName.toLowerCase() === actualOperation.name.toLowerCase() ||
                                camelToKebab(urlOpName) === expectedKebab;
                            if (urlMatches) {
                                verified.push({
                                    dropin: dropinName,
                                    function: functionName,
                                    operation: actualOperation.name,
                                    type: actualOperation.type
                                });
                                continue;
                            }
                        }
                    }

                    if (!urlMatches) {
                        allIssues.push({
                            dropin: dropinName,
                            function: functionName,
                            issue: `URL mismatch: Expected operation "${actualOperation.name}" (${expectedKebab}), but link points to "${urlOpName}"`,
                            actualOperation: actualOperation.name,
                            linkUrl: graphQLLink.url
                        });
                    } else {
                        verified.push({
                            dropin: dropinName,
                            function: functionName,
                            operation: actualOperation.name,
                            type: actualOperation.type
                        });
                    }
                } else {
                    // Couldn't find source - just verify URL format
                    const hasValidFormat = graphQLLink.url.includes('developer.adobe.com/commerce/webapi/graphql');
                    if (!hasValidFormat) {
                        allIssues.push({
                            dropin: dropinName,
                            function: functionName,
                            issue: `Invalid URL format: ${graphQLLink.url}`,
                            linkUrl: graphQLLink.url
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
        }
    }

    // Print summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Verified: ${verified.length} GraphQL links`);
    console.log(`⚠️  Issues: ${allIssues.length}`);
    if (suggestMissing || addMissing) {
        console.log(`🔍 Missing links detected: ${missingLinks.length}`);
    }

    if (allIssues.length > 0) {
        console.log('\n⚠️  ISSUES FOUND:');
        for (const issue of allIssues) {
            console.log(`\n  ${issue.dropin} → ${issue.function}:`);
            console.log(`    ${issue.issue}`);
            if (issue.actualOperation) {
                console.log(`    Actual operation: ${issue.actualOperation}`);
            }
            console.log(`    Link URL: ${issue.linkUrl}`);
        }
    }

    if (verified.length > 0) {
        console.log('\n✅ VERIFIED LINKS:');
        const byDropin = {};
        for (const v of verified) {
            if (!byDropin[v.dropin]) byDropin[v.dropin] = [];
            byDropin[v.dropin].push(`${v.function} → ${v.operation} (${v.type})`);
        }
        for (const [dropin, funcs] of Object.entries(byDropin)) {
            console.log(`\n  ${dropin}:`);
            for (const func of funcs) {
                console.log(`    ${func}`);
            }
        }
    }

    if (missingLinks.length > 0) {
        console.log('\n🔍 MISSING GRAPHQL LINKS:');
        const byDropin = {};
        for (const m of missingLinks) {
            if (!byDropin[m.dropin]) byDropin[m.dropin] = [];
            byDropin[m.dropin].push(m);
        }
        for (const [dropin, funcs] of Object.entries(byDropin)) {
            console.log(`\n  ${dropin}:`);
            for (const func of funcs) {
                console.log(`    ${func.function} → ${func.operation} (${func.type})`);
                console.log(`      Current: ${func.currentDescription.substring(0, 80)}${func.currentDescription.length > 80 ? '...' : ''}`);
                console.log(`      Suggested URL: ${func.suggestedURL}`);
                if (suggestMissing && !addMissing) {
                    console.log(`      Suggested description: ${func.suggestedDescription?.substring(0, 100)}${func.suggestedDescription && func.suggestedDescription.length > 100 ? '...' : ''}`);
                }
            }
        }

        // Enhanced information for --suggest mode
        if (suggestMissing && !addMissing) {
            console.log('\n' + '='.repeat(60));
            console.log('📋 DETAILED SUGGESTIONS');
            console.log('='.repeat(60));
            console.log('\nCopy-paste ready JSON snippets for enrichment files:\n');

            for (const [dropin, funcs] of Object.entries(byDropin)) {
                const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropin, 'functions.json');
                console.log(`\n// ${enrichmentPath}`);
                console.log('{');
                for (const func of funcs) {
                    const jsonKey = `  "${func.function}": {`;
                    const jsonDesc = `    "description": ${JSON.stringify(func.suggestedDescription)}`;
                    console.log(jsonKey);
                    console.log(jsonDesc);
                    console.log('  },');
                }
                console.log('}');
            }

            console.log('\n' + '='.repeat(60));
            console.log('📊 SUMMARY BY DROP-IN');
            console.log('='.repeat(60));
            for (const [dropin, funcs] of Object.entries(byDropin)) {
                const enrichmentPath = join(projectRoot, '_dropin-enrichments', dropin, 'functions.json');
                console.log(`\n${dropin}: ${funcs.length} function(s) need GraphQL links`);
                console.log(`  File: ${enrichmentPath}`);
                console.log(`  Functions: ${funcs.map(f => f.function).join(', ')}`);
            }
        }
    }

    return { success: allIssues.length === 0, missingLinks, enrichmentUpdates };
}

// Parse command line arguments
const args = process.argv.slice(2);
const suggestMissing = args.includes('--suggest') || args.includes('--suggest-missing');
const addMissing = args.includes('--add') || args.includes('--add-missing');

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/verify-graphql-links.js [options]

Options:
  --suggest, --suggest-missing    Show suggested GraphQL links for functions missing them
  --add, --add-missing            Automatically add GraphQL links to enrichment files (use with caution)
  --help, -h                      Show this help message

Examples:
  node scripts/verify-graphql-links.js                    # Verify existing links only
  node scripts/verify-graphql-links.js --suggest          # Verify + suggest missing links
  node scripts/verify-graphql-links.js --add              # Verify + automatically add missing links
`);
    process.exit(0);
}

// Run verification
verifyGraphQLLinks({ suggestMissing, addMissing }).then(result => {
    const { success, missingLinks, enrichmentUpdates } = result;

    if (addMissing && Object.keys(enrichmentUpdates).length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('📝 APPLYING CHANGES');
        console.log('='.repeat(60));

        let totalUpdated = 0;
        for (const [dropinName, updateInfo] of Object.entries(enrichmentUpdates)) {
            try {
                // Read current enrichment file
                const enrichmentPath = updateInfo.path;
                let enrichmentData = {};
                if (existsSync(enrichmentPath)) {
                    const content = readFileSync(enrichmentPath, 'utf8');
                    enrichmentData = JSON.parse(content);
                }

                // Apply updates
                for (const update of updateInfo.updates) {
                    if (!enrichmentData[update.function]) {
                        enrichmentData[update.function] = {};
                    }
                    enrichmentData[update.function].description = update.newDescription;
                    totalUpdated++;
                    console.log(`  ✅ ${dropinName} → ${update.function}`);
                }

                // Write back to file
                writeFileSync(enrichmentPath, JSON.stringify(enrichmentData, null, 2) + '\n', 'utf8');
                console.log(`\n  💾 Updated ${enrichmentPath} (${updateInfo.updates.length} function(s))`);
            } catch (error) {
                console.error(`  ❌ Error updating ${dropinName}: ${error.message}`);
            }
        }

        console.log(`\n✅ Successfully updated ${totalUpdated} function description(s) across ${Object.keys(enrichmentUpdates).length} drop-in(s)`);
        console.log('\n⚠️  Please review the changes and regenerate documentation:');
        console.log('   pnpm run generate:functions');
    } else if (addMissing && missingLinks.length === 0) {
        console.log('\n✅ No missing links found - all GraphQL operations are already documented!');
    } else if (addMissing) {
        console.log('\n⚠️  Note: Use --suggest first to review recommendations before applying changes.');
    }

    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

