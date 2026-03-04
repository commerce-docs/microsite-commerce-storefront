/**
 * Event Documentation Extractor
 *
 * Extracts event descriptions from existing events.mdx files.
 * Used by the event generator to compare existing vs generated descriptions
 * and apply the Richer Description Rule.
 */

import { readFileSync, existsSync } from 'fs';

/**
 * Extract event descriptions from an events.mdx file.
 * Parses ### `eventName` (direction) sections and captures the description
 * (text between the heading and the next #### or ###).
 *
 * @param {string} filePath - Path to events.mdx
 * @returns {Map<string, string>} Map of eventName -> description (trimmed)
 */
export function extractExistingEventDescriptions(filePath) {
    const result = new Map();
    if (!filePath || !existsSync(filePath)) return result;

    const content = readFileSync(filePath, 'utf-8');

    // Match ### `eventName` (direction) followed by description until #### or ###
    const pattern = /### `([^`]+)` \([^)]+\)\s*\n\n([\s\S]*?)(?=\n#### |\n### |$)/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
        const eventName = match[1];
        let description = match[2].trim();
        // Strip Aside blocks (e.g. Planned Event) - they're not part of the semantic description
        description = description.replace(/<Aside[^>]*>[\s\S]*?<\/Aside>/g, '').trim();
        if (description.length > 0) {
            result.set(eventName, description);
        }
    }

    return result;
}
