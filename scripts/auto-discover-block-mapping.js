#!/usr/bin/env node

/**
 * Automatic Block-to-Drop-in Mapper
 * 
 * Scans all boilerplate blocks to automatically discover which blocks use which drop-ins
 * This creates a comprehensive mapping for the packageToBlocks configuration
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getProjectRoot } from './lib/generator-core.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';

const projectRoot = getProjectRoot();
const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate', 'blocks');

// Map package names to their import patterns
const packagePatterns = {
    '@dropins/storefront-cart': /@dropins\/storefront-cart/g,
    '@dropins/storefront-checkout': /@dropins\/storefront-checkout/g,
    '@dropins/storefront-order': /@dropins\/storefront-order/g,
    '@dropins/storefront-pdp': /@dropins\/storefront-pdp/g,
    '@dropins/storefront-product-discovery': /@dropins\/storefront-product-discovery/g,
    '@dropins/storefront-recommendations': /@dropins\/storefront-recommendations/g,
    '@dropins/storefront-account': /@dropins\/storefront-account/g,
    '@dropins/storefront-auth': /@dropins\/storefront-auth/g,
    '@dropins/storefront-wishlist': /@dropins\/storefront-wishlist/g,
    '@dropins/storefront-personalization': /@dropins\/storefront-personalization/g,
};

const blockToPackages = {};

console.log('🔍 Scanning boilerplate blocks for drop-in usage...\n');

if (existsSync(boilerplatePath)) {
    const blocks = readdirSync(boilerplatePath);

    for (const block of blocks) {
        const blockPath = join(boilerplatePath, block);
        if (!statSync(blockPath).isDirectory()) continue;

        // Find all .js files in this block
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
                // Skip errors
            }
        }
        scanDir(blockPath);

        // Check each file for drop-in imports
        const packagesFound = new Set();
        for (const file of files) {
            try {
                const content = readFileSync(file, 'utf-8');

                for (const [packageName, pattern] of Object.entries(packagePatterns)) {
                    if (pattern.test(content)) {
                        packagesFound.add(packageName);
                    }
                }
            } catch (error) {
                // Skip errors
            }
        }

        if (packagesFound.size > 0) {
            const relativePath = files[0]?.replace(boilerplatePath + '/', '').split('/')[0] + '/' +
                files[0]?.replace(boilerplatePath + '/', '').split('/').slice(1).join('/');

            for (const packageName of packagesFound) {
                if (!blockToPackages[packageName]) {
                    blockToPackages[packageName] = [];
                }

                // Get the main block file (usually block-name.js or block-name/block-name.js)
                const mainFile = files.find(f =>
                    f.endsWith(`${block}/${block}.js`) ||
                    f.endsWith(`${block}.js`) ||
                    f.includes('containers.js')
                ) || files[0];

                const filePath = mainFile.replace(boilerplatePath + '/', '');
                if (!blockToPackages[packageName].includes(filePath)) {
                    blockToPackages[packageName].push(filePath);
                }
            }
        }
    }
}

// Generate the mapping code
console.log('Generated packageToBlocks mapping:\n');
console.log('const packageToBlocks = {');

for (const [packageName, blocks] of Object.entries(blockToPackages)) {
    const dropinName = Object.entries(DROPIN_REPOS).find(([_, config]) => config.packageName === packageName)?.[0];
    console.log(`  '${packageName}': [`);
    for (const block of blocks.sort()) {
        console.log(`    '${block}',`);
    }
    console.log(`  ],`);
}

console.log('};');

// Also generate a summary
console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`\nFound ${Object.keys(blockToPackages).length} drop-ins used across boilerplate blocks\n`);

for (const [packageName, blocks] of Object.entries(blockToPackages)) {
    const dropinName = Object.entries(DROPIN_REPOS).find(([_, config]) => config.packageName === packageName)?.[0];
    console.log(`${dropinName || packageName}: ${blocks.length} block(s)`);
    for (const block of blocks) {
        console.log(`  - ${block}`);
    }
    console.log('');
}

