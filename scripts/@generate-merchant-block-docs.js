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
 * - Generate all merchant block docs: npm run generate-merchant-docs
 *
 * OUTPUT: Multiple MDX files in src/content/docs/merchants/blocks/
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync, execFileSync } from 'child_process';

// Import shared utilities
import { getProjectRoot } from './lib/generator-core.js';
import { ensureParentDirectoryExists } from './lib/utils.js';

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
        console.log('  Using existing boilerplate repository...');
        // Skip git pull to avoid network/certificate issues - existing repo is sufficient
    }

    return boilerplatePath;
}

// ============================================================================
// CONFIGURATION EXTRACTION
// ============================================================================

/**
 * Extract configuration from block JavaScript source code
 * Parses multiple patterns:
 * 1. Direct destructuring: const { 'key': var = 'default' } = readBlockConfig(block)
 * 2. Variable assignment: const config = readBlockConfig(block); then access config.key
 * 3. Nested destructuring: const config = readBlockConfig(block); const { key } = config
 */
function extractConfigFromSource(blockPath, blockName) {
    const jsPath = join(blockPath, `${blockName}.js`);

    if (!existsSync(jsPath)) {
        console.log(`  ⚠️  JavaScript file not found: ${jsPath}`);
        return [];
    }

    const source = readFileSync(jsPath, 'utf8');
    const configs = [];
    const configKeys = new Set();

    // Pattern 1: Direct destructuring from readBlockConfig
    // const { 'key': var = 'default', 'key2': var2 } = readBlockConfig(block)
    const directDestructurePattern = /const\s*\{([^}]+)\}\s*=\s*readBlockConfig\s*\(/s;
    const directMatch = source.match(directDestructurePattern);

    if (directMatch) {
        const destructuring = directMatch[1];

        // Parse each property in the destructuring
        // Pattern 1: 'config-key': variableName = 'default' (quoted keys)
        // Pattern 2: variableName = 'default' (unquoted keys, variable name is the key)
        // Pattern 3: variableName (no default)

        // First try quoted keys: 'key': var = 'default'
        const quotedPropertyPattern = /'([^']+)':\s*(\w+)\s*=?\s*([^,}]+)?/g;
        let propMatch;

        while ((propMatch = quotedPropertyPattern.exec(destructuring)) !== null) {
            const configKey = propMatch[1];
            const variableName = propMatch[2];
            let defaultValue = propMatch[3] ? propMatch[3].trim() : undefined;

            if (!configKeys.has(configKey)) {
                configKeys.add(configKey);
                configs.push(extractConfigProperty(configKey, variableName, defaultValue));
            }
        }

        // Then try unquoted keys: variableName = 'default' or just variableName
        // Only if we haven't already processed this key
        const unquotedPropertyPattern = /(\w+)\s*=?\s*([^,}]+)?/g;
        let unquotedMatch;

        // Reset regex lastIndex to start from beginning
        unquotedPropertyPattern.lastIndex = 0;

        while ((unquotedMatch = unquotedPropertyPattern.exec(destructuring)) !== null) {
            const variableName = unquotedMatch[1];
            let defaultValue = unquotedMatch[2] ? unquotedMatch[2].trim() : undefined;

            // Skip if this looks like a quoted key pattern (already processed)
            // Check if the previous character was a quote
            const matchIndex = unquotedMatch.index;
            if (matchIndex > 0 && destructuring[matchIndex - 1] === "'") {
                continue;
            }

            // Use variable name as config key (convert camelCase to kebab-case)
            const configKey = variableName.replace(/([A-Z])/g, '-$1').toLowerCase();

            if (!configKeys.has(configKey) && !configKeys.has(variableName)) {
                configKeys.add(configKey);
                configKeys.add(variableName); // Also track variable name to avoid duplicates
                configs.push(extractConfigProperty(configKey, variableName, defaultValue));
            }
        }
    }

    // Pattern 2: Variable assignment then property access
    // const config = readBlockConfig(block);
    // Then find: config['key'] or config.key or const { key } = config
    const configVarPattern = /const\s+(\w+)\s*=\s*readBlockConfig\s*\([^)]*\)/;
    const configVarMatch = source.match(configVarPattern);

    if (configVarMatch && !directMatch) {
        const configVarName = configVarMatch[1];

        // Find nested destructuring FIRST (most reliable): const { key, key2 } = config
        const nestedDestructurePattern = new RegExp(`const\\s*\\{([^}]+)\\}\s*=\\s*${configVarName}\\s*;`, 'g');
        let nestedMatch;

        while ((nestedMatch = nestedDestructurePattern.exec(source)) !== null) {
            const nestedProps = nestedMatch[1];
            const nestedPropPattern = /(\w+)\s*=?\s*([^,}]+)?/g;
            let nestedPropMatch;

            while ((nestedPropMatch = nestedPropPattern.exec(nestedProps)) !== null) {
                const configKey = nestedPropMatch[1];
                let defaultValue = nestedPropMatch[2] ? nestedPropMatch[2].trim() : undefined;

                // Clean up default value - remove any trailing comments or code
                if (defaultValue) {
                    defaultValue = defaultValue.split('//')[0].trim(); // Remove comments
                    defaultValue = defaultValue.split(';')[0].trim(); // Remove semicolons
                }

                if (!configKeys.has(configKey)) {
                    configKeys.add(configKey);
                    configs.push(extractConfigProperty(configKey, configKey, defaultValue));
                }
            }
        }

        // Only if no nested destructuring found, try property access patterns
        // But be very careful - only match simple property accesses, not complex expressions
        if (configs.length === 0) {
            // Find simple property accesses: config.key or config['key'] (but not in complex expressions)
            // Look for standalone property accesses, not ones inside function calls or complex expressions
            const simplePropertyPattern = new RegExp(`${configVarName}\\.(\\w+)|${configVarName}\\s*\\[\\s*['"](\\w+)['"]\\s*\\]`, 'g');
            let accessMatch;
            const foundKeys = new Set();

            while ((accessMatch = simplePropertyPattern.exec(source)) !== null) {
                const configKey = accessMatch[1] || accessMatch[2];

                // Only add if it looks like a simple property access (not part of a complex expression)
                // Check context - should be followed by semicolon, newline, or simple operators
                const matchEnd = accessMatch.index + accessMatch[0].length;
                const afterMatch = source.substring(matchEnd, matchEnd + 10);

                // Only accept if followed by simple patterns (semicolon, newline, ||, &&, etc.)
                if (configKey &&
                    !foundKeys.has(configKey) &&
                    (afterMatch.match(/^\s*[;,\n\|&]|^\s*$/) || afterMatch.trim() === '')) {
                    foundKeys.add(configKey);
                    if (!configKeys.has(configKey)) {
                        configKeys.add(configKey);
                        const defaultValue = findDefaultValue(source, configKey, configVarName);
                        configs.push(extractConfigProperty(configKey, configKey, defaultValue));
                    }
                }
            }
        }
    }

    return configs;
}

