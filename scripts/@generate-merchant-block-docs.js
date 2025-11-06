#!/usr/bin/env node

/**
 * Merchant Block Documentation Generator
 *
 * Generates merchant-focused documentation for commerce blocks, showing how to
 * configure them using document-based authoring in AEM.
 *
 * Unlike technical documentation, this focuses on:
 * - Business user perspective
 * - Document authoring configuration
 * - Practical examples and tips
 * - Non-technical language
 *
 * USAGE:
 * - Generate all merchant block docs: npm run generate-merchant-block-docs
 *
 * OUTPUT: Multiple MDX files in src/content/docs/merchants/blocks/
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync, execFileSync } from 'child_process';

// Import shared utilities
import { getProjectRoot } from './lib/generator-core.js';
import { ensureParentDirectoryExists, formatDate } from './lib/utils.js';

const projectRoot = getProjectRoot();

// ============================================================================
// REPOSITORY MANAGEMENT
// ============================================================================

/**
 * Clone or update the boilerplate repository
 */
function cloneBoilerplate() {
    const boilerplatePath = join(projectRoot, '.temp-repos', 'aem-boilerplate-commerce');

    console.log('\n📦 Cloning/updating AEM Commerce boilerplate...');

    if (!existsSync(boilerplatePath)) {
        console.log('  Cloning boilerplate repository...');
        execFileSync('git', ['clone', '--depth', '1', 'https://github.com/hlxsites/aem-boilerplate-commerce.git', boilerplatePath], { stdio: 'inherit' });
    } else {
        console.log('  Updating boilerplate repository...');
        execSync(`cd ${boilerplatePath} && git pull`, { stdio: 'inherit' });
    }

    return boilerplatePath;
}

// ============================================================================
// CONFIGURATION EXTRACTION
// ============================================================================

/**
 * Extract configuration from block JavaScript source code
 * Parses the readBlockConfig destructuring to get actual properties
 */
function extractConfigFromSource(blockPath, blockName) {
    const jsPath = join(blockPath, `${blockName}.js`);

    if (!existsSync(jsPath)) {
        console.log(`  ⚠️  JavaScript file not found: ${jsPath}`);
        return [];
    }

    const source = readFileSync(jsPath, 'utf8');
    const configs = [];

    // Find the readBlockConfig destructuring pattern
    const configPattern = /const\s*\{([^}]+)\}\s*=\s*readBlockConfig\s*\(/s;
    const match = source.match(configPattern);

    if (match) {
        const destructuring = match[1];

        // Parse each property in the destructuring
        // Pattern: 'config-key': variableName = 'default'
        const propertyPattern = /'([^']+)':\s*(\w+)\s*=?\s*([^,}]+)?/g;
        let propMatch;

        while ((propMatch = propertyPattern.exec(destructuring)) !== null) {
            const configKey = propMatch[1];
            const variableName = propMatch[2];
            let defaultValue = propMatch[3] ? propMatch[3].trim() : undefined;

            // Clean up default value
            if (defaultValue) {
                defaultValue = defaultValue.replace(/['"`]/g, '').trim();
                if (defaultValue === '') defaultValue = "''";
            }

            // Infer type from default value
            let type = 'string';
            if (defaultValue === 'true' || defaultValue === 'false') {
                type = 'boolean (as string)';
            } else if (defaultValue && !isNaN(defaultValue)) {
                type = 'number (as string)';
            } else if (!defaultValue || defaultValue === 'undefined') {
                type = 'string';
                defaultValue = defaultValue || 'undefined';
            }

            configs.push({
                key: configKey,
                variable: variableName,
                type,
                default: defaultValue,
                description: '', // Will be enriched from README if available
                required: defaultValue === 'undefined' ? 'Optional' : 'No',
                sideEffects: '' // Will be enriched from README if available
            });
        }
    }

    return configs;
}

/**
 * Enrich configuration with descriptions from README
 */
