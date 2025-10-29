/**
 * Reference Documentation Helper
 * 
 * Provides utilities for accessing and linking to external reference documentation.
 * Used in enrichment files and generators to create consistent links.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load reference documentation configuration
 * @returns {Object} Reference docs configuration
 */
export function loadReferenceConfig() {
    try {
        const configPath = join(__dirname, '../../reference-docs.json');
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        return config.references;
    } catch (error) {
        console.error('Failed to load reference-docs.json:', error.message);
        return {};
    }
}

/**
 * Get a reference URL by source and topic key
 * @param {string} source - The documentation source (e.g., 'aem-live')
 * @param {string} topicKey - The topic key (e.g., 'authoring', 'block-collection')
 * @returns {string|null} The URL or null if not found
 */
export function getReferenceUrl(source, topicKey) {
    const config = loadReferenceConfig();

    if (!config[source]) {
        console.warn(`Reference source '${source}' not found`);
        return null;
    }

    const topic = config[source].topics[topicKey];
    if (!topic) {
        console.warn(`Topic '${topicKey}' not found in '${source}'`);
        return null;
    }

    return topic.url;
}

/**
 * Get topic information including title and description
 * @param {string} source - The documentation source
 * @param {string} topicKey - The topic key
 * @returns {Object|null} Topic info or null if not found
 */
export function getReferenceTopic(source, topicKey) {
    const config = loadReferenceConfig();

    if (!config[source]) {
        return null;
    }

    return config[source].topics[topicKey] || null;
}

/**
 * Create a markdown link to a reference topic
 * @param {string} source - The documentation source
 * @param {string} topicKey - The topic key
 * @param {string} [linkText] - Optional custom link text (uses topic title if not provided)
 * @returns {string} Markdown formatted link
 */
export function createReferenceLink(source, topicKey, linkText = null) {
    const topic = getReferenceTopic(source, topicKey);

    if (!topic) {
        return `[${linkText || topicKey}](#)`;
    }

    const text = linkText || topic.title;
    return `[${text}](${topic.url})`;
}

/**
 * Get all topics for a reference source
 * @param {string} source - The documentation source
 * @returns {Object} All topics for the source
 */
export function getAllTopics(source) {
    const config = loadReferenceConfig();
    return config[source]?.topics || {};
}

/**
 * Search for topics by keyword
 * @param {string} source - The documentation source
 * @param {string} keyword - Search keyword
 * @returns {Array} Array of matching topics
 */
export function searchTopics(source, keyword) {
    const topics = getAllTopics(source);
    const results = [];
    const lowerKeyword = keyword.toLowerCase();

    for (const [key, topic] of Object.entries(topics)) {
        if (
            key.toLowerCase().includes(lowerKeyword) ||
            topic.title.toLowerCase().includes(lowerKeyword) ||
            topic.description.toLowerCase().includes(lowerKeyword)
        ) {
            results.push({ key, ...topic });
        }
    }

    return results;
}

/**
 * List all available reference sources
 * @returns {Array} Array of source names
 */
export function listSources() {
    const config = loadReferenceConfig();
    return Object.keys(config);
}

/**
 * Display reference information (for CLI)
 */
export function displayReferenceInfo() {
    const config = loadReferenceConfig();

    console.log('\n📚 Available Reference Documentation Sources:\n');

    for (const [sourceKey, source] of Object.entries(config)) {
        console.log(`\n${source.name}`);
        console.log(`  Base URL: ${source.base_url}`);
        console.log(`  Description: ${source.description}`);
        console.log(`  Topics: ${Object.keys(source.topics).length}`);
    }

    console.log('\n💡 Usage Examples:');
    console.log('  - Import: import { getReferenceUrl } from "./scripts/lib/reference-docs.js"');
    console.log('  - Get URL: getReferenceUrl("aem-live", "authoring")');
    console.log('  - Create Link: createReferenceLink("aem-live", "block-collection")');
    console.log('  - Search: searchTopics("aem-live", "security")');
    console.log('');
}

