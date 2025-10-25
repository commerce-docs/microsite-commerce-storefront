/**
 * General Utility Functions
 * 
 * Common utility functions used across all documentation generators.
 * Includes file operations, string manipulation, and other helpers.
 */

import { existsSync, mkdirSync, readdirSync } from 'fs';
import { dirname } from 'path';

/**
 * Ensure a directory exists, creating it if necessary
 * 
 * @param {string} dirPath - Path to directory
 */
export function ensureDirectoryExists(dirPath) {
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Ensure parent directory exists for a file path
 * 
 * @param {string} filePath - Path to file
 */
export function ensureParentDirectoryExists(filePath) {
    const dir = dirname(filePath);
    ensureDirectoryExists(dir);
}

/**
 * Check if a path exists
 * 
 * @param {string} path - Path to check
 * @returns {boolean} True if path exists
 */
export function pathExists(path) {
    return existsSync(path);
}

/**
 * Get all files in a directory
 * 
 * @param {string} dirPath - Directory path
 * @param {boolean} recursive - Whether to search recursively
 * @returns {Array<string>} Array of file names
 */
export function getFilesInDirectory(dirPath, recursive = false) {
    if (!existsSync(dirPath)) {
        return [];
    }

    const files = [];
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isFile()) {
            files.push(entry.name);
        } else if (entry.isDirectory() && recursive) {
            const subFiles = getFilesInDirectory(
                `${dirPath}/${entry.name}`,
                true
            ).map(f => `${entry.name}/${f}`);
            files.push(...subFiles);
        }
    }

    return files;
}

/**
 * Get all directories in a path
 * 
 * @param {string} dirPath - Directory path
 * @returns {Array<string>} Array of directory names
 */
export function getDirectoriesInPath(dirPath) {
    if (!existsSync(dirPath)) {
        return [];
    }

    return readdirSync(dirPath, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
}

/**
 * Convert string to kebab-case
 * 
 * @param {string} str - String to convert
 * @returns {string} Kebab-cased string
 * 
 * @example
 * toKebabCase('getUserToken') // 'get-user-token'
 * toKebabCase('User Account') // 'user-account'
 */
export function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Convert string to camelCase
 * 
 * @param {string} str - String to convert
 * @returns {string} CamelCased string
 * 
 * @example
 * toCamelCase('get-user-token') // 'getUserToken'
 * toCamelCase('user account') // 'userAccount'
 */
export function toCamelCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
        .replace(/^(.)/, (_, c) => c.toLowerCase());
}

/**
 * Capitalize first letter of a string
 * 
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a date as YYYY-MM-DD
 * 
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Formatted date string
 */
export function formatDate(date = new Date()) {
    return date.toISOString().split('T')[0];
}

/**
 * Pluralize a word based on count
 * 
 * @param {string} word - Word to pluralize
 * @param {number} count - Count
 * @param {string} plural - Optional custom plural form
 * @returns {string} Pluralized word
 */
export function pluralize(word, count, plural = null) {
    if (count === 1) {
        return word;
    }
    return plural || `${word}s`;
}

/**
 * Truncate text to a maximum length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Clean version string (remove ~ ^ etc)
 * 
 * @param {string} version - Version string (e.g., '^1.0.0')
 * @returns {string} Clean version string (e.g., '1.0.0')
 */
export function cleanVersion(version) {
    return version.replace(/^[\^~]/, '');
}

/**
 * Parse command-line arguments
 * 
 * @returns {Object} Parsed arguments object
 */
export function parseCommandLineArgs() {
    const args = process.argv.slice(2);
    const parsed = {
        positional: [],
        flags: {}
    };

    for (const arg of args) {
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            parsed.flags[key] = value !== undefined ? value : true;
        } else if (arg.startsWith('-')) {
            parsed.flags[arg.substring(1)] = true;
        } else {
            parsed.positional.push(arg);
        }
    }

    return parsed;
}