function enrichConfigFromReadme(configs, readmePath) {
    if (!existsSync(readmePath) || configs.length === 0) {
        return configs;
    }

    const readme = readFileSync(readmePath, 'utf8');

    // Extract configuration table from README
    const tablePattern = /\|\s*Configuration Key[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|([\s\S]*?)(?=\n\n|\n#|$)/;
    const match = readme.match(tablePattern);

    if (match) {
        const tableContent = match[1];
        const rows = tableContent.split('\n').filter(line => line.trim().startsWith('|'));

        const readmeConfigs = new Map();
        rows.forEach(row => {
            const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
            if (cells.length >= 4) {
                const [key, , , description, required, sideEffects] = cells;
                const cleanKey = key.replace(/`/g, '').trim();
                if (cleanKey && cleanKey !== '---' && !cleanKey.includes('---')) {
                    readmeConfigs.set(cleanKey, {
                        description: description?.trim() || '',
                        required: required?.replace(/`/g, '').trim() || 'No',
                        sideEffects: sideEffects?.trim() || ''
                    });
                }
            }
        });

        // Enrich source configs with README data
        configs.forEach(config => {
            const readmeData = readmeConfigs.get(config.key);
            if (readmeData) {
                config.description = readmeData.description || `Configuration for ${config.key}`;
                config.sideEffects = readmeData.sideEffects || '';
                if (readmeData.required && readmeData.required !== '-') {
                    config.required = readmeData.required;
                }
            } else {
                // Generate basic description from key if not in README
                config.description = `Configuration for ${config.key.replace(/-/g, ' ')}`;
            }
        });
    }

    return configs;
}

/**
 * Generate merchant-friendly description for a block
 */
function generateMerchantDescription(blockName) {
    const descriptions = {
        'cart': 'Configure the shopping cart page to display product details, pricing, and checkout options.',
        'checkout': 'Set up the checkout flow including shipping, payment, and order review.',
        'mini-cart': 'Configure the mini-cart dropdown that appears in your site header.',
        'product-details': 'Customize the product detail page layout and information display.',
        'product-list-page': 'Configure product listing pages and category views.',
        'wishlist': 'Set up the wishlist feature for customer saved items.',
        'orders-list': 'Configure the customer order history page.',
        'addresses': 'Set up customer address management.',
        'account-header': 'Configure the customer account header navigation.',
        'login': 'Customize the customer login page.',
        'create-account': 'Configure the account registration page.'
    };

    const key = blockName.replace('commerce-', '');
    return descriptions[key] || `Configure the ${blockName.replace('commerce-', '').replace(/-/g, ' ')} block for your store.`;
}

/**
 * Generate configuration tips for merchants
 */
function generateTips(blockName, configs) {
    const tips = [];

    if (configs.length > 0) {
        tips.push('Use document authoring to configure this block without writing code.');
        tips.push('Test configuration changes in preview before publishing to production.');
    }

    if (blockName.includes('cart') || blockName.includes('checkout')) {
        tips.push('Ensure your configuration matches your Adobe Commerce backend settings.');
    }

    if (blockName.includes('product')) {
        tips.push('Configure product attributes to match your catalog structure.');
    }

    return tips;
}

/**
 * Generate document authoring table with ALL configuration properties
 */
