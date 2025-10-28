/**
 * Example Extractor
 * 
 * Extracts real-world usage examples from drop-in repositories and boilerplate projects.
 * This ensures examples are always accurate, up-to-date, and verified working code.
 * 
 * CRITICAL WORKFLOW DEPENDENCY:
 * This module assumes repositories are already cloned at the correct versions.
 * It MUST be called AFTER generator-core.js has:
 *   1. Cloned/updated the boilerplate
 *   2. Read package versions from boilerplate's package.json
 *   3. Cloned each drop-in at the specific tagged version
 * 
 * VERSION MANAGEMENT:
 * - Boilerplate: .temp-repos/boilerplate (main branch, latest)
 * - Drop-ins: .temp-repos/{repoName} (tagged version from boilerplate)
 * 
 * PRIORITY ORDER:
 *   1. JSDoc @example tags (highest priority - developer documented)
 *   2. Drop-in HTML examples (examples/html-host/index.html)
 *   3. Boilerplate blocks (blocks/*​/*.js)
 *   4. Enrichment files (fallback only)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get project root (same pattern as other lib modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

/**
 * Normalize code indentation - parse and re-indent with consistent spacing
 * Makes all code start at column 0 with proper 2-space indentation
 * 
 * @param {string} code - Code to normalize
 * @returns {string} Properly indented code starting at column 0
 */
function normalizeIndentation(code) {
    const lines = code.split('\n');

    // First pass: remove ALL leading whitespace  
    const dedented = lines.map(line => line.trim()).filter(line => line.length > 0);

    // Second pass: re-indent based on bracket depth
    let depth = 0;
    const reindented = [];

    dedented.forEach(line => {
        // Decrease depth BEFORE line if it starts with closing bracket
        if (line.startsWith('}') || line.startsWith(']') || line.startsWith(')')) {
            depth = Math.max(0, depth - 1);
        }

        // Add line with current indentation
        const indent = '  '.repeat(depth);
        reindented.push(indent + line);

        // Increase depth AFTER line if it ends with opening bracket
        if (line.endsWith('{') || line.endsWith('[') || (line.endsWith('(') && !line.includes(')'))) {
            depth++;
        }
        // Decrease depth AFTER line if it ends with closing bracket
        if ((line.endsWith('}') || line.endsWith(']') || line.endsWith(')')) && !line.startsWith('}') && !line.startsWith(']') && !line.startsWith(')')) {
            depth = Math.max(0, depth - 1);
        }
    });

    return reindented.join('\n');
}

/**
 * Extract examples for a specific function from HTML example file
 * 
 * @param {string} dropinPath - Path to drop-in repository
 * @param {string} functionName - Name of the function to extract examples for
 * @returns {Array} Array of example objects with title and code
 */
