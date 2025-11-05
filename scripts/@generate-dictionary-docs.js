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
/**
 * Extract a realistic example from the dictionary for the customization guide
 * Recursively finds string values to create a meaningful example
 */
/**
 * Create a simple custom value to demonstrate customization
 */
function createCustomValue(defaultValue, key) {
    return 'Custom string';
}

function generateCustomizationExample(dictionaryJson) {
    try {
        const parsed = JSON.parse(dictionaryJson);
        const topLevelKey = Object.keys(parsed)[0]; // e.g., "Cart", "PaymentServices"

        if (!topLevelKey || !parsed[topLevelKey]) {
            return null;
        }

        const componentKey = Object.keys(parsed[topLevelKey])[0]; // e.g., "MiniCart", "CreditCard"
        if (!componentKey || !parsed[topLevelKey][componentKey]) {
            return null;
        }

        // Recursively find string values to create example
        const exampleObj = {};
        exampleObj[topLevelKey] = {};
        exampleObj[topLevelKey][componentKey] = {};

        const componentData = parsed[topLevelKey][componentKey];
        let foundCount = 0;
        const maxKeys = 2;

        // Helper to recursively find string values
        function findStringValues(obj, path = []) {
            if (foundCount >= maxKeys) return;

            for (const key of Object.keys(obj)) {
                if (foundCount >= maxKeys) break;

                const value = obj[key];

                if (typeof value === 'string' && value.trim() !== '') {
                    // Build nested structure in example
                    let target = exampleObj[topLevelKey][componentKey];
                    for (const pathKey of path) {
                        if (!target[pathKey]) target[pathKey] = {};
                        target = target[pathKey];
                    }
                    // Create realistic alternative values that would make sense in the UI
                    target[key] = createCustomValue(value, key);
                    foundCount++;
                } else if (typeof value === 'object' && value !== null) {
                    // Recurse into nested objects
                    findStringValues(value, [...path, key]);
                }
            }
        }

        findStringValues(componentData);

        // Return formatted JSON if we found any values
        if (foundCount > 0) {
            // Return plain JSON - template will use it in export statement
            return JSON.stringify(exampleObj, null, 2);
        }

        return null;

    } catch (error) {
        return null;
    }
}

function generateDictionaryMDX(repoName, repoConfig, dictionaryData, versionInfo, enrichmentData = null) {
    const template = readTemplate('dropin-dictionary.mdx');

    // If no dictionary found, generate placeholder page
    let dictionaryJson = '';
    let customExample = null;

    if (!dictionaryData || !dictionaryData.content) {
        dictionaryJson = '{\n  "placeholder": "No dictionary file found in this drop-in"\n}';
    } else {
        dictionaryJson = dictionaryData.content;
        customExample = generateCustomizationExample(dictionaryJson);
    }

    // If we couldn't generate a realistic example, use a generic one
    if (!customExample) {
        customExample = `{
    "${repoConfig.displayName}": {
      "Component": {
        "heading": "My Custom Heading",
        "buttonText": "Click Me"
      }
    }
  }`;
    }

    // Convert kebab-case to camelCase for variable name
    const camelCaseKey = repoName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const dictionaryVarName = `${camelCaseKey}Dictionary`;

    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_KEY': repoName,  // kebab-case key for filenames
        'DROPIN_VAR': dictionaryVarName,  // camelCase variable name
        'DROPIN_PACKAGE': repoConfig.packageName,
        'DROPIN_VERSION': cleanVersion(versionInfo.requested),
        'DICTIONARY_JSON': dictionaryJson,
        'CUSTOM_EXAMPLE': customExample,
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