/**
 * Extract a single configuration property with type inference
 */
function extractConfigProperty(configKey, variableName, defaultValue) {
    // Clean up default value
    let cleanDefault = defaultValue;
    if (cleanDefault) {
        cleanDefault = cleanDefault.replace(/['"`]/g, '').trim();
        if (cleanDefault === '') cleanDefault = "''";
    }

    // Infer type from default value (author-friendly types)
    let type = 'string';
    if (cleanDefault === 'true' || cleanDefault === 'false') {
        type = 'boolean';
    } else if (cleanDefault && !isNaN(cleanDefault)) {
        type = 'number';
    } else if (!cleanDefault || cleanDefault === 'undefined') {
        // Check variable name patterns for better type inference
        if (variableName.toLowerCase().includes('enable') ||
            variableName.toLowerCase().includes('hide') ||
            variableName.toLowerCase().includes('show')) {
            type = 'boolean';
        } else if (variableName.toLowerCase().includes('max') ||
            variableName.toLowerCase().includes('min') ||
            variableName.toLowerCase().includes('count') ||
            variableName.toLowerCase().includes('items')) {
            type = 'number';
        } else {
            type = 'string';
        }
        cleanDefault = cleanDefault || 'undefined';
    }

    return {
        key: configKey,
        variable: variableName,
        type,
        default: cleanDefault,
        description: '', // Will be enriched from README if available
        required: cleanDefault === 'undefined' ? 'Optional' : 'No',
        sideEffects: '' // Will be enriched from README if available
    };
}

/**
 * Find default value for a config key from source code
 */
function findDefaultValue(source, configKey, configVarName) {
    // Escape special regex characters in configKey
    const escapedKey = configKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Look for: const key = config['key'] || 'default' or config.key || 'default'
    const defaultPattern = new RegExp(`${configVarName}\\s*[\\[.]${escapedKey}[\\]]?\\s*\\|\\|\\s*([^;\\n]+)`, 'i');
    const match = source.match(defaultPattern);
    if (match) {
        return match[1].trim().replace(/['"`]/g, '');
    }
    return undefined;
}

/**
 * Extract configuration properties from README (primary source of truth)
 * README files contain a "Block Configuration" table with all properties
 */
function extractConfigFromReadme(readmePath) {
    if (!existsSync(readmePath)) {
        return [];
    }

    const readme = readFileSync(readmePath, 'utf8');
    const configs = [];

    // Find the "Block Configuration" section and extract the table
    // Pattern: looks for "Block Configuration" heading followed by a markdown table
    const blockConfigPattern = /(?:##\s+Block\s+Configuration|###\s+Block\s+Configuration)[\s\S]*?\|\s*Configuration\s+Key[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|([\s\S]*?)(?=\n\n|\n##|\n###|$)/i;
    const match = readme.match(blockConfigPattern);

    if (!match) {
        return [];
    }

    const tableContent = match[1];
    const rows = tableContent.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('|') &&
            !trimmed.match(/^\|\s*-+\s*\|/) && // Skip separator rows
            trimmed !== '|'; // Skip empty rows
    });

    for (const row of rows) {
        const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);

        // Expected columns: Configuration Key | Type | Default | Description | Required | Side Effects
        if (cells.length >= 4) {
            const key = cells[0].replace(/`/g, '').trim();
            const type = cells[1]?.trim() || 'string';
            const defaultValue = cells[2]?.trim() || 'undefined';
            const description = cells[3]?.trim() || '';
            const required = cells[4]?.replace(/`/g, '').trim() || 'No';
            const sideEffects = cells[5]?.trim() || '';

            // Skip header rows and invalid keys
            if (key &&
                key !== 'Configuration Key' &&
                !key.toLowerCase().includes('configuration') &&
                !key.match(/^-+$/)) {

                // Clean default value
                let cleanDefault = defaultValue.replace(/`/g, '').trim();
                if (cleanDefault === '' || cleanDefault === 'undefined') {
                    cleanDefault = 'undefined';
                }

                // Infer type if not specified
                let inferredType = type.toLowerCase();
                if (cleanDefault === 'true' || cleanDefault === 'false') {
                    inferredType = 'boolean';
                } else if (cleanDefault && !isNaN(cleanDefault) && cleanDefault !== 'undefined') {
                    inferredType = 'number';
                } else if (!inferredType || inferredType === 'string' || inferredType === '') {
                    inferredType = 'string';
                }

                configs.push({
                    key: key,
                    variable: key.replace(/-/g, ''), // Convert kebab-case to variable name
                    type: inferredType,
                    default: cleanDefault,
                    description: description,
                    required: required === 'Yes' || required === 'Required' ? 'Yes' : 'No',
                    sideEffects: sideEffects
                });
            }
        }
    }

    return configs;
}

/**
 * Enrich configuration with descriptions from README (legacy function, kept for compatibility)
 */
function enrichConfigFromReadme(configs, readmePath) {
    // This function is now deprecated - use extractConfigFromReadme instead
    // Keeping for backward compatibility but it should not be called
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
 * Convert kebab-case to Title Case (matching AEM document authoring format)
 * e.g., "enable-item-quantity-update" -> "Enable Item Quantity Update"
 */
function toTitleCase(str) {
    return str.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Format value for AEM document authoring
 * Shows example values for empty properties based on property name and type
 */
function formatValueForAEM(value, type, propertyKey) {
    if (value === '' || value === 'undefined' || value === "''") {
        // Show example values based on property name and type
        let example = '';
        const keyLower = propertyKey.toLowerCase();

        // Number-like properties (even if stored as string in AEM)
        // Check property name patterns first, before type check
        if (keyLower.includes('max') || keyLower.includes('min') ||
            keyLower.includes('count') || keyLower.includes('items') ||
            keyLower.includes('limit') || keyLower.includes('quantity') ||
            keyLower.includes('number') || keyLower.includes('size') ||
            keyLower.includes('amount') || keyLower.includes('total')) {
            example = '10';
        }
        // Attribute-related properties (check before ID to avoid false matches)
        else if (keyLower.includes('attributes') || keyLower.includes('attribute')) {
            example = 'color, size';
        }
        // SKU-related properties
        else if (keyLower.includes('sku') || keyLower.includes('currentsku')) {
            example = 'ABC-123';
        }
        // ID-related properties (check after attributes to avoid false matches)
        else if (keyLower.includes('id') || keyLower.includes('recid') || keyLower.includes('reqid')) {
            example = 'rec-12345';
        }
        // URL-related properties
        else if (keyLower.includes('url') || keyLower.includes('link') || keyLower.includes('path')) {
            example = '/path/to/page';
        }
        // Name or title properties
        else if (keyLower.includes('name') || keyLower.includes('title')) {
            example = 'Example Name';
        }
        // Number type (explicit)
        else if (type === 'number') {
            example = '10';
        }
        // Boolean type
        else if (type === 'boolean') {
            example = 'true';
        }
        // Default string
        else {
            example = 'value';
        }

        return `<em style="color: var(--sl-color-gray-3); font-style: italic;">${example} <span style="font-size: 0.85em;">(example)</span></em>`;
    }
    return value;
}

/**
 * Generate section metadata table for document authoring
 * Shows common section styling options available to all blocks
 */
function generateSectionMetadataTable() {
    let output = `## Section Metadata\n\n`;
    output += `Control the section styling that wraps your commerce block using the section metadata table:\n\n`;

    // Table with full-width responsive layout
    output += `<table style="width: 100%; min-width: 470px; max-width: 100%; table-layout: fixed; border-collapse: collapse;">\n`;
    output += `<tbody>\n`;

    // First row: section-metadata label
    output += `<tr>\n`;
    output += `<td colspan="2" style="text-align: center; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5); background-color: var(--sl-color-gray-6); font-weight: 600;">Section Metadata</td>\n`;
    output += `</tr>\n`;

    // Style row
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Style</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);"><em style="color: var(--sl-color-gray-3); font-style: italic;">light, highlight <span style="font-size: 0.85em;">(optional)</span></em></td>\n`;
    output += `</tr>\n`;

    output += `</tbody>\n`;
    output += `</table>\n\n`;

    output += `<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0 2rem 0;">\n`;
    output += `<strong>Learn more:</strong> See the <a href="/merchants/storefront-builder/section-metadata/">Section Metadata guide</a> for complete styling options and the <a href="/merchants/storefront-builder/page-metadata/">Page Metadata guide</a> for SEO, caching, and social sharing options.\n`;
    output += `</div>\n\n`;

    return output;
}

/**
 * Generate page metadata table for document authoring
 * Used for blocks that need page-level metadata (robots, cache-control, title)
 */
function generateMetadataTable(blockName, blockDisplayName) {
    // Only generate metadata table for specific blocks that need it
    const blocksWithMetadata = ['commerce-checkout', 'commerce-cart', 'commerce-login', 'commerce-create-account', 'commerce-addresses'];

    if (!blocksWithMetadata.includes(blockName)) {
        return '';
    }

    // Determine metadata values based on block type
    let robots = '';
    let cacheControl = '';
    let title = blockDisplayName;
    let template = '';

    if (blockName === 'commerce-checkout') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Checkout';
    } else if (blockName === 'commerce-cart') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = 'Cart';
    } else if (blockName === 'commerce-login' || blockName === 'commerce-create-account') {
        robots = 'noindex, nofollow';
        cacheControl = 'no-store';
        title = blockDisplayName.replace('Commerce ', '');
    } else if (blockName === 'commerce-addresses') {
        robots = 'noindex, nofollow';
        title = 'Addresses';
        template = 'Addresses, Columns';
    }

    let output = `## Page Metadata\n\n`;
    output += `Configure page-level metadata in the document authoring table below:\n\n`;

    // Table with full-width responsive layout
    output += `<table style="width: 100%; min-width: 470px; max-width: 100%; table-layout: fixed; border-collapse: collapse;">\n`;
    output += `<tbody>\n`;

    // First row: metadata label
    output += `<tr>\n`;
    output += `<td colspan="2" style="text-align: center; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5); background-color: var(--sl-color-gray-6); font-weight: 600;">metadata</td>\n`;
    output += `</tr>\n`;

    // Title row (always present)
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Title</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${title}</td>\n`;
    output += `</tr>\n`;

    // Template row (only for addresses)
    if (template) {
        output += `<tr>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Template</td>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${template}</td>\n`;
        output += `</tr>\n`;
    }

    // Robots row
    output += `<tr>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Robots</td>\n`;
    output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${robots}</td>\n`;
    output += `</tr>\n`;

    // Cache-Control row (only for checkout, cart, login, create-account)
    if (cacheControl) {
        output += `<tr>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">Cache-Control</td>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${cacheControl}</td>\n`;
        output += `</tr>\n`;
    }

    output += `</tbody>\n`;
    output += `</table>\n\n`;

    return output;
}

/**
 * Generate document authoring configuration table
 * Matches exact AEM format: Title Case properties
 */
function generateDocumentAuthoringTable(blockName, configs) {
    if (configs.length === 0) {
        return '';
    }

    let output = `## Document Authoring Configuration\n\n`;
    output += `Modify the values in the second column to customize the block's behavior. You can remove any rows for properties you don't need to configure.\n\n`;

    // Table with full-width responsive layout
    output += `<table style="width: 100%; min-width: 470px; max-width: 100%; table-layout: fixed; border-collapse: collapse;">\n`;
    output += `<tbody>\n`;

    // First row: block name only (single cell, centered)
    output += `<tr>\n`;
    output += `<td colspan="2" style="text-align: center; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5); background-color: var(--sl-color-gray-6); font-weight: 600;">${blockName}</td>\n`;
    output += `</tr>\n`;

    // Property rows: Title Case names and formatted values with examples
    for (const config of configs) {
        const titleCaseName = toTitleCase(config.key);
        const formattedValue = formatValueForAEM(config.default, config.type, config.key);
        output += `<tr>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${titleCaseName}</td>\n`;
        output += `<td style="width: 50%; padding: 0.75rem; border: 1px solid var(--sl-color-gray-5);">${formattedValue}</td>\n`;
        output += `</tr>\n`;
    }

    output += `</tbody>\n`;
    output += `</table>\n\n`;

    return output;
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

        // README is the source of truth - extract from README first, then validate/enrich from source code
        let configs = extractConfigFromReadme(readmePath);

        // If README doesn't have config table, fall back to source code extraction
        if (configs.length === 0) {
            configs = extractConfigFromSource(blockPath, blockName);
        } else {
            // Enrich README configs with any additional properties found in source code
            const sourceConfigs = extractConfigFromSource(blockPath, blockName);
            const readmeKeys = new Set(configs.map(c => c.key));

            // Add any source configs not already in README
            for (const sourceConfig of sourceConfigs) {
                if (!readmeKeys.has(sourceConfig.key)) {
                    configs.push(sourceConfig);
                }
            }
        }

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
 * Get boilerplate version from git tag
 */
function getBoilerplateVersion(boilerplatePath) {
    try {
        const tag = execSync('git describe --tags --abbrev=0', {
            cwd: boilerplatePath,
            encoding: 'utf8'
        }).trim();
        // Remove 'v' prefix if present
        return tag.replace(/^v/, '');
    } catch (error) {
        // Fallback: try to get from package.json
        try {
            const packageJsonPath = join(boilerplatePath, 'package.json');
            if (existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
                return packageJson.version || 'latest';
            }
        } catch {
            return 'latest';
        }
        return 'latest';
    }
}

/**
 * Generate merchant documentation for a single block
 */
function generateMerchantBlockDoc(block, outputDir, boilerplateVersion) {
    const description = generateMerchantDescription(block.name);
    const tips = generateTips(block.name, block.configs);
    const documentAuthoringTable = generateDocumentAuthoringTable(block.name, block.configs);
    const metadataTable = generateMetadataTable(block.name, block.displayName);
    const sectionMetadataTable = generateSectionMetadataTable();

    const sidebarLabel = block.sidebarLabel || block.displayName;
    let content = `---
title: ${block.displayName}
description: ${description}
sidebar:
  label: ${sidebarLabel}
---

import TableWrapper from '@components/TableWrapper.astro';

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${boilerplateVersion}</strong>
</div>

## Overview

${description}

This block integrates with Adobe Commerce to provide a seamless shopping experience for your customers.

`;

    // Add page metadata table (for blocks that need it)
    if (metadataTable) {
        content += metadataTable;
    }

    // Add document authoring table (most useful for merchants)
    if (block.configs.length > 0) {
        content += documentAuthoringTable;
    }

    // Add section metadata table (available for all blocks)
    content += sectionMetadataTable;

    // Add detailed configuration options reference table
    if (block.configs.length > 0) {
        content += `## Configuration Properties Reference\n\n`;
        content += `The table below describes each configuration property in detail:\n\n`;
        content += `<TableWrapper nowrap={[0]}>\n\n`;
        content += `| Property | Default | Req? | Description |\n`;
        content += `|----------|---------|------|-------------|\n`;

        for (const config of block.configs) {
            const key = config.key.replace(/`/g, '');
            // Show blank for undefined or empty string defaults
            const defaultVal = (config.default && config.default !== 'undefined' && config.default !== "''") ? config.default : '';
            const desc = config.description;
            const req = config.required || '-';
            const side = config.sideEffects || '-';

            // Ensure description ends with a period
            let descText = desc.trim();
            if (descText && !descText.match(/[.!?]$/)) {
                descText += '.';
            }

            // Only combine with side effects if they provide different information
            let combinedDesc = descText;
            if (side && side !== '-') {
                let sideText = side.trim();
                // Check if side effects are substantially different from description
                // (not just a rewording of the same information)
                const descWords = new Set(descText.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/));
                const sideWords = new Set(sideText.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/));

                // Count unique words in side effects
                const uniqueSideWords = [...sideWords].filter(word => !descWords.has(word) && word.length > 3);

                // Only add side effects if they contain substantial new information (5+ unique meaningful words)
                // This stricter threshold helps avoid semantic redundancy
                if (uniqueSideWords.length >= 5) {
                    if (sideText && !sideText.match(/[.!?]$/)) {
                        sideText += '.';
                    }
                    combinedDesc = `${descText} ${sideText}`;
                }
            }

            content += `| \`${key}\` | ${defaultVal} | ${req} | ${combinedDesc} |\n`;
        }

        content += `\n</TableWrapper>\n\n`;
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
    const boilerplateVersion = getBoilerplateVersion(boilerplatePath);
    let blockCount = 0;
    for (const block of blocks) {
        generateMerchantBlockDoc(block, outputDir, boilerplateVersion);
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