function generateExampleTable(blockName, configs) {
    if (configs.length === 0) {
        return '';
    }

    const displayName = blockName.replace('commerce-', '').split('-').map(w =>
        w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');

    let table = `### Document Authoring Format\n\n`;
    table += `Copy this table format into your document to configure the \`${blockName}\` block:\n\n`;
    table += `| ${displayName} |\n`;
    table += `| --- |\n`;

    // Show ALL configs (not just first 3)
    for (const config of configs) {
        const defaultValue = config.default === 'undefined' ? '' : config.default;
        table += `| ${config.key}: ${defaultValue} |\n`;
    }

    table += `\n<Aside type="tip">\nYou can add or remove any of these configuration options based on your needs. All options are optional unless marked as required.\n</Aside>\n`;

    return table;
}

// ============================================================================
// BLOCK EXTRACTION
// ============================================================================

/**
 * Extract commerce blocks from boilerplate
 */
function extractCommerceBlocks(boilerplatePath) {
    console.log('\n🔍 Analyzing commerce blocks...');

    const blocksDir = join(boilerplatePath, 'blocks');
    const blocks = [];

    if (!existsSync(blocksDir)) {
        console.log('  ⚠️  Blocks directory not found');
        return blocks;
    }

    const blockDirs = readdirSync(blocksDir).filter(name => {
        const path = join(blocksDir, name);
        return statSync(path).isDirectory();
    });

    for (const blockName of blockDirs) {
        // Only process commerce-related blocks
        if (!blockName.startsWith('commerce-') &&
            !blockName.includes('product') &&
            !blockName.includes('cart') &&
            !blockName.includes('checkout')) {
            continue;
        }

        const blockPath = join(blocksDir, blockName);
        const readmePath = join(blockPath, 'README.md');

        // Extract from source code (source of truth) then enrich with README
        let configs = extractConfigFromSource(blockPath, blockName);
        configs = enrichConfigFromReadme(configs, readmePath);

        blocks.push({
            name: blockName,
            displayName: blockName.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            path: blockPath,
            configs,
            hasReadme: existsSync(readmePath)
        });
    }

    console.log(`  ✓ Found ${blocks.length} commerce blocks`);
    return blocks;
}

// ============================================================================
// DOCUMENTATION GENERATION
// ============================================================================

/**
 * Generate merchant documentation for a single block
 */
function generateMerchantBlockDoc(block, outputDir) {
    const generationDate = formatDate(new Date());
    const description = generateMerchantDescription(block.name);
    const tips = generateTips(block.name, block.configs);
    const exampleTable = generateExampleTable(block.name, block.configs);

    let content = `---
title: ${block.displayName}
description: ${description}
sidebar:
  label: ${block.displayName}
---

import { Aside, Steps } from '@astrojs/starlight/components';

<Aside type="note">
Auto-generated on ${generationDate}. This block is part of the [AEM Commerce boilerplate](https://github.com/hlxsites/aem-boilerplate-commerce).
</Aside>

## Overview

${description}

This block integrates with Adobe Commerce to provide a seamless shopping experience for your customers.

`;

    // Add configuration section if available
    if (block.configs.length > 0) {
        content += `## Configuration Options

The following configuration options are available for this block:

| Option | Type | Default | Description | Required | Side Effects |
|--------|------|---------|-------------|----------|--------------|
`;

        for (const config of block.configs) {
            const key = config.key.replace(/`/g, '');
            const type = config.type.replace(/`/g, '');
            const defaultVal = config.default || '-';
            const desc = config.description;
            const req = config.required || '-';
            const side = config.sideEffects || '-';
            content += `| \`${key}\` | ${type} | ${defaultVal} | ${desc} | ${req} | ${side} |\n`;
        }

        content += '\n';

        // Add document authoring table with ALL properties
        if (exampleTable) {
            content += exampleTable + '\n';
        }
    } else {
        content += `## Configuration

This block uses default configuration. No additional configuration is required.

`;
    }

    // Add tips
    if (tips.length > 0) {
        content += `## Tips for Merchants\n\n`;
        for (const tip of tips) {
            content += `- ${tip}\n`;
        }
        content += '\n';
    }

    // Add related links
    content += `## Related Resources

- [Technical Documentation](/boilerplate/blocks/${block.name}/)
- [AEM Commerce Boilerplate](https://github.com/hlxsites/aem-boilerplate-commerce)
- [Edge Delivery Services](https://www.aem.live/docs/)
`;

    // Write file
    const outputPath = join(outputDir, 'blocks', `${block.name}.mdx`);
    ensureParentDirectoryExists(outputPath);
    writeFileSync(outputPath, content, 'utf8');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

try {
    console.log('\n' + '='.repeat(60));
    console.log('  MERCHANT BLOCK DOCUMENTATION GENERATOR');
    console.log('='.repeat(60));

    // Clone/update boilerplate
    const boilerplatePath = cloneBoilerplate();

    // Extract blocks
    const blocks = extractCommerceBlocks(boilerplatePath);

    // Generate documentation
    const outputDir = join(projectRoot, 'src', 'content', 'docs', 'merchants');

    console.log('\n📝 Generating merchant block documentation...');
    let blockCount = 0;
    for (const block of blocks) {
        generateMerchantBlockDoc(block, outputDir);
        blockCount++;
    }
    console.log(`  ✅ Generated ${blockCount} block docs`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Generation Summary:\n');
    console.log(`✅ Commerce blocks: ${blocks.length}`);
    console.log(`📄 Total pages: ${blocks.length}`);

    console.log('\n📝 Generated Documentation:\n');
    console.log(`   📂 /merchants/blocks/`);
    blocks.forEach(block => {
        console.log(`      📄 ${block.name}.mdx`);
    });

    console.log('\n✨ Merchant block documentation generation complete!\n');

} catch (error) {
    console.error('\n❌ Error generating merchant block documentation:');
    console.error(`   ${error.message}`);
    console.error(`\n${error.stack}`);
    process.exit(1);
}