export function extractExamplesFromHTML(dropinPath, functionName) {
    const examplePath = join(dropinPath, 'examples', 'html-host', 'index.html');

    if (!existsSync(examplePath)) {
        return [];
    }

    const content = readFileSync(examplePath, 'utf8');
    const examples = [];

    // Extract examples using regex patterns
    // Pattern 1: Direct function calls with addEventListener
    const listenerPattern = new RegExp(
        `addEventListener\\s*\\(\\s*['"]click['"]\\s*,\\s*(?:(?:\\(\\)|async)?\\s*=>)?\\s*\\{[\\s\\S]*?${functionName}\\s*\\([\\s\\S]*?\\}\\s*\\)`,
        'g'
    );

    const matches = content.matchAll(listenerPattern);

    for (const match of matches) {
        const codeBlock = match[0];

        // Extract the actual function call with its arguments
        const functionCallPattern = new RegExp(
            `${functionName}\\s*\\([\\s\\S]*?\\)(?:\\s*\\.(?:then|catch)\\([\\s\\S]*?\\))*`,
            'g'
        );

        const functionCalls = codeBlock.matchAll(functionCallPattern);

        for (const call of functionCalls) {
            let code = call[0];

            // Clean up the code
            code = code
                .replace(/\s*\.catch\(console\.warn\)/, '')
                .replace(/\s*\.then\([^)]+\)/, '')
                .trim();

            // Add await if it's a promise-based call
            if (!code.startsWith('await ')) {
                code = `await ${code}`;
            }

            // Try to extract context from surrounding comments or button data attributes
            const surroundingContext = codeBlock.substring(Math.max(0, codeBlock.indexOf(code) - 200), codeBlock.indexOf(code));
            const commentMatch = surroundingContext.match(/\/\/\s*(.+?)$/m);
            const dataLabelMatch = surroundingContext.match(/data-label="([^"]+)"/);

            let title = '';
            if (commentMatch) {
                title = commentMatch[1].trim();
            } else if (dataLabelMatch) {
                title = `Using ${dataLabelMatch[1]}`;
            }

            examples.push({
                title: title || null,
                code: normalizeIndentation(code),
                source: 'html-example'
            });
        }
    }

    // Remove duplicates
    const seen = new Set();
    return examples.filter(ex => {
        const key = ex.code;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Extract examples for a specific function from boilerplate blocks
 * 
 * @param {string} boilerplatePath - Path to boilerplate repository
 * @param {string} functionName - Name of the function to extract examples for
 * @returns {Array} Array of example objects with title and code
 */
export function extractExamplesFromBoilerplate(boilerplatePath, functionName) {
    const blocksPath = join(boilerplatePath, 'blocks');

    if (!existsSync(blocksPath)) {
        return [];
    }

    const examples = [];

    // Common block directories where cart functions are used
    const blockFiles = [
        'product-details/product-details.js',
        'product-list-page/product-list-page.js',
        'product-recommendations/product-recommendations.js',
        'commerce-cart/commerce-cart.js',
        'commerce-wishlist/commerce-wishlist.js',
        'commerce-checkout/containers.js',
        'commerce-mini-cart/commerce-mini-cart.js',
        'commerce-gift-options/commerce-gift-options.js'
    ];

    for (const blockFile of blockFiles) {
        const filePath = join(blocksPath, blockFile);

        if (!existsSync(filePath)) {
            continue;
        }

        const content = readFileSync(filePath, 'utf8');

        // Check if this file uses the function
        if (!content.includes(functionName)) {
            continue;
        }

        // Find function calls with proper bracket matching
        const functionPattern = new RegExp(`(?:await\\s+)?(?:\\w+\\.)?${functionName}\\s*\\(`, 'g');
        const functionMatches = [...content.matchAll(functionPattern)];

        for (const match of functionMatches) {
            const startIndex = match.index;
            const openParenIndex = content.indexOf('(', startIndex);

            // Find matching closing paren
            let depth = 0;
            let endIndex = openParenIndex;
            for (let i = openParenIndex; i < content.length; i++) {
                if (content[i] === '(' || content[i] === '[' || content[i] === '{') depth++;
                if (content[i] === ')' || content[i] === ']' || content[i] === '}') depth--;
                if (depth === 0) {
                    endIndex = i + 1;
                    break;
                }
            }

            let code = content.substring(startIndex, endIndex).trim();

            // Add await if missing
            if (!code.startsWith('await ')) {
                code = `await ${code}`;
            }

            // Skip if it's just a reference (no actual call with args)
            if (code.length < 20 || code.endsWith('()')) {
                continue;
            }

            // Extract block name from file path
            const blockName = blockFile.split('/')[0].replace(/-/g, ' ');

            examples.push({
                title: `From ${blockName} block`,
                code: normalizeIndentation(code),
                source: 'boilerplate'
            });
        }
    }

    // Remove duplicates
    const seen = new Set();
    return examples.filter(ex => {
        const key = ex.code;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Extract examples from function JSDoc comments
 * 
 * @param {string} dropinPath - Path to drop-in repository
 * @param {string} functionName - Name of the function to extract examples for
 * @returns {Array} Array of example objects with title and code
 */
export function extractExamplesFromJSDoc(dropinPath, functionName) {
    // Try to find the function file
    const possiblePaths = [
        join(dropinPath, 'src', 'api', functionName, `${functionName}.ts`),
        join(dropinPath, 'src', 'api', `${functionName}.ts`),
        join(dropinPath, 'src', functionName, `${functionName}.ts`)
    ];

    for (const filePath of possiblePaths) {
        if (!existsSync(filePath)) {
            continue;
        }

        const content = readFileSync(filePath, 'utf8');
        const examples = [];

        // Look for @example tags in JSDoc comments
        const examplePattern = /@example\s+([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/)/g;
        const matches = content.matchAll(examplePattern);

        for (const match of matches) {
            let code = match[1]
                .replace(/^\s*\*\s*/gm, '') // Remove JSDoc asterisks
                .trim();

            examples.push({
                title: null,
                code: normalizeIndentation(code),
                source: 'jsdoc'
            });
        }

        if (examples.length > 0) {
            return examples;
        }
    }

    return [];
}

/**
 * Validate that required repositories exist before extraction
 * 
 * @param {string} dropinPath - Path to drop-in repository
 * @param {string} boilerplatePath - Path to boilerplate repository
 * @param {string} repoName - Drop-in name for error messages
 * @returns {boolean} True if valid, false otherwise
 */
function validateRepositories(dropinPath, boilerplatePath, repoName) {
    if (!existsSync(dropinPath)) {
        console.warn(`  ⚠️  Drop-in repository not found: ${dropinPath}`);
        console.warn(`     Examples will fall back to enrichment data only.`);
        return false;
    }

    if (!existsSync(boilerplatePath)) {
        console.warn(`  ⚠️  Boilerplate repository not found: ${boilerplatePath}`);
        console.warn(`     Boilerplate examples will be skipped.`);
        // Don't return false - we can still extract from drop-in repo
    }

    return true;
}

/**
 * Get all examples for a function from all available sources
 * 
 * @param {string} repoName - Drop-in repository name (e.g., 'cart')
 * @param {string} functionName - Name of the function to extract examples for
 * @param {number} maxExamples - Maximum number of examples to return (default: 3)
 * @returns {Array} Array of example objects with title and code
 */
export function getAllExamples(repoName, functionName, maxExamples = 3) {
    const dropinPath = join(projectRoot, '.temp-repos', repoName);
    const boilerplatePath = join(projectRoot, '.temp-repos', 'boilerplate');

    // Validate repositories exist (warns but doesn't fail)
    const hasDropin = validateRepositories(dropinPath, boilerplatePath, repoName);

    // If drop-in repo not found, return empty (will fall back to enrichment)
    if (!hasDropin) {
        return [];
    }

    const allExamples = [
        ...extractExamplesFromHTML(dropinPath, functionName),
        ...extractExamplesFromBoilerplate(boilerplatePath, functionName),
        ...extractExamplesFromJSDoc(dropinPath, functionName)
    ];

    // Prioritize: JSDoc > HTML Example > Boilerplate
    const prioritized = [
        ...allExamples.filter(ex => ex.source === 'jsdoc'),
        ...allExamples.filter(ex => ex.source === 'html-example'),
        ...allExamples.filter(ex => ex.source === 'boilerplate')
    ];

    // Remove duplicates and limit
    const seen = new Set();
    const unique = prioritized.filter(ex => {
        // Aggressive normalization for comparison - remove all whitespace, quotes, and common variations
        // Also strip out dummy values like IDs, tokens, auth keys that don't make examples different
        const normalized = ex.code
            .replace(/\s+/g, '')  // Remove ALL whitespace
            .replace(/['"`]/g, '') // Remove quotes
            .replace(/,$/gm, '')   // Remove trailing commas
            // Strip common dummy values (IDs, tokens, keys, etc.)
            .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'UUID') // UUIDs
            .replace(/[a-f0-9]{32,64}/gi, 'TOKEN') // Long hex strings (tokens/keys)
            .replace(/[A-Za-z0-9+/]{20,}={0,2}/g, 'BASE64') // Base64 tokens
            .replace(/\d{10,}/g, 'NUMERIC_ID') // Long numeric IDs
            .replace(/id:\d+/gi, 'id:ID') // id: 123 patterns
            .replace(/sku:\w+/gi, 'sku:SKU') // SKU values
            .replace(/customerid:\w+/gi, 'customerid:ID') // Customer IDs
            .replace(/token:\w+/gi, 'token:TOKEN') // Explicit token fields
            .replace(/apikey:\w+/gi, 'apikey:KEY') // API keys
            .replace(/key:\w+/gi, 'key:KEY') // Generic keys
            .toLowerCase()
            .trim();

        if (seen.has(normalized)) {
            return false;
        }
        seen.add(normalized);
        return true;
    });

    return unique.slice(0, maxExamples);
}

