/**
 * Sidebar Navigation Management Module
 * 
 * Utilities for updating the Astro configuration sidebar navigation.
 * Handles automatic insertion of documentation pages into the appropriate
 * locations in the navigation structure.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
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
    // Convert label to kebab-case for URL (e.g., "Quick Start" -> "quick-start")
    const entryPath = `/${basePath}/${dropinName}/${entryLabel.toLowerCase().replace(/\s+/g, '-')}/`;
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
        `(\\{\\s*label:\\s*'${referenceLabel}',\\s*link:\\s*'${refPath.replace(/\\/g, '\\\\').replace(/\//g, '\\/')}'\\s*\\},)`,
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
    const configPath = join(projectRoot, 'astro.config.mjs');
    let config = readFileSync(configPath, 'utf8');

    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    const containersDir = join(projectRoot, 'src/content/docs', basePath, dropinName, 'containers');

    // Check if containers directory exists
    if (!existsSync(containersDir)) {
        console.log(`  ℹ️  No containers directory found for ${repoConfig.displayName}`);
        return false;
    }

    // Get all container files except index.mdx
    const containerFiles = readdirSync(containersDir)
        .filter(file => file.endsWith('.mdx') && file !== 'index.mdx')
        .sort();

    if (containerFiles.length === 0) {
        console.log(`  ℹ️  No container files to add to sidebar for ${repoConfig.displayName}`);
        return false;
    }

    // Convert filenames to PascalCase labels (e.g., 'items-quoted.mdx' -> 'ItemsQuoted')
    const containerEntries = containerFiles.map(file => {
        const name = file.replace('.mdx', '');
        const label = name.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');
        const link = `/${basePath}/${dropinName}/containers/${name}/`;
        return { label, link };
    });

    // Find the dropin section in the sidebar
    const dropinPattern = new RegExp(
        `(label:\\s*'${repoConfig.displayName}',\\s*collapsed:\\s*\\w+,\\s*items:\\s*\\[)([\\s\\S]*?)(\\]\\s*,\\s*}\\s*,\\s*\\{\\s*label:)`,
        'm'
    );

    const match = config.match(dropinPattern);
    if (!match) {
        console.log(`  ⚠️  Could not find ${repoConfig.displayName} section in sidebar`);
        return false;
    }

    const [fullMatch, beforeItems, itemsContent, afterItems] = match;

    // Check if Containers section already exists
    const containersPattern = /\{\s*label:\s*'Containers',\s*collapsed:\s*\w+,\s*items:\s*\[[\s\S]*?\],\s*\}/;
    const hasContainersSection = containersPattern.test(itemsContent);

    if (hasContainersSection) {
        // Update existing Containers section
        const updatedItems = itemsContent.replace(
            containersPattern,
            (containersMatch) => {
                // Build the new containers items list
                const items = [
                    `{ label: 'Overview', link: '/${basePath}/${dropinName}/containers/' }`,
                    ...containerEntries.map(entry => `{ label: '${entry.label}', link: '${entry.link}' }`)
                ].join(',\n                              ');

                return `{
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              ${items},
                            ],
                          }`;
            }
        );

        const newConfig = config.replace(fullMatch, beforeItems + updatedItems + afterItems);
        writeFileSync(configPath, newConfig, 'utf8');
        console.log(`  ✅ Updated Containers section with ${containerEntries.length} containers for ${repoConfig.displayName}`);
        return true;
    } else {
        // Containers section doesn't exist - create it
        // Find where to insert (after Dictionary or Styles, before the closing bracket)
        const insertAfterPattern = /(label:\s*'(?:Dictionary|Styles)',\s*link:.*?\},)/;
        const insertMatch = itemsContent.match(insertAfterPattern);

        if (!insertMatch) {
            console.log(`  ⚠️  Could not find insertion point for Containers section`);
            return false;
        }

        const items = [
            `{ label: 'Overview', link: '/${basePath}/${dropinName}/containers/' }`,
            ...containerEntries.map(entry => `{ label: '${entry.label}', link: '${entry.link}' }`)
        ].join(',\n                              ');

        const containersSection = `
                          {
                            label: 'Containers',
                            collapsed: false,
                            items: [
                              ${items},
                            ],
                          },`;

        const updatedItems = itemsContent.replace(
            insertAfterPattern,
            `$1${containersSection}`
        );

        const newConfig = config.replace(fullMatch, beforeItems + updatedItems + afterItems);
        writeFileSync(configPath, newConfig, 'utf8');
        console.log(`  ✅ Added Containers section with ${containerEntries.length} containers for ${repoConfig.displayName}`);
        return true;
    }
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
 * Update sidebar navigation for quick start pages
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarForInstallation(dropinName, repoConfig) {
    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';
    // Overview links to root (e.g., /dropins/cart/), not /dropins/cart/overview/
    const overviewPath = `/${basePath}/${dropinName}/`;
    return insertSidebarEntry(dropinName, repoConfig, 'Quick Start', 'Overview', overviewPath);
}

/**
 * Update sidebar navigation for initialization
 * 
 * @param {string} dropinName - Name of the drop-in
 * @param {Object} repoConfig - Repository configuration
 * @returns {boolean} True if successful
 */
export function updateSidebarForInitialization(dropinName, repoConfig) {
    return insertSidebarEntry(dropinName, repoConfig, 'Initialization', 'Quick Start'); // After Quick Start
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
    // Convert label to kebab-case for URL (e.g., "Quick Start" -> "quick-start")
    const entryPath = `/${basePath}/${dropinName}/${entryLabel.toLowerCase().replace(/\s+/g, '-')}/`;

    const entryPattern = new RegExp(`label:\\s*'${entryLabel}',\\s*link:\\s*'${entryPath}'`);
    return entryPattern.test(config);
}

