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

// Import shared utilities
import { getProjectRoot } from './lib/generator-core.js';
import { ensureParentDirectoryExists, formatDate } from './lib/utils.js';
import { cloneOrUpdateBoilerplate } from './lib/repository.js';

const projectRoot = getProjectRoot();

// ============================================================================
// CONFIGURATION EXTRACTION
// ============================================================================

/**
 * Extract configuration from block README
 */
function extractConfigFromReadme(readmePath) {
    if (!existsSync(readmePath)) {
        return [];
    }

    const readme = readFileSync(readmePath, 'utf8');
    const configs = [];

    // Extract configuration table
    const tablePattern = /\|\s*Configuration Key[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|([\s\S]*?)(?=\n\n|\n#|$)/;
    const match = readme.match(tablePattern);

    if (match) {
        const tableContent = match[1];
        const rows = tableContent.split('\n').filter(line => line.trim().startsWith('|'));

        rows.forEach(row => {
            const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
            if (cells.length >= 4) {
                const [key, type, defaultValue, description] = cells;
                if (key && key !== '---' && !key.includes('---')) {
                    configs.push({
                        key: key.replace(/`/g, '').trim(),
                        type: type.replace(/`/g, '').trim(),
                        default: defaultValue.replace(/`/g, '').trim(),
                        description: description.trim(),
                        required: cells[4]?.toLowerCase().includes('yes') || false
                    });
                }
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
 * Generate example configuration table
 */
function generateExampleTable(blockName, configs) {
    if (configs.length === 0) {
        return '';
    }

    const displayName = blockName.replace('commerce-', '').split('-').map(w =>
        w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');

    let table = `### Example Configuration\n\n`;
    table += `Create a \`${blockName}\` block in your document with this configuration:\n\n`;
    table += `| ${displayName} |\n`;
    table += `| --- |\n`;

    // Show first few configs as examples
    const exampleConfigs = configs.slice(0, Math.min(3, configs.length));
    for (const config of exampleConfigs) {
        table += `| ${config.key}: ${config.default || 'value'} |\n`;
    }

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

        const configs = extractConfigFromReadme(readmePath);

        blocks.push({
            name: blockName,
            displayName: blockName.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            sidebarLabel: blockName.replace('commerce-', '').split('-').map(word =>
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

    const sidebarLabel = block.sidebarLabel || block.displayName;
    let content = `---
title: ${block.displayName}
description: ${description}
sidebar:
  label: ${sidebarLabel}
---

import { Steps } from '@astrojs/starlight/components';

## Overview

${description}

This block integrates with Adobe Commerce to provide a seamless shopping experience for your customers.

`;

    // Add configuration section if available
    if (block.configs.length > 0) {
        content += `## Configuration Options

The following configuration options are available for this block:

| Option | Type | Default | Required | Description |
|--------|------|---------|----------|-------------|
`;

        for (const config of block.configs) {
            const key = config.key.replace(/`/g, '');
            const type = config.type.replace(/`/g, '');
            const defaultVal = config.default || '-';
            const required = config.required ? 'Yes' : 'No';
            const desc = config.description;
            content += `| \`${key}\` | ${type} | ${defaultVal} | ${required} | ${desc} |\n`;
        }

        content += '\n';

        // Add example table
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

    // Clone/update boilerplate using shared function
    const { path: boilerplatePath } = cloneOrUpdateBoilerplate();

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
