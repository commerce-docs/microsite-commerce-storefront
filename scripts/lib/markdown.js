/**
 * Markdown/MDX Generation Helpers
 * 
 * Utilities for working with MDX templates and generating Markdown content.
 * Provides consistent formatting and template processing across generators.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

/**
 * Read a template file from the _dropin-templates directory
 * 
 * @param {string} templateName - Name of the template file (e.g., 'dropin-functions.mdx')
 * @returns {string} Template content
 */
export function readTemplate(templateName) {
    const templatePath = join(projectRoot, '_dropin-templates', templateName);
    return readFileSync(templatePath, 'utf8');
}

/**
 * Replace placeholders in template content
 * 
 * @param {string} content - Template content with placeholders
 * @param {Object} replacements - Object mapping placeholder names to values
 * @returns {string} Content with placeholders replaced
 * 
 * @example
 * const content = replacePlaceholders(template, {
 *   'DROPIN_NAME': 'Cart',
 *   'DROPIN_DISPLAY_NAME': 'Cart',
 *   'VERSION': '1.0.0'
 * });
 */
export function replacePlaceholders(content, replacements) {
    let result = content;

    for (const [placeholder, value] of Object.entries(replacements)) {
        // Create case-insensitive regex for the placeholder
        const regex = new RegExp(placeholder, 'gi');
        result = result.replace(regex, value);
    }

    return result;
}

/**
 * Replace content between markers in an MDX file
 * 
 * Used to update specific sections (like tables) in generated documentation
 * while preserving surrounding content.
 * 
 * @param {string} content - Full MDX content
 * @param {string} startMarker - Start marker comment (e.g., {/* TABLE_START *\})
 * @param {string} endMarker - End marker comment (e.g., {/* TABLE_END *\})
 * @param {string} newContent - Content to insert between markers
 * @returns {string} Updated content
 */
export function replaceContentBetweenMarkers(content, startMarker, endMarker, newContent) {
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
        throw new Error(`Could not find markers: ${startMarker} and ${endMarker}`);
    }

    const before = content.substring(0, startIndex + startMarker.length);
    const after = content.substring(endIndex);

    return `${before}\n${newContent}\n${after}`;
}

/**
 * Generate a version badge for MDX
 * 
 * @param {string} version - Version string (e.g., '1.0.0')
 * @returns {string} MDX for version badge
 */
export function generateVersionBadge(version) {
    return `<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${version}</strong>
</div>`;
}

/**
 * Generate auto-generation notice
 * 
 * @param {string} date - Date string (e.g., '2025-01-20')
 * @returns {string} MDX for auto-generation notice
 */
export function generateAutoGenNotice(date = null) {
    const dateStr = date || new Date().toISOString().split('T')[0];
    return `<Aside type="note" title="Auto-generated on ${dateStr}. Do not edit this page directly." />`;
}

/**
 * Convert camelCase or kebab-case to Title Case
 * 
 * @param {string} str - String to convert
 * @returns {string} Title cased string
 * 
 * @example
 * toTitleCase('getUserToken') // 'Get User Token'
 * toTitleCase('user-account') // 'User Account'
 */
export function toTitleCase(str) {
    // Handle kebab-case
    if (str.includes('-')) {
        return str.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Handle camelCase
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

/**
 * Escape special characters for MDX
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeMDX(text) {
    return text
        .replace(/\\/g, '\\\\')        // Escape backslashes FIRST
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Generate a table of contents from headings
 * 
 * @param {Array<{level: number, text: string, anchor: string}>} headings - Array of heading objects
 * @returns {string} Markdown TOC
 */
export function generateTOC(headings) {
    return headings
        .map(h => {
            const indent = '  '.repeat(h.level - 2);
            return `${indent}- [${h.text}](#${h.anchor})`;
        })
        .join('\n');
}

