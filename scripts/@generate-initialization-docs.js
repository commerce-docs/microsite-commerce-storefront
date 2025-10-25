#!/usr/bin/env node

/**
 * Initialization Documentation Generator
 *
 * Generates comprehensive initialization documentation for each drop-in by:
 * 1. Extracting ConfigProps from initialize.ts files
 * 2. Identifying available models from data/models directories
 * 3. Parsing TypeScript types and JSDoc comments
 * 4. Creating accurate configuration examples
 *
 * USAGE:
 * - Generate all drop-ins: npm run generate-initialization-docs
 * - Generate single drop-in: npm run generate-initialization-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, personalization, company-management
 *
 * OUTPUT: Single initialization.mdx file per drop-in
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadInitializationEnrichments } from './lib/enrichment.js';
import { updateSidebarForInitialization } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders, escapeMDX } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================

/**
 * Extract configuration properties from initialize.ts
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of config property objects
 */
function extractConfigProps(repoPath) {
    // Try common locations for initialize.ts
    const possiblePaths = [
        join(repoPath, 'src', 'api', 'initialize', 'initialize.ts'),
        join(repoPath, 'src', 'api', 'initialize.ts'),
        join(repoPath, 'src', 'initialize.ts'),
    ];

    let initializeContent = null;
    for (const path of possiblePaths) {
        if (existsSync(path)) {
            initializeContent = readFileSync(path, 'utf8');
            break;
        }
    }

    if (!initializeContent) {
        return [];
    }

    // Extract ConfigProps type definition
    const configPropsMatch = initializeContent.match(/type\s+ConfigProps\s*=\s*\{([^}]*)\}/s);
    if (!configPropsMatch) {
        return [];
    }

    const propsContent = configPropsMatch[1];
    const propLines = propsContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));

    const customOptions = [];
    for (const line of propLines) {
        const propMatch = line.match(/(\w+)\??:\s*([^;,]+)/);
        if (propMatch) {
            const [, propName, propType] = propMatch;
            customOptions.push({
                name: propName.trim(),
                type: propType.trim(),
                description: generateDescription(propName.trim(), propType.trim())
            });
        }
    }

    return customOptions;
}

/**
 * Generate description for a config property
 * 
 * @param {string} propName - Property name
 * @param {string} propType - Property type
 * @returns {string} Generated description
 */
function generateDescription(propName, propType) {
    const name = propName.toLowerCase();

    if (name.includes('model')) return 'Custom data models for type transformations';
    if (name.includes('lang')) return 'Language definitions for internationalization';
    if (name.includes('endpoint')) return 'API endpoint configuration';
    if (name.includes('url')) return 'Service URL configuration';
    if (name.includes('token')) return 'Authentication token';
    if (name.includes('auth')) return 'Authentication configuration';
    if (name.includes('header')) return 'Custom HTTP headers';
    if (name.includes('timeout')) return 'Request timeout in milliseconds';
    if (name.includes('retry')) return 'Retry configuration for failed requests';
    if (name.includes('cache')) return 'Caching configuration';

    if (propType.includes('boolean')) return `Enable or disable ${propName}`;
    if (propType.includes('number')) return `Numeric value for ${propName}`;
    if (propType.includes('string')) return `String value for ${propName}`;

    return `Configuration for ${propName}`;
}

/**
 * Extract model names from data/models directory
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Array} Array of model names
 */
function extractModelNames(repoPath) {
    const modelsDir = join(repoPath, 'data', 'models');

    if (!existsSync(modelsDir)) {
        return [];
    }

    try {
        const files = readdirSync(modelsDir);
        return files
            .filter(file => file.endsWith('.ts') && !file.includes('index'))
            .map(file => file.replace('.ts', ''));
    } catch (error) {
        return [];
    }
}

/**
 * Generate options table markdown
 * 
 * @param {Array} customOptions - Array of custom config options
 * @returns {string} Markdown table
 */
function generateOptionsTable(customOptions) {
    const standardOptions = [
        { name: 'langDefinitions', type: 'LangDefinitions', description: 'Language definitions for internationalization' },
        { name: 'models', type: 'Record<string, any>', description: 'Custom data models for type transformations' }
    ];

    const allOptions = [...standardOptions, ...customOptions];

    let table = '| Option | Type | Description |\n';
    table += '|--------|------|-------------|\n';

    for (const option of allOptions) {
        const name = escapeMDX(option.name);
        const type = escapeMDX(option.type);
        const desc = escapeMDX(option.description);
        table += `| \`${name}\` | \`${type}\` | ${desc} |\n`;
    }

    return table;
}

/**
 * Scan repository for initialization data
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Object} Initialization data with config options and models
 */
function scanForInitialization(repoPath) {
    const configProps = extractConfigProps(repoPath);
    const models = extractModelNames(repoPath);

    return {
        configProps,
        models,
        count: configProps.length + models.length // For logging
    };
}

// ============================================================================
// UNIQUE GENERATION LOGIC
// ============================================================================

/**
 * Generate initialization MDX documentation
 * 
 * @param {string} repoName - Drop-in name
 * @param {Object} repoConfig - Repository configuration
 * @param {Object} initData - Initialization data
 * @param {string} version - Drop-in version
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string} Generated MDX content
 */
function generateInitializationMDX(repoName, repoConfig, initData, version, enrichmentData = null) {
    const template = readTemplate('dropin-initialization.mdx');

    const { configProps, models } = initData;

    // Generate options table
    const optionsTable = generateOptionsTable(configProps);

    // Pick first model for example, or use a generic placeholder
    const modelExample = models.length > 0 ? models[0] : 'CustomModel';

    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_PACKAGE': repoConfig.packageName,
        'DROPIN_VERSION': cleanVersion(version),
        'CONFIG_OPTIONS': optionsTable,
        'MODEL_NAME': modelExample,
        'MODEL_COUNT': models.length.toString(),
        'CONFIG_COUNT': configProps.length.toString(),
        'REPO_URL': repoConfig.gitUrl.replace('.git', '')
    });
}

// ============================================================================
// FRAMEWORK INTEGRATION
// ============================================================================

runGenerator({
    name: 'Initialization',
    itemType: 'configuration options',
    loadEnrichments: loadInitializationEnrichments,
    scanRepo: scanForInitialization,
    generateContent: generateInitializationMDX,
    updateSidebar: updateSidebarForInitialization,
    outputFileName: 'initialization.mdx'
});
