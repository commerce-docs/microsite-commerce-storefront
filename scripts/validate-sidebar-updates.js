#!/usr/bin/env node

/**
 * Sidebar Update Validator
 * 
 * Validates that generated documentation pages have corresponding sidebar entries
 * in astro.config.mjs. This prevents the common issue where generators create pages
 * but fail to update the sidebar configuration.
 * 
 * USAGE:
 *   node scripts/validate-sidebar-updates.js [page-path]
 *   node scripts/validate-sidebar-updates.js --all
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const configPath = join(projectRoot, 'astro.config.mjs');

/**
 * Escape a string for use in a regular expression
 * @param {string} string
 * @returns {string}
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a page path has a corresponding sidebar entry
 * 
 * @param {string} pagePath - Page path (e.g., '/dropins/order/quick-start/')
 * @returns {boolean} True if sidebar entry exists
 */
function hasSidebarEntry(pagePath) {
    if (!existsSync(configPath)) {
        console.error(`❌ Config file not found: ${configPath}`);
        return false;
    }

    const config = readFileSync(configPath, 'utf8');

    // Remove leading/trailing slashes and normalize
    const normalizedPath = pagePath.replace(/^\/|\/$/g, '');

    // Create regex pattern to match sidebar entry
    // Matches: { label: '...', link: '/path/to/page/' }
    const pattern = new RegExp(
        `link:\\s*['"]/${escapeRegExp(normalizedPath)}/['"]`,
        'i'
    );

    return pattern.test(config);
}

/**
 * Extract all generated page paths from a directory
 * 
 * @param {string} docsDir - Documentation directory
 * @returns {Array} Array of page paths
 */
function extractPagePaths(docsDir) {
    // This would scan the docs directory and extract all .mdx file paths
    // For now, return empty array - can be enhanced later
    return [];
}

/**
 * Validate a single page path
 * 
 * @param {string} pagePath - Page path to validate
 * @returns {boolean} True if sidebar entry exists
 */
export function validatePage(pagePath) {
    const hasEntry = hasSidebarEntry(pagePath);

    if (hasEntry) {
        console.log(`✅ ${pagePath} - Sidebar entry found`);
        return true;
    } else {
        console.log(`❌ ${pagePath} - Missing sidebar entry`);
        return false;
    }
}

/**
 * Main execution
 */
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Sidebar Update Validator

Validates that generated documentation pages have corresponding sidebar entries.

USAGE:
  node scripts/validate-sidebar-updates.js <page-path>
  node scripts/validate-sidebar-updates.js --all

EXAMPLES:
  node scripts/validate-sidebar-updates.js /dropins/order/quick-start/
  node scripts/validate-sidebar-updates.js /dropins/personalization/quick-start/
    `);
    process.exit(0);
}

if (args[0] === '--all') {
    console.log('🔍 Validating all generated pages...\n');
    // TODO: Implement full directory scan
    console.log('⚠️  Full directory scan not yet implemented');
    console.log('   Use: node scripts/validate-sidebar-updates.js <page-path>');
    process.exit(1);
}

// Validate single page path
const pagePath = args[0];
const isValid = validatePage(pagePath);

process.exit(isValid ? 0 : 1);

