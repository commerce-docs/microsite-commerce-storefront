#!/usr/bin/env node

/**
 * Comprehensive Slot Example Discovery
 * 
 * Scans boilerplate and repos to find all slot examples that exist
 * and compares them against what's documented
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getProjectRoot } from './lib/generator-core.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const projectRoot = getProjectRoot();
const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate', 'blocks');

console.log('🔍 Scanning boilerplate for slot examples...\n');

// Map of package name to container usage patterns
const packageToContainerPatterns = {
    '@dropins/storefront-cart': /(?:CartProvider|cartRenderer|provider)\.render\s*\(\s*(\w+)\s*,/g,
    '@dropins/storefront-checkout': /(?:CheckoutProvider|checkoutRenderer|provider)\.render\s*\(\s*(\w+)\s*,/g,
    '@dropins/storefront-order': /(?:OrderProvider|orderRenderer|provider)\.render\s*\(\s*(\w+)\s*,/g,
    '@dropins/storefront-pdp': /(?:PDPProvider|pdpRenderer|provider)\.render\s*\(\s*(\w+)\s*,/g,
    '@dropins/storefront-product-discovery': /(?:ProductDiscoveryProvider|productDiscoveryRenderer|provider)\.render\s*\(\s*(\w+)\s*,/g,
    '@dropins/storefront-recommendations': /(?:RecommendationsProvider|recommendationsRenderer|provider)\.render\s*\(\s*(\w+)\s*,/g,
    '@dropins/storefront-account': /(?:AccountProvider|accountRenderer|provider)\.render\s*\(\s*(\w+)\s*,/g,
    '@dropins/storefront-auth': /(?:AuthProvider|authRenderer|provider)\.render\s*\(\s*(\w+)\s*,/g,
    '@dropins/storefront-wishlist': /(?:WishlistProvider|wishlistRenderer|provider)\.render\s*\(\s*(\w+)\s*,/g,
    '@dropins/storefront-personalization': /(?:PersonalizationProvider|personalizationRenderer|provider|render)\.render\s*\(\s*(\w+)\s*,/g,
};

const foundExamples = {};

// Scan all block files
if (existsSync(boilerplatePath)) {
    const blocks = readdirSync(boilerplatePath);

    for (const block of blocks) {
        const blockPath = join(boilerplatePath, block);
        if (!existsSync(blockPath)) continue;

        // Look for .js files
        const files = [];
        function scanDir(dir) {
            const entries = readdirSync(dir);
            for (const entry of entries) {
                const entryPath = join(dir, entry);
                const stat = statSync(entryPath);
                if (stat.isDirectory()) {
                    scanDir(entryPath);
                } else if (entry.endsWith('.js')) {
                    files.push(entryPath);
                }
            }
        }
        scanDir(blockPath);

        for (const file of files) {
            try {
                const content = readFileSync(file, 'utf-8');

                // Check each package
                for (const [packageName, pattern] of Object.entries(packageToContainerPatterns)) {
                    const matches = [...content.matchAll(pattern)];

                    for (const match of matches) {
                        const containerName = match[1];
                        const startIndex = match.index;

                        // Look for slots: after this container render call
                        const afterMatch = content.substring(startIndex);
                        const slotsMatch = afterMatch.match(/slots\s*:\s*\{/);

                        if (slotsMatch) {
                            const slotsStart = startIndex + slotsMatch.index;
                            // Extract slot names
                            const slotsSection = content.substring(slotsStart, slotsStart + 2000); // Look ahead 2000 chars
                            const slotNameMatches = [...slotsSection.matchAll(/(\w+)\s*:\s*(?:async\s+)?\(/g)];

                            for (const slotMatch of slotNameMatches) {
                                const slotName = slotMatch[1];
                                const key = `${packageName}::${containerName}::${slotName}`;

                                if (!foundExamples[key]) {
                                    foundExamples[key] = [];
                                }

                                const relativePath = file.replace(boilerplatePath + '/', '');
                                foundExamples[key].push({
                                    block: block,
                                    file: relativePath,
                                    line: content.substring(0, startIndex).split('\n').length
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                // Skip errors
            }
        }
    }
}

// Print results
console.log('Found slot examples in boilerplate:\n');
console.log('='.repeat(80));

const byDropin = {};
for (const [key, examples] of Object.entries(foundExamples)) {
    const [packageName, containerName, slotName] = key.split('::');
    const dropinName = Object.entries(DROPIN_REPOS).find(([_, config]) => config.packageName === packageName)?.[0];

    if (!dropinName) continue;

    if (!byDropin[dropinName]) {
        byDropin[dropinName] = {};
    }
    if (!byDropin[dropinName][containerName]) {
        byDropin[dropinName][containerName] = {};
    }
    byDropin[dropinName][containerName][slotName] = examples;
}

for (const [dropinName, containers] of Object.entries(byDropin)) {
    console.log(`\n${dropinName}:`);
    for (const [containerName, slots] of Object.entries(containers)) {
        console.log(`  ${containerName}:`);
        for (const [slotName, examples] of Object.entries(slots)) {
            console.log(`    - ${slotName} (found in ${examples.length} location(s)):`);
            for (const ex of examples) {
                console.log(`      ${ex.block}/${ex.file}`);
            }
        }
    }
}

console.log('\n' + '='.repeat(80));
console.log(`\nTotal: ${Object.keys(foundExamples).length} unique slot examples found`);

