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
import { generateNoDictionaryPage } from './lib/markdown/empty-state-generator.js';
import { groupBySections, generateDictionaryTable, generateUsageExample, getDictionaryStats } from './lib/dictionary-processor.js';

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
    // If no dictionary found, use empty state generator
    if (!dictionaryData || !dictionaryData.content) {
        return generateNoDictionaryPage({
            dropinDisplayName: repoConfig.displayName,
            version
        });
    }

    // Parse the JSON
    const json = JSON.parse(dictionaryData.content);

    // Group into sections
    const sections = groupBySections(json);
    const stats = getDictionaryStats(json);

    // Generate sections content
    let sectionsContent = '';

    for (const section of sections) {
        sectionsContent += `### ${section.displayName}\n\n`;
        sectionsContent += `**Namespace**: \`${section.name}\`\n\n`;
        sectionsContent += generateDictionaryTable(section.keys);
        sectionsContent += '\n\n';
    }

    // Generate usage example using first section's keys
    const usageExample = sections.length > 0
        ? generateUsageExample(repoConfig.packageName, sections[0].keys)
        : '';

    // Generate full JSON block for download option
    // Escape curly braces to prevent MDX interpretation
    const escapedJson = dictionaryData.content
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}');

    const fullJsonBlock = `\`\`\`json title="en_US.json" showLineNumbers
${escapedJson}
\`\`\`

<Aside type="note">
**Download tip**: Copy the entire JSON above, save it as \`custom-en_US.json\`, then modify the values you need. You can also [view this file in the source repository](${repoConfig.gitUrl.replace('.git', '')}/blob/main/src/i18n/en_US.json).
</Aside>`;

    const template = readTemplate('dropin-dictionary.mdx');

    // Replace placeholders
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_PACKAGE': repoConfig.packageName,
        'DROPIN_VERSION': cleanVersion(version),
        'SECTIONS_CONTENT': sectionsContent,
        'USAGE_EXAMPLE': usageExample,
        'FULL_JSON_BLOCK': fullJsonBlock,
        'REPO_URL': repoConfig.gitUrl.replace('.git', ''),
        'KEY_COUNT': stats.totalKeys.toString(),
        'SECTION_COUNT': stats.totalSections.toString()
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
