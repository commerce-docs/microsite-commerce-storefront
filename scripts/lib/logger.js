/**
 * Standardized Logging Utilities for Documentation Generators
 * 
 * Provides consistent console output formatting across all generators.
 * Helps maintain uniform user experience and makes logging patterns testable.
 */

import { DROPIN_REPOS } from './dropin-config.js';

/**
 * Standardized logger with consistent formatting
 */
export const logger = {
    /**
     * Print generator header
     * @param {string} name - Generator name (e.g., 'Functions', 'Events')
     */
    header(name) {
        console.log(`🚀 ${name} Documentation Generator`);
        console.log('=====================================\n');
    },

    /**
     * Log processing all drop-ins
     * @param {number} count - Number of drop-ins to process
     */
    processingAll(count) {
        console.log(`📦 Processing all ${count} drop-ins\n`);
    },

    /**
     * Log processing single drop-in
     * @param {string} name - Drop-in name
     */
    processingSingle(name) {
        console.log(`🎯 Processing single drop-in: ${name}\n`);
    },

    /**
     * Log starting to process a drop-in
     * @param {string} displayName - Human-readable drop-in name
     */
    processingDropin(displayName) {
        console.log(`\n📦 Processing ${displayName}...`);
    },

    /**
     * Log skipping a drop-in
     * @param {string} packageName - Package name
     * @param {string} reason - Optional reason for skipping
     */
    skipping(packageName, reason = null) {
        console.log(`  ⚠️  Skipping: ${packageName} not found in boilerplate`);
        if (reason) {
            console.log(`     ${reason}`);
        }
        console.log('');
    },

    /**
     * Log enrichment data loaded
     * @param {number} count - Number of enriched items
     * @param {string} type - Type of items (e.g., 'functions', 'events')
     */
    enrichmentLoaded(count, type) {
        console.log(`  📚 Loaded enrichment data for ${count} ${type}`);
    },

    /**
     * Log scanning repository
     * @param {string} type - Type being scanned (e.g., 'functions', 'events')
     */
    scanning(type) {
        console.log(`  🔍 Scanning for ${type}...`);
    },

    /**
     * Log items found
     * @param {number} count - Number of items found
     * @param {string} type - Type of items
     */
    found(count, type) {
        console.log(`  ✓ Found ${count} ${type}`);
    },

    /**
     * Log no items found with warning
     * @param {string} type - Type of items
     */
    noneFound(type) {
        console.log(`  ⚠️  No ${type} found - generating placeholder page`);
    },

    /**
     * Log file generated
     * @param {string} path - File path
     */
    generated(path) {
        console.log(`  ✅ Generated ${path}`);
    },

    /**
     * Log view URL for single drop-in
     * @param {string} url - URL path to view
     */
    viewAt(url) {
        console.log(`  📄 View at: ${url}`);
        console.log(`     (Start dev server with 'npm run dev' if not already running)`);
    },

    /**
     * Log boilerplate loaded
     */
    boilerplateLoaded() {
        console.log(`\n📦 Loaded package versions from boilerplate\n`);
    },

    /**
     * Log completion message
     * @param {string} type - Generator type
     */
    complete(type) {
        console.log(`\n✨ ${type} documentation generation complete!\n`);
    },

    /**
     * Log error processing a drop-in
     * @param {string} name - Drop-in name
     * @param {string} message - Error message
     */
    error(name, message) {
        console.error(`  ❌ Error processing ${name}: ${message}\n`);
    },

    /**
     * Log error for drop-in not found with available list
     * @param {string} name - Drop-in name that wasn't found
     */
    errorNotFound(name) {
        console.error(`❌ Error: Drop-in "${name}" not found.\n`);
        console.log('Available drop-ins:');
        Object.keys(DROPIN_REPOS).forEach(dropinName => {
            console.log(`  - ${dropinName}`);
        });
    },

    /**
     * Log a blank line (for spacing)
     */
    blank() {
        console.log('');
    }
};

