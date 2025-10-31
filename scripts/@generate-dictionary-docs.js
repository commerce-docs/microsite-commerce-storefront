#!/usr/bin/env node

/**
 * Dictionary Documentation Generator
 *
 * This script generates dictionary documentation for drop-in components by:
 * 1. Reading i18n/en_US.json files from source repositories
 * 2. Generating MDX documentation with the full JSON content
 * 3. Formatting it in a code block for easy reference
 *
 * USAGE:
 * - Generate all drop-ins: npm run generate-dictionary-docs
 * - Generate single drop-in: npm run generate-dictionary-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, company-management
 *
 * OUTPUT: Single dictionary.mdx file per drop-in
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadDictionaryEnrichments } from './lib/enrichment.js';
import { updateSidebarForDictionary } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';

const projectRoot = getProjectRoot();

// ============================================================================
// UNIQUE SCANNING LOGIC
// ============================================================================

/**
 * Find dictionary file in repository
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {string|null} Dictionary file path or null if not found
 */
function findDictionaryFile(repoPath) {
    // Look for i18n/en_US.json in common locations
    const possiblePaths = [
        join(repoPath, 'src', 'i18n', 'en_US.json'),
        join(repoPath, 'i18n', 'en_US.json'),
        join(repoPath, 'src', 'lang', 'en_US.json'),
        join(repoPath, 'lang', 'en_US.json')
    ];

    for (const path of possiblePaths) {
        if (existsSync(path)) {
            return path;
        }
    }

    return null;
}

/**
 * Scan repository for dictionary file
 * 
 * @param {string} repoPath - Path to the repository
 * @returns {Object|null} Dictionary data with content and count
 */
function scanForDictionary(repoPath) {
    const dictionaryPath = findDictionaryFile(repoPath);

    if (!dictionaryPath) {
        return null;
    }

    try {
        const content = readFileSync(dictionaryPath, 'utf8');
        const json = JSON.parse(content);

        // Count the number of keys (for logging)
        const keyCount = JSON.stringify(json).split(':').length - 1;

        return {
            content: JSON.stringify(json, null, 2),
            keyCount,
            count: keyCount // For framework logging
        };
    } catch (error) {
        return null;
    }
}

// ============================================================================
// UNIQUE GENERATION LOGIC
// ============================================================================

/**
 * Generate dictionary MDX documentation
 * 
 * @param {string} repoName - Drop-in name
 * @param {Object} repoConfig - Repository configuration
 * @param {Object} dictionaryData - Dictionary data with content
 * @param {string} version - Drop-in version
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string} Generated MDX content
 */
function generateDictionaryMDX(repoName, repoConfig, dictionaryData, version, enrichmentData = null) {
    const template = readTemplate('dropin-dictionary.mdx');

    // If no dictionary found, generate placeholder page
    let dictionaryJson = '';
    if (!dictionaryData || !dictionaryData.content) {
        dictionaryJson = '{\n  "placeholder": "No dictionary file found in this drop-in"\n}';
    } else {
        dictionaryJson = dictionaryData.content;
    }

    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_PACKAGE': repoConfig.packageName,
        'DROPIN_VERSION': cleanVersion(version),
        'DICTIONARY_JSON': dictionaryJson,
        'REPO_URL': repoConfig.gitUrl.replace('.git', ''),
        'KEY_COUNT': dictionaryData?.keyCount?.toString() || '0'
    });
}

// ============================================================================
// FRAMEWORK INTEGRATION
// ============================================================================

runGenerator({
    name: 'Dictionary',
    itemType: 'dictionary keys',
    loadEnrichments: loadDictionaryEnrichments,
    scanRepo: scanForDictionary,
    generateContent: generateDictionaryMDX,
    updateSidebar: updateSidebarForDictionary,
    outputFileName: 'dictionary.mdx'
});
