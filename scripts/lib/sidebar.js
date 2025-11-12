/**
 * Sidebar Navigation Management Module
 * 
 * Utilities for updating the Astro configuration sidebar navigation.
 * Handles automatic insertion of documentation pages into the appropriate
 * locations in the navigation structure.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

/**
 * Insert a sidebar entry after a reference entry
 * 
 * @param {string} dropinName - Name of the drop-in (e.g., 'cart')
 * @param {string} repoConfig - Repository configuration with type and displayName
 * @param {string} entryLabel - Label for the new entry (e.g., 'Functions', 'Events')
 * @param {string} referenceLabel - Label of the entry to insert after (e.g., 'Slots')
 * @param {string} referencePath - Optional custom path for reference (defaults to /${referenceLabel.toLowerCase()}/)
 * @returns {boolean} True if successful, false if entry already exists or reference not found
 * 
 * @example
 * insertSidebarEntry('cart', repoConfig, 'Functions', 'Slots');
 * // Inserts Functions entry after Slots entry for cart drop-in
 */
export function insertSidebarEntry(dropinName, repoConfig, entryLabel, referenceLabel = null, referencePath = null) {
    const configPath = join(projectRoot, 'astro.config.mjs');
    const config = readFileSync(configPath, 'utf8');

    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    const entryPath = `/${basePath}/${dropinName}/${entryLabel.toLowerCase()}/`;
    const sidebarEntry = `{ label: '${entryLabel}', link: '${entryPath}' },`;

    // Check if the entry already exists
    const entryPattern = new RegExp(`label:\\s*'${entryLabel}',\\s*link:\\s*'${entryPath}'`);
    if (entryPattern.test(config)) {
        console.log(`  ℹ️  Sidebar entry already exists for ${repoConfig.displayName} ${entryLabel}`);
        return false;
    }

    // If no reference label provided, just report that manual addition is needed
    if (!referenceLabel) {
        console.log(`  ℹ️  Sidebar entry can be added manually for ${repoConfig.displayName} ${entryLabel}`);
        return false;
    }

    // Build reference path - use custom path if provided, otherwise build from label
    const refPath = referencePath || `/${basePath}/${dropinName}/${referenceLabel.toLowerCase()}/`;

    // Find the reference entry and insert after it
    const referencePattern = new RegExp(
        `(\\{\\s*label:\\s*'${referenceLabel}',\\s*link:\\s*'${refPath.replace(/\//g, '\\/')}'\\s*\\},)`,
        'i'
    );

    const match = config.match(referencePattern);
    if (match) {
        const updated = config.replace(
            referencePattern,
            `$1\n                          ${sidebarEntry}`
        );
        writeFileSync(configPath, updated);
        console.log(`  ✅ Added sidebar entry for ${repoConfig.displayName} ${entryLabel}`);
        return true;
    }

    // Reference not found
    console.log(`  ℹ️  Could not find reference entry '${referenceLabel}' for ${repoConfig.displayName}`);
    return false;
}

/**
 * Update sidebar navigation for functions
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarForFunctions(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Functions', 'Slots');
}

/**
 * Update sidebar navigation for events
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarForEvents(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Events', 'Functions');
}

/**
 * Update sidebar navigation for slots
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarForSlots(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Slots', 'Functions');
}

/**
 * Update sidebar navigation for containers
 * 
 * Note: Container entries are manually maintained in the collapsible groups
 * within astro.config.mjs. We don't auto-add a standalone "Containers" link
 * to avoid duplicates.
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarForContainers(dropinName, repoConfig) {
    // Don't add standalone Containers link - it's part of the collapsible groups
    console.log(`  ℹ️  Sidebar entry for ${repoConfig.displayName} Containers is manually maintained`);
    return true;
}

/**
 * Update sidebar navigation for dictionary
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarForDictionary(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Dictionary', 'Containers');
}

/**
 * Update sidebar navigation for installation
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarForInstallation(dropinName, repoConfig) {
    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    // Overview links to root (e.g., /dropins/cart/), not /dropins/cart/overview/
    const overviewPath = `/${basePath}/${dropinName}/`;
    return insertSidebarEntry(dropinName, repoConfig, 'Installation', 'Overview', overviewPath);
}

/**
 * Update sidebar navigation for initialization
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarForInitialization(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Initialization', 'Installation'); // After Installation
}

/**
 * Check if a sidebar entry exists
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {string} repoConfig - Repository configuration with type
 * @param {string} entryLabel - Label to check for
 * @returns {boolean} True if entry exists
 */
export function sidebarEntryExists(dropinName, repoConfig, entryLabel) {
    const configPath = join(projectRoot, 'astro.config.mjs');
    const config = readFileSync(configPath, 'utf8');

    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    const entryPath = `/${basePath}/${dropinName}/${entryLabel.toLowerCase()}/`;

    const entryPattern = new RegExp(`label:\\s*'${entryLabel}',\\s*link:\\s*'${entryPath}'`);
    return entryPattern.test(config);
}

