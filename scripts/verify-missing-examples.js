#!/usr/bin/env node

/**
 * Verify Missing Slot Examples
 * 
 * For each missing example, checks:
 * 1. Is the container actually used in boilerplate?
 * 2. Is the container used WITH slots?
 * 3. Are there examples we're missing due to extraction issues?
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getProjectRoot } from './lib/generator-core.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const projectRoot = getProjectRoot();
const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate', 'blocks');

// Read the check results
const checkResults = {
    'cart': {
        'CartSummaryGrid': { missing: ['Thumbnail'], total: 1 },
        'CartSummaryList': { missing: ['EmptyCart', 'ProductAttributes', 'CartSummaryFooter', 'CartItem', 'UndoBanner', 'ItemTitle', 'ItemPrice', 'ItemQuantity', 'ItemTotal', 'ItemSku', 'ItemRemoveAction'], total: 14 },
        'CartSummaryTable': { missing: ['Item', 'Price', 'Quantity', 'Subtotal', 'Thumbnail', 'ProductTitle', 'Sku', 'Configurations', 'ItemAlert', 'ItemWarning', 'Actions', 'UndoBanner', 'EmptyCart'], total: 13 },
        'GiftOptions': { missing: ['SwatchImage'], total: 1 },
        'MiniCart': { missing: ['ProductList', 'ProductListFooter', 'PreCheckoutSection', 'Heading', 'EmptyCart', 'Footer', 'ProductAttributes', 'CartSummaryFooter', 'CartItem', 'UndoBanner', 'ItemTitle', 'ItemPrice', 'ItemQuantity', 'ItemTotal', 'ItemSku', 'ItemRemoveAction'], total: 17 }
    }
};

console.log('🔍 Verifying missing examples against boilerplate...\n');

function findContainerUsage(containerName, packageName) {
    const results = {
        used: false,
        usedWithSlots: false,
        foundSlots: []
    };

    if (!existsSync(boilerplatePath)) {
        return results;
    }

    const blocks = readdirSync(boilerplatePath);

    for (const block of blocks) {
        const blockPath = join(boilerplatePath, block);
        if (!statSync(blockPath).isDirectory()) continue;

        const files = [];
        function scanDir(dir) {
            try {
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
            } catch (error) {
                // Skip
            }
        }
        scanDir(blockPath);

        for (const file of files) {
            try {
                const content = readFileSync(file, 'utf-8');

                // Check if this file uses the package
                const packagePattern = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (!new RegExp(packagePattern).test(content)) {
                    continue;
                }

                // Check if container is used
                const containerPatterns = [
                    new RegExp(`(?:\\w+Provider\\.|provider\\.|\\w+Renderer\\.|\\w+Rendered\\.|render\\.)?render\\s*\\(\\s*${containerName}\\s*,`, 'g'),
                    new RegExp(`import.*${containerName}.*from`, 'g')
                ];

                let containerFound = false;
                for (const pattern of containerPatterns) {
                    if (pattern.test(content)) {
                        containerFound = true;
                        results.used = true;
                        break;
                    }
                }

                if (containerFound) {
                    // Check if used with slots
                    const slotsPattern = new RegExp(`${containerName}[\\s\\S]{0,500}slots\\s*:\\s*\\{`, 's');
                    if (slotsPattern.test(content)) {
                        results.usedWithSlots = true;

                        // Extract slot names
                        const slotsMatch = content.match(new RegExp(`${containerName}[\\s\\S]{0,2000}slots\\s*:\\s*\\{([\\s\\S]{0,2000})\\}`, 's'));
                        if (slotsMatch) {
                            const slotsContent = slotsMatch[1];
                            const slotNameMatches = [...slotsContent.matchAll(/(\w+)\s*:\s*(?:async\s+)?\(/g)];
                            for (const match of slotNameMatches) {
                                if (!results.foundSlots.includes(match[1])) {
                                    results.foundSlots.push(match[1]);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                // Skip
            }
        }
    }

    return results;
}

// Check CartSummaryGrid
console.log('Checking CartSummaryGrid...');
const gridResults = findContainerUsage('CartSummaryGrid', '@dropins/storefront-cart');
console.log(`  Used: ${gridResults.used}`);
console.log(`  Used with slots: ${gridResults.usedWithSlots}`);
console.log(`  Found slots: ${gridResults.foundSlots.join(', ') || 'none'}`);
console.log(`  Missing Thumbnail: ${!gridResults.foundSlots.includes('Thumbnail')}\n`);

// Check CartSummaryTable
console.log('Checking CartSummaryTable...');
const tableResults = findContainerUsage('CartSummaryTable', '@dropins/storefront-cart');
console.log(`  Used: ${tableResults.used}`);
console.log(`  Used with slots: ${tableResults.usedWithSlots}`);
console.log(`  Found slots: ${tableResults.foundSlots.join(', ') || 'none'}\n`);

// Check CartSummaryList missing slots
console.log('Checking CartSummaryList missing slots...');
const listResults = findContainerUsage('CartSummaryList', '@dropins/storefront-cart');
console.log(`  Found slots: ${listResults.foundSlots.join(', ')}`);
const missingFromList = ['EmptyCart', 'ProductAttributes', 'CartSummaryFooter', 'CartItem', 'UndoBanner', 'ItemTitle', 'ItemPrice', 'ItemQuantity', 'ItemTotal', 'ItemSku', 'ItemRemoveAction'];
console.log(`  Missing slots not found in boilerplate:`);
for (const slot of missingFromList) {
    const found = listResults.foundSlots.includes(slot);
    console.log(`    ${slot}: ${found ? '✓ FOUND' : '✗ NOT FOUND'}`);
}

