#!/usr/bin/env node

/**
 * Verification script to compare function descriptions
 * 
 * Verification Priority: Boilerplate → Drop-in Repo → Enrichment
 * 
 * Checks:
 * 1. Which functions use enrichment vs source descriptions
 * 2. Functions verified against boilerplate usage (primary source of truth)
 * 3. Source descriptions that mention queries/mutations (should be removed)
 * 4. Discrepancies between enrichment and boilerplate/drop-in repo descriptions
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Import generator utilities
import { cloneDropinAtVersion, cloneOrUpdateBoilerplate, getBoilerplatePackageVersions } from './lib/repository.js';
import { DROPIN_REPOS } from './lib/dropin-config.js';
import { loadFunctionEnrichments } from './lib/enrichment.js';
import { getProjectRoot } from './lib/generator-core.js';

/**
 * Scan boilerplate blocks for function usage and extract context
 * 
 * @param {string} boilerplatePath - Path to boilerplate repository
 * @param {string} functionName - Name of the function to find
 * @param {string} dropinName - Name of the drop-in (e.g., 'cart')
 * @returns {Object|null} Usage context from boilerplate or null if not found
 */
function scanBoilerplateForFunction(boilerplatePath, functionName, dropinName) {
    const blocksPath = join(boilerplatePath, 'blocks');

    if (!existsSync(blocksPath)) {
        return null;
    }

    const usageContexts = [];

    // Get all block directories
    const blockDirs = readdirSync(blocksPath).filter(item => {
        const itemPath = join(blocksPath, item);
        return statSync(itemPath).isDirectory();
    });

    for (const blockDir of blockDirs) {
        // Check multiple file patterns AND all JS/TS files in the directory
        const blockFiles = new Set([
            join(blocksPath, blockDir, `${blockDir}.js`),
            join(blocksPath, blockDir, 'index.js'),
            join(blocksPath, blockDir, 'containers.js'),
            join(blocksPath, blockDir, 'containers.ts'),
            join(blocksPath, blockDir, `${blockDir}.ts`)
        ]);

        // Also scan all JS/TS files in the block directory
        try {
            const blockDirPath = join(blocksPath, blockDir);
            const filesInDir = readdirSync(blockDirPath);
            for (const file of filesInDir) {
                if ((file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.test.js') && !file.endsWith('.test.ts')) {
                    blockFiles.add(join(blockDirPath, file));
                }
            }
        } catch (error) {
            // If directory read fails, continue with predefined files
        }

        for (const filePath of Array.from(blockFiles)) {
            if (!existsSync(filePath)) continue;

            const content = readFileSync(filePath, 'utf8');

            // Check if this file uses the function (multiple patterns)
            const hasDirectName = content.includes(functionName);
            if (!hasDirectName) continue;

            // Pattern 1: Direct import: import { functionName } from '@dropins/storefront-{dropin}/api.js'
            const directImportPattern = new RegExp(
                `import\\s+\\{[^}]*\\b${functionName}\\b[^}]*\\}\\s+from\\s+['"]@dropins/storefront-${dropinName}[^'"]*['"]`,
                'g'
            );

            // Pattern 2: Namespace import: import * as Api from '@dropins/storefront-{dropin}/api.js'
            // Then used as: Api.functionName or api.functionName
            const namespaceImportPattern = new RegExp(
                `import\\s+\\*\\s+as\\s+(\\w+)\\s+from\\s+['"]@dropins/storefront-${dropinName}[^'"]*['"]`,
                'g'
            );
            const namespaceMatches = [...content.matchAll(namespaceImportPattern)];
            const namespaceAliases = namespaceMatches.map(m => m[1].toLowerCase());

            // Pattern 3: Dynamic import: const { functionName } = await import(...)
            const dynamicImportPattern = new RegExp(
                `const\\s+\\{[^}]*\\b${functionName}\\b[^}]*\\}\\s*=\\s*await\\s+import\\s*\\([^)]*@dropins/storefront-${dropinName}[^)]*\\)`,
                'g'
            );

            // Pattern 4: API object usage: cartApi.functionName, api.functionName, etc.
            // Match camelCase patterns like cartApi, wishlistApi, checkoutApi
            const apiObjectPattern = new RegExp(
                `(?:\\w+Api|api|Api)\\.${functionName}\\s*\\(`,
                'gi'
            );

            // Find function calls - multiple patterns
            const callPatterns = [
                // Direct call: functionName(...)
                new RegExp(`\\b${functionName}\\s*\\(`, 'g'),
                // Namespace call: Api.functionName(...)
                ...namespaceAliases.map(alias => new RegExp(`${alias}\\.${functionName}\\s*\\(`, 'g')),
                // API object call: cartApi.functionName(...)
                apiObjectPattern
            ];

            let totalCalls = 0;
            const allCalls = [];

            for (const pattern of callPatterns) {
                const matches = [...content.matchAll(pattern)];
                totalCalls += matches.length;
                allCalls.push(...matches);
            }

            // Check for imports
            const directImports = [...content.matchAll(directImportPattern)];
            const dynamicImports = [...content.matchAll(dynamicImportPattern)];
            const hasAnyImport = directImports.length > 0 || dynamicImports.length > 0 || namespaceMatches.length > 0;

            if (totalCalls > 0 || hasAnyImport) {
                // Extract surrounding context (comments, variable names, button labels, etc.)
                const contextLines = [];
                const variableNames = new Set();

                for (const call of allCalls.slice(0, 5)) { // Check up to 5 calls
                    const startIndex = Math.max(0, call.index - 300);
                    const endIndex = Math.min(content.length, call.index + 300);
                    const context = content.substring(startIndex, endIndex);

                    // Extract comments before the call
                    const commentMatch = context.match(/(?:\/\/|\/\*)[^\n]*$/m);
                    if (commentMatch) {
                        contextLines.push(commentMatch[0].replace(/\/\/|\/\*|\*\//g, '').trim());
                    }

                    // Extract variable names/button labels before the call
                    const varMatch = context.match(/(?:label|text|children|title|name):\s*['"]([^'"]+)['"]/);
                    if (varMatch) {
                        contextLines.push(varMatch[1]);
                    }

                    // Extract onClick/onSubmit handlers context
                    const handlerMatch = context.match(/(?:onClick|onSubmit|onChange):\s*[^,}]+/);
                    if (handlerMatch) {
                        const handlerText = handlerMatch[0].substring(0, 100);
                        if (handlerText.length > 10) {
                            contextLines.push(handlerText);
                        }
                    }
                }

                // Extract block name context
                const blockNameWords = blockDir.split('-').filter(w => w.length > 2);

                usageContexts.push({
                    block: blockDir,
                    file: filePath.split('/').pop(),
                    hasImport: hasAnyImport,
                    callCount: totalCalls,
                    context: contextLines.join(' | '),
                    blockNameWords: blockNameWords
                });
            }
        }
    }

    if (usageContexts.length === 0) {
        return null;
    }

    // Return summary of boilerplate usage
    return {
        found: true,
        blocks: usageContexts.map(uc => uc.block),
        totalCalls: usageContexts.reduce((sum, uc) => sum + uc.callCount, 0),
        context: usageContexts.map(uc => uc.context).filter(c => c).join(' | '),
        blockNameWords: [...new Set(usageContexts.flatMap(uc => uc.blockNameWords))]
    };
}

/**
 * Scan HTML examples for function usage
 * HTML examples show real-world usage patterns
 * 
 * @param {string} dropinPath - Path to drop-in repository
 * @param {string} functionName - Name of the function to find
 * @returns {Object|null} Usage context from HTML examples or null if not found
 */
function scanHTMLExamplesForFunction(dropinPath, functionName) {
    const examplePath = join(dropinPath, 'examples', 'html-host', 'index.html');

    if (!existsSync(examplePath)) {
        return null;
    }

    const content = readFileSync(examplePath, 'utf8');

    // Check if function is used in HTML examples
    if (!content.includes(functionName)) {
        return null;
    }

    // Count usage patterns
    const directCallPattern = new RegExp(`\\b${functionName}\\s*\\(`, 'g');
    const apiObjectPattern = new RegExp(`(?:\\w+Api|api|Api)\\.${functionName}\\s*\\(`, 'gi');

    const directCalls = [...content.matchAll(directCallPattern)];
    const apiCalls = [...content.matchAll(apiObjectPattern)];
    const totalCalls = directCalls.length + apiCalls.length;

    if (totalCalls === 0) {
        return null;
    }

    // Extract context from surrounding code
    const contexts = [];
    for (const call of [...directCalls, ...apiCalls].slice(0, 3)) {
        const startIndex = Math.max(0, call.index - 200);
        const endIndex = Math.min(content.length, call.index + 200);
        const context = content.substring(startIndex, endIndex);

        // Extract comments
        const commentMatch = context.match(/\/\/\s*(.+?)$/m);
        if (commentMatch) {
            contexts.push(commentMatch[1].trim());
        }

        // Extract button labels/data attributes
        const labelMatch = context.match(/data-label="([^"]+)"/);
        if (labelMatch) {
            contexts.push(labelMatch[1]);
        }
    }

    return {
        found: true,
        totalCalls: totalCalls,
        context: contexts.join(' | ')
    };
}

/**
 * Scan all drop-in repos for function usage
 * Finds where functions are imported and used across the entire ecosystem
 * 
 * @param {string} projectRoot - Path to project root
 * @param {string} functionName - Name of the function to find
 * @param {string} sourceDropinName - Name of the drop-in that defines this function
 * @returns {Object|null} Usage context from all drop-ins or null if not found
 */
function scanAllDropinReposForFunction(projectRoot, functionName, sourceDropinName) {
    const usageContexts = [];
    const tempReposPath = join(projectRoot, '.temp-repos');

    // Get all drop-in repos
    const dropinDirs = readdirSync(tempReposPath).filter(item => {
        const itemPath = join(tempReposPath, item);
        if (!statSync(itemPath).isDirectory()) return false;
        // Skip boilerplate and non-dropin directories
        if (item === 'boilerplate' || item.startsWith('.')) return false;
        // Only scan drop-in repos (check if it has src/api structure)
        const apiPath = join(itemPath, 'src', 'api');
        return existsSync(apiPath);
    });

    for (const dropinDir of dropinDirs) {
        const dropinPath = join(tempReposPath, dropinDir);

        // Skip the source drop-in itself (we already scan it separately)
        if (dropinDir === sourceDropinName) continue;

        // Scan src directory for imports and usage
        const srcPath = join(dropinPath, 'src');
        if (!existsSync(srcPath)) continue;

        try {
            const files = readdirSync(srcPath, { recursive: true });
            let foundUsage = false;
            let importCount = 0;
            let callCount = 0;

            for (const file of files) {
                if (typeof file !== 'string') continue;
                if (!file.endsWith('.ts') && !file.endsWith('.js') && !file.endsWith('.tsx') && !file.endsWith('.jsx')) continue;
                if (file.includes('.test.') || file.includes('.spec.')) continue;

                const filePath = join(srcPath, file);
                if (!existsSync(filePath) || !statSync(filePath).isFile()) continue;

                const content = readFileSync(filePath, 'utf8');

                // Check for imports from the source drop-in
                const importPattern = new RegExp(
                    `import\\s+.*?\\b${functionName}\\b.*?from\\s+['"]@dropins/storefront-${sourceDropinName}[^'"]*['"]`,
                    'g'
                );
                const imports = [...content.matchAll(importPattern)];

                // Check for function calls
                const callPattern = new RegExp(`\\b${functionName}\\s*\\(`, 'g');
                const calls = [...content.matchAll(callPattern)];

                if (imports.length > 0 || calls.length > 0) {
                    foundUsage = true;
                    importCount += imports.length;
                    callCount += calls.length;
                }
            }

            if (foundUsage) {
                usageContexts.push({
                    dropin: dropinDir,
                    importCount,
                    callCount
                });
            }
        } catch (error) {
            // Skip if directory read fails
            continue;
        }
    }

    if (usageContexts.length === 0) {
        return null;
    }

    return {
        found: true,
        dropins: usageContexts.map(uc => uc.dropin),
        totalImports: usageContexts.reduce((sum, uc) => sum + uc.importCount, 0),
        totalCalls: usageContexts.reduce((sum, uc) => sum + uc.callCount, 0)
    };
}

/**
 * Scan drop-in source code for function definition context
 * Extracts comments and context around function definitions
 * 
 * @param {string} dropinPath - Path to drop-in repository
 * @param {string} functionName - Name of the function to find
 * @returns {Object|null} Source context or null if not found
 */
function scanSourceCodeForFunction(dropinPath, functionName) {
    // Try to find the function file
    const possiblePaths = [
        join(dropinPath, 'src', 'api', functionName, `${functionName}.ts`),
        join(dropinPath, 'src', 'api', `${functionName}.ts`),
        join(dropinPath, 'src', 'api', functionName, `${functionName}.js`),
        join(dropinPath, 'src', 'api', `${functionName}.js`)
    ];

    for (const filePath of possiblePaths) {
        if (!existsSync(filePath)) {
            continue;
        }

        const content = readFileSync(filePath, 'utf8');

        // Find function definition
        const functionPattern = new RegExp(
            `(?:export\\s+(?:const|function|async\\s+function)?\\s+)?${functionName}\\s*[=:]`,
            'g'
        );
        const match = content.match(functionPattern);

        if (!match) {
            continue;
        }

        const matchIndex = content.indexOf(match[0]);

        // Extract comments before function (up to 50 lines back)
        const startIndex = Math.max(0, matchIndex - 2000);
        const beforeFunction = content.substring(startIndex, matchIndex);

        // Look for JSDoc comments
        const jsdocMatch = beforeFunction.match(/\*\*[\s\S]*?\*\//);
        if (jsdocMatch) {
            const jsdoc = jsdocMatch[0];
            // Extract description from JSDoc (text before @param, @returns, etc.)
            const descMatch = jsdoc.match(/\*\s+([^*@]+?)(?=\s*\*\s*@|\s*\*\/)/);
            if (descMatch) {
                const description = descMatch[1]
                    .replace(/^\s*\*\s*/gm, '')
                    .trim();
                if (description.length > 20) {
                    return {
                        found: true,
                        description: description,
                        source: 'jsdoc'
                    };
                }
            }
        }

        // Extract regular comments before function
        const commentLines = [];
        const lines = beforeFunction.split('\n').slice(-20); // Last 20 lines
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('//') && line.length > 10) {
                commentLines.unshift(line.replace(/^\/\/\s*/, ''));
                if (commentLines.length >= 3) break;
            }
        }

        if (commentLines.length > 0) {
            return {
                found: true,
                description: commentLines.join(' '),
                source: 'comments'
            };
        }
    }

    return null;
}

/**
 * Extract function description from boilerplate usage context
 * Attempts to infer what the function does based on how it's used
 * 
 * @param {Object} boilerplateContext - Context from scanBoilerplateForFunction
 * @param {string} functionName - Name of the function
 * @returns {string|null} Inferred description or null
 */
function inferDescriptionFromBoilerplate(boilerplateContext, functionName) {
    if (!boilerplateContext || !boilerplateContext.found) {
        return null;
    }

    // Extract meaningful context
    const blockNames = boilerplateContext.blocks.join(', ');
    const context = boilerplateContext.context.toLowerCase();
    const blockNameWords = boilerplateContext.blockNameWords || [];
    const functionNameLower = functionName.toLowerCase();

    // Analyze function name patterns first (most reliable)
    let inferred = null;

    // Pattern-based inference from function name
    if (functionNameLower.includes('add') && functionNameLower.includes('cart')) {
        inferred = 'Adds products to a cart';
    } else if (functionNameLower.includes('update') && functionNameLower.includes('cart')) {
        inferred = 'Updates cart items';
    } else if (functionNameLower.includes('remove') && functionNameLower.includes('cart')) {
        inferred = 'Removes items from the cart';
    } else if (functionNameLower.includes('apply') && functionNameLower.includes('coupon')) {
        inferred = 'Applies coupons to the cart';
    } else if (functionNameLower.includes('apply') && functionNameLower.includes('gift')) {
        inferred = 'Applies a gift card to the cart';
    } else if (functionNameLower.includes('remove') && functionNameLower.includes('gift')) {
        inferred = 'Removes a gift card from the cart';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('cart')) {
        inferred = 'Retrieves cart data';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('estimate') && functionNameLower.includes('shipping')) {
        inferred = 'Returns available shipping methods and their estimated costs';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('estimate') && functionNameLower.includes('total')) {
        inferred = 'Returns estimated totals for the cart';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('store') && functionNameLower.includes('config')) {
        inferred = 'Returns information about the store configuration';
    } else if (functionNameLower.includes('initialize') && functionNameLower.includes('cart')) {
        inferred = 'Initializes a guest or customer cart';
    } else if (functionNameLower.includes('refresh') && functionNameLower.includes('cart')) {
        inferred = 'Refreshes the cart data';
    } else if (functionNameLower.includes('reset') && functionNameLower.includes('cart')) {
        inferred = 'Resets the cart';
    } else if (functionNameLower.includes('publish') && functionNameLower.includes('cart')) {
        inferred = 'Publishes a shopping cart view event to the ACDL';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('customer')) {
        inferred = 'Retrieves customer information';
    } else if (functionNameLower.includes('create') && functionNameLower.includes('customer')) {
        inferred = 'Creates a customer account';
    } else if (functionNameLower.includes('update') && functionNameLower.includes('customer')) {
        inferred = 'Updates customer information';
    } else if (functionNameLower.includes('remove') && functionNameLower.includes('customer')) {
        inferred = 'Removes customer data';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('customer') && functionNameLower.includes('address')) {
        inferred = 'Retrieves customer addresses';
    } else if (functionNameLower.includes('create') && functionNameLower.includes('customer') && functionNameLower.includes('address')) {
        inferred = 'Creates a customer address';
    } else if (functionNameLower.includes('update') && functionNameLower.includes('customer') && functionNameLower.includes('address')) {
        inferred = 'Updates a customer address';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('order')) {
        inferred = 'Retrieves order information';
    } else if (functionNameLower.includes('cancel') && functionNameLower.includes('order')) {
        inferred = 'Cancels an order';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('wishlist')) {
        inferred = 'Retrieves wishlist data';
    } else if (functionNameLower.includes('add') && functionNameLower.includes('wishlist')) {
        inferred = 'Adds products to a wishlist';
    } else if (functionNameLower.includes('remove') && functionNameLower.includes('wishlist')) {
        inferred = 'Removes products from a wishlist';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('recommendation')) {
        inferred = 'Retrieves product recommendations';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('token')) {
        inferred = 'Handles the sign-in operation';
    } else if (functionNameLower.includes('confirm') && functionNameLower.includes('email')) {
        inferred = 'Completes the customer activation process';
    } else if (functionNameLower.includes('reset') && functionNameLower.includes('password')) {
        inferred = 'Resets a customer password';
    } else if (functionNameLower.includes('request') && functionNameLower.includes('password')) {
        inferred = 'Initiates the process of resetting a customer password';
    } else if (functionNameLower.includes('set') && functionNameLower.includes('gift')) {
        inferred = 'Sets gift options on the cart';
    } else if (functionNameLower.includes('reorder')) {
        inferred = 'Adds products from a previous order to the cart';
    } else if (functionNameLower.includes('request') && functionNameLower.includes('return')) {
        inferred = 'Initiates the process of returning items from an order';
    } else if (functionNameLower.includes('place') && functionNameLower.includes('order')) {
        inferred = 'Places an order';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('attributes')) {
        inferred = 'Retrieves attributes';
    } else if (functionNameLower.includes('get') && functionNameLower.includes('guest') && functionNameLower.includes('order')) {
        inferred = 'Retrieves a guest order';
    } else if (functionNameLower.includes('publish') && functionNameLower.includes('rec')) {
        inferred = 'Publishes a recommendation event';
    } else if (functionNameLower.includes('search')) {
        inferred = 'Performs a product search';
    } else if (functionNameLower.includes('verify') && functionNameLower.includes('token')) {
        inferred = 'Checks the validity of an authentication token';
    } else if (functionNameLower.includes('revoke') && functionNameLower.includes('token')) {
        inferred = 'Revokes a customer token';
    } else if (functionNameLower.includes('resend') && functionNameLower.includes('confirmation')) {
        inferred = 'Resends an email confirmation';
    } else if (functionNameLower.startsWith('get')) {
        // Generic getter pattern
        const objectName = functionNameLower.replace(/^get/, '').replace(/([A-Z])/g, ' $1').trim();
        inferred = `Retrieves ${objectName}`;
    } else if (functionNameLower.startsWith('create')) {
        const objectName = functionNameLower.replace(/^create/, '').replace(/([A-Z])/g, ' $1').trim();
        inferred = `Creates ${objectName}`;
    } else if (functionNameLower.startsWith('update')) {
        const objectName = functionNameLower.replace(/^update/, '').replace(/([A-Z])/g, ' $1').trim();
        inferred = `Updates ${objectName}`;
    } else if (functionNameLower.startsWith('remove') || functionNameLower.startsWith('delete')) {
        const objectName = functionNameLower.replace(/^(remove|delete)/, '').replace(/([A-Z])/g, ' $1').trim();
        inferred = `Removes ${objectName}`;
    } else if (functionNameLower.startsWith('apply')) {
        const objectName = functionNameLower.replace(/^apply/, '').replace(/([A-Z])/g, ' $1').trim();
        inferred = `Applies ${objectName}`;
    }

    // Enhance with context if available
    if (inferred && context && context.length > 10) {
        // If context mentions specific actions, we can add detail
        // But keep it simple - don't add implementation details
    }

    // Add block context if helpful
    if (inferred && blockNames && blockNames.length < 100) {
        // Only add if it adds meaningful context
        const relevantBlocks = blockNames.split(', ').filter(b =>
            !b.includes('commerce-') || b.includes(functionNameLower.split(/(?=[A-Z])/)[0])
        );
        if (relevantBlocks.length > 0 && relevantBlocks.length <= 3) {
            // inferred += ` (used in ${relevantBlocks.join(', ')} blocks)`;
            // Actually, let's not add this - it's implementation detail
        }
    }

    return inferred;
}

// Reuse description extraction logic from generator
function cleanFunctionDescription(mdxContent, functionName) {
    const descMatch = mdxContent.match(/^# \w+\n\n(.+?)$/m);
    if (!descMatch) return null;

    let description = descMatch[1];

    if (/^```/.test(description)) {
        return null;
    }

    const placeholders = [
        /howdy world/i,
        /hello world/i,
        /test function/i,
        /todo/i,
        /placeholder/i,
        /^returns ".*?"\.?$/i
    ];

    for (const placeholder of placeholders) {
        if (placeholder.test(description)) {
            return null;
        }
    }

    description = description
        .replace(/^A function that /, '')
        .replace(/"\.$/, '')
        .replace(/"\.?$/, '.');

    if (description.length > 0) {
        description = description.charAt(0).toUpperCase() + description.slice(1);
    }

    return description.trim() || null;
}

function scanForFunctions(repoPath) {
    const apiPath = join(repoPath, 'src', 'api');
    const functions = [];

    if (!existsSync(apiPath)) {
        return { functions };
    }

    try {
        const entries = readdirSync(apiPath);

        for (const entry of entries) {
            const entryPath = join(apiPath, entry);
            const stat = statSync(entryPath);

            if (!stat.isDirectory()) continue;
            if (entry.startsWith('.') || entry === 'graphql' || entry === 'fetch-graphql') continue;

            const mdxPath = join(entryPath, `${entry}.mdx`);
            const tsPath = join(entryPath, `${entry}.ts`);

            if (existsSync(mdxPath)) {
                const mdxContent = readFileSync(mdxPath, 'utf8');

                // Check if function is exported (simplified check)
                if (existsSync(tsPath)) {
                    const tsContent = readFileSync(tsPath, 'utf8');
                    // Skip if not exported (basic check)
                    if (!tsContent.match(/export\s+(async\s+)?function\s+\w+|export\s+(const|let)\s+\w+\s*=\s*(async\s+)?\(/)) {
                        continue;
                    }
                }

                functions.push({
                    name: entry,
                    mdxContent: mdxContent
                });
            }
        }
    } catch (error) {
        console.error(`Error scanning ${repoPath}:`, error.message);
    }

    return { functions };
}

function checkForQueryMutationMentions(text) {
    if (!text) return [];
    const issues = [];

    // Check for query/mutation mentions
    const patterns = [
        { pattern: /\b(query|mutation)\s+(\w+)/gi, type: 'query/mutation mention' },
        { pattern: /calls?\s+(the\s+)?(\w+)\s+(query|mutation)/gi, type: 'calls query/mutation' },
        { pattern: /(\w+)\s+(query|mutation)\s+(defines|returns|retrieves)/gi, type: 'query/mutation as subject' },
        { pattern: /GraphQL\s+(query|mutation)/gi, type: 'GraphQL query/mutation mention' }
    ];

    for (const { pattern, type } of patterns) {
        const matches = text.match(pattern);
        if (matches) {
            issues.push({ type, matches: [...new Set(matches)] });
        }
    }

    return issues;
}

/**
 * Check for other implementation details that should be removed
 * Focuses on "how" rather than "what"
 * 
 * Philosophy:
 * - High severity: Always implementation detail (wrapper, calls mutation text, GraphQL in main text)
 * - Medium severity: Implementation detail but might need careful rewriting
 * - Low severity: Borderline - may be acceptable if describing outcome rather than mechanism
 * 
 * Note: Storage mechanisms (cookie, localStorage, sessionStorage) are considered part of the
 * API contract and are NOT flagged - developers need to know where data persists.
 * 
 * Note: Data format conversions (snake_case, camelCase) are considered part of the API
 * contract and are NOT flagged - developers need to know how data is transformed.
 */
function checkForImplementationDetails(text) {
    if (!text) return [];
    const issues = [];

    // Split text into main description and notes
    const noteMatch = text.match(/Note:\s*(.+)/i);
    const mainText = noteMatch ? text.substring(0, noteMatch.index) : text;
    const noteText = noteMatch ? noteMatch[1] : '';

    // Normalize text (markdown links converted to plain text)
    const normalizedMainText = mainText
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert markdown links to text
        .replace(/`([^`]+)`/g, '$1'); // Remove code formatting

    const patterns = [
        // Wrapper mentions - ALWAYS implementation detail
        // (The link itself is useful, but "wrapper" language is not)
        { pattern: /\bis\s+a\s+wrapper\s+for\s+/gi, type: 'is a wrapper', severity: 'high', checkMainOnly: true },
        { pattern: /\bwrapper\s+for\s+the\s+/gi, type: 'wrapper for', severity: 'high', checkMainOnly: true },

        // GraphQL mentions and mutation/query references - REMOVED: These are now beneficial to developers
        // Developers need to know what GraphQL operations are being used and links to GraphQL docs are helpful

        // Internal state - vague implementation detail (storage mechanisms like cookie/localStorage are API contract)
        { pattern: /\b(internal\s+state|from\s+internal\s+state|to\s+internal\s+state|retrieve.*from\s+internal\s+state)/gi, type: 'internal state', severity: 'low', checkMainOnly: true },

        // Data transformation - REMOVED: These are API contract (developers need to know format conversions)
        // We keep: "converts to snake_case" - this is important API information
        // We only flag utility mentions that are overly technical
        { pattern: /\b(convertKeysCase|snake_case|camelCase)\s+utility/gi, type: 'utility mention (may be acceptable)', severity: 'low', checkMainOnly: true },

        // Only flag "transforms" if it mentions specific mechanism without context, not just "standardized format"
        { pattern: /\btransforms?\s+(the\s+)?response\s+(to|into)\s+(snake_case|camelCase|a\s+different\s+format)/gi, type: 'transforms response format', severity: 'low', checkMainOnly: true },

        // Invoking/calling other functions - ALWAYS implementation detail
        { pattern: /\binvokes?\s+(first|then|the)\s+/gi, type: 'invokes function', severity: 'high', checkMainOnly: true },
        { pattern: /\bin\s+this\s+process.*invokes?/gi, type: 'process invokes', severity: 'high', checkMainOnly: true },

        // API version details - low severity (might be necessary context)
        { pattern: /\b(apiVersion2|V2|updateCustomerV2)/gi, type: 'API version detail', severity: 'low', checkMainOnly: true }
    ];

    for (const { pattern, type, severity, checkMainOnly } of patterns) {
        const textToCheck = checkMainOnly ? normalizedMainText : text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/`([^`]+)`/g, '$1');
        const matches = textToCheck.match(pattern);
        if (matches) {
            issues.push({
                type,
                matches: [...new Set(matches)],
                severity: severity || 'medium'
            });
        }
    }

    return issues;
}

/**
 * Normalize text for comparison (remove markdown, links, formatting)
 */
function normalizeForComparison(text) {
    if (!text) return '';

    return text
        .toLowerCase()
        // Remove markdown links but keep the text
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        // Remove code formatting
        .replace(/`([^`]+)`/g, '$1')
        // Remove bold/italic
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Check if enrichment description might be stale compared to source
 * Returns null if no staleness detected, or an object with details
 */
function checkStaleness(enrichmentDesc, sourceDesc) {
    if (!enrichmentDesc || !sourceDesc) return null;

    const normalizedEnrichment = normalizeForComparison(enrichmentDesc);
    const normalizedSource = normalizeForComparison(sourceDesc);

    // If they're identical, no staleness
    if (normalizedEnrichment === normalizedSource) return null;

    // Check if source has significant new content
    const sourceWords = normalizedSource.split(/\s+/);
    const enrichmentWords = normalizedEnrichment.split(/\s+/);

    // Calculate word overlap percentage
    const sourceSet = new Set(sourceWords);
    const enrichmentSet = new Set(enrichmentWords);
    const intersection = new Set([...sourceSet].filter(x => enrichmentSet.has(x)));
    const union = new Set([...sourceSet, ...enrichmentSet]);

    const similarity = intersection.size / union.size;

    // If similarity is very low (< 30%), likely stale
    if (similarity < 0.3) {
        return {
            severity: 'high',
            similarity: Math.round(similarity * 100),
            reason: 'Significant difference detected - source description has changed substantially'
        };
    }

    // If similarity is moderate (30-70%), might be stale
    if (similarity < 0.7) {
        return {
            severity: 'medium',
            similarity: Math.round(similarity * 100),
            reason: 'Moderate difference detected - source description may have been updated'
        };
    }

    // High similarity (>70%) - probably fine, just minor differences
    return null;
}

async function verifyDropin(dropinName, repoConfig, packageVersions, boilerplatePath) {
    console.log(`\n📦 Checking ${dropinName}...`);

    try {
        // Get version from boilerplate
        const version = packageVersions[repoConfig.packageName];
        if (!version) {
            console.log(`  ⚠️  No version found in boilerplate for ${repoConfig.packageName}`);
            return {
                dropin: dropinName,
                error: 'No version found',
                functions: [],
                summary: { total: 0, withEnrichment: 0, fromSource: 0, issuesFound: 0, stalenessFound: 0, boilerplateVerified: 0 }
            };
        }

        // Clone repo
        const { path: repoPath } = cloneDropinAtVersion(
            dropinName,
            repoConfig,
            version
        );

        // Load enrichments
        const enrichmentData = loadFunctionEnrichments(dropinName);

        // Scan functions
        const { functions } = scanForFunctions(repoPath);

        const results = {
            dropin: dropinName,
            functions: [],
            summary: {
                total: functions.length,
                withEnrichment: 0,
                fromSource: 0,
                issuesFound: 0,
                stalenessFound: 0,
                boilerplateVerified: 0
            }
        };

        for (const func of functions) {
            const enrichment = enrichmentData && enrichmentData[func.name] ? enrichmentData[func.name] : null;
            const enrichmentDescription = enrichment && enrichment.description ? enrichment.description : null;
            const usingEnrichment = !!enrichmentDescription;

            // PRIMARY: Check boilerplate first
            const boilerplateContext = scanBoilerplateForFunction(boilerplatePath, func.name, dropinName);
            const boilerplateDescription = inferDescriptionFromBoilerplate(boilerplateContext, func.name);
            // Consider it verified if we found usage (calls OR imports)
            const hasBoilerplateUsage = !!boilerplateContext && (boilerplateContext.totalCalls > 0 || boilerplateContext.found);

            // SECONDARY: Check HTML examples (real-world usage)
            const htmlExampleContext = scanHTMLExamplesForFunction(repoPath, func.name);
            const hasHTMLExampleUsage = !!htmlExampleContext && htmlExampleContext.totalCalls > 0;

            // TERTIARY: Check source code comments/JSDoc from the current drop-in
            const sourceCodeContext = scanSourceCodeForFunction(repoPath, func.name);
            const sourceCodeDescription = sourceCodeContext && sourceCodeContext.description ? sourceCodeContext.description : null;

            // QUATERNARY: Check all other drop-in repos for cross-drop-in usage
            const allDropinsContext = scanAllDropinReposForFunction(projectRoot, func.name, dropinName);
            const hasCrossDropinUsage = !!allDropinsContext && (allDropinsContext.totalCalls > 0 || allDropinsContext.totalImports > 0);

            // QUINARY: Also get drop-in repo MDX for comparison (even if boilerplate exists)
            const sourceDescription = cleanFunctionDescription(func.mdxContent, func.name);

            // Determine which description to use for verification (priority: enrichment > boilerplate > HTML > source code > MDX)
            // If boilerplate usage found but no description inferred, still prefer boilerplate verification
            const finalDescription = enrichmentDescription || boilerplateDescription || sourceCodeDescription || sourceDescription || '(not found)';
            const verificationSource = enrichmentDescription
                ? 'enrichment'
                : (hasBoilerplateUsage ? 'boilerplate' : (hasHTMLExampleUsage ? 'html-example' : (sourceCodeDescription ? 'source-code' : (sourceDescription ? 'source' : 'none'))));

            // Track verification sources
            const verificationSources = [];
            if (hasBoilerplateUsage) verificationSources.push('boilerplate');
            if (hasHTMLExampleUsage) verificationSources.push('html-example');
            if (sourceCodeDescription) verificationSources.push('source-code');
            if (hasCrossDropinUsage) verificationSources.push('cross-dropin');

            // Check for issues (GraphQL mentions are now allowed - they're beneficial to developers)
            // Only check for non-GraphQL implementation details
            const implementationIssues = checkForImplementationDetails(finalDescription);
            const allIssues = [...implementationIssues];

            if (allIssues.length > 0) {
                results.summary.issuesFound++;
            }

            // Check for staleness - prioritize boilerplate comparison, then HTML examples, then source code
            let staleness = null;
            let stalenessSource = null;
            if (usingEnrichment) {
                // Prefer boilerplate if we have boilerplate usage (even without inferred description)
                if (hasBoilerplateUsage) {
                    if (boilerplateDescription && boilerplateDescription.length > 20) {
                        // Compare enrichment against boilerplate inferred description (best case)
                        staleness = checkStaleness(enrichmentDescription, boilerplateDescription);
                        stalenessSource = 'boilerplate';
                    } else if (sourceCodeDescription && sourceCodeDescription.length > 20) {
                        // Boilerplate usage found but no description - compare against source code
                        staleness = checkStaleness(enrichmentDescription, sourceCodeDescription);
                        stalenessSource = 'source-code';
                    } else if (sourceDescription && sourceDescription !== '(not found)') {
                        // Boilerplate usage found but no descriptions - compare against source MDX
                        staleness = checkStaleness(enrichmentDescription, sourceDescription);
                        stalenessSource = 'source';
                    }
                    // If boilerplate usage found but no descriptions available, skip staleness check
                } else if (hasHTMLExampleUsage && sourceCodeDescription && sourceCodeDescription.length > 20) {
                    // HTML example usage found - compare against source code
                    staleness = checkStaleness(enrichmentDescription, sourceCodeDescription);
                    stalenessSource = 'source-code';
                } else if (sourceCodeDescription && sourceCodeDescription.length > 20) {
                    // Source code comments available - compare against them
                    staleness = checkStaleness(enrichmentDescription, sourceCodeDescription);
                    stalenessSource = 'source-code';
                } else if (sourceDescription && sourceDescription !== '(not found)') {
                    // No boilerplate/HTML/source code - fall back to drop-in repo comparison (secondary)
                    staleness = checkStaleness(enrichmentDescription, sourceDescription);
                    stalenessSource = 'source';
                }

                if (staleness) {
                    results.summary.stalenessFound++;
                    staleness.verificationSource = stalenessSource;
                }
            }

            if (hasBoilerplateUsage || hasHTMLExampleUsage || sourceCodeDescription || hasCrossDropinUsage) {
                results.summary.boilerplateVerified++;
            }

            results.functions.push({
                name: func.name,
                usingEnrichment,
                verificationSource,
                verificationSources, // Array of all sources found
                boilerplateContext: boilerplateContext || null,
                boilerplateDescription: boilerplateDescription || null,
                htmlExampleContext: htmlExampleContext || null,
                sourceCodeContext: sourceCodeContext || null,
                sourceCodeDescription: sourceCodeDescription || null,
                allDropinsContext: allDropinsContext || null,
                sourceDescription: sourceDescription || '(not found)',
                enrichmentDescription: enrichmentDescription || '(none)',
                finalDescription: finalDescription || '(not found)',
                issues: allIssues,
                implementationIssues,
                staleness
            });

            if (usingEnrichment) {
                results.summary.withEnrichment++;
            } else {
                results.summary.fromSource++;
            }
        }

        return results;
    } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        return {
            dropin: dropinName,
            error: error.message,
            functions: [],
            summary: { total: 0, withEnrichment: 0, fromSource: 0, issuesFound: 0, stalenessFound: 0, boilerplateVerified: 0 }
        };
    }
}

async function main() {
    console.log('🔍 Function Description Verification Script');
    console.log('='.repeat(60));
    console.log('Verification Priority: Boilerplate → Drop-in Repo → Enrichment');

    // Setup boilerplate to get versions
    console.log('\n📦 Setting up boilerplate repository...');
    const { path: boilerplatePath } = cloneOrUpdateBoilerplate();
    const packageVersions = getBoilerplatePackageVersions(boilerplatePath);
    console.log('✅ Boilerplate loaded\n');

    const allResults = [];

    for (const [dropinName, repoConfig] of Object.entries(DROPIN_REPOS)) {
        const result = await verifyDropin(dropinName, repoConfig, packageVersions, boilerplatePath);
        allResults.push(result);
    }

    // Print summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    let totalFunctions = 0;
    let totalWithEnrichment = 0;
    let totalFromSource = 0;
    let totalBoilerplateVerified = 0;
    let totalQueryMutationIssues = 0;
    let totalImplementationIssues = 0;
    let totalStaleness = 0;
    const functionsWithQueryMutationIssues = [];
    const functionsWithImplementationIssues = [];
    const staleEnrichments = [];

    for (const result of allResults) {
        if (result.error) {
            console.log(`\n❌ ${result.dropin}: ERROR - ${result.error}`);
            continue;
        }

        totalFunctions += result.summary.total;
        totalWithEnrichment += result.summary.withEnrichment;
        totalFromSource += result.summary.fromSource;
        totalBoilerplateVerified += result.summary.boilerplateVerified;
        totalStaleness += result.summary.stalenessFound;

        // Count issues separately
        let dropinQueryMutationIssues = 0;
        let dropinImplementationIssues = 0;

        // List functions with issues and staleness
        for (const func of result.functions) {
            if (func.queryMutationIssues.length > 0) {
                dropinQueryMutationIssues++;
                functionsWithQueryMutationIssues.push({
                    dropin: result.dropin,
                    function: func.name,
                    description: func.finalDescription,
                    issues: func.queryMutationIssues,
                    usingEnrichment: func.usingEnrichment
                });
            }
            if (func.implementationIssues.length > 0) {
                dropinImplementationIssues++;
                functionsWithImplementationIssues.push({
                    dropin: result.dropin,
                    function: func.name,
                    description: func.finalDescription,
                    issues: func.implementationIssues,
                    usingEnrichment: func.usingEnrichment
                });
            }
            if (func.staleness) {
                staleEnrichments.push({
                    dropin: result.dropin,
                    function: func.name,
                    enrichmentDescription: func.enrichmentDescription,
                    boilerplateDescription: func.boilerplateDescription,
                    sourceDescription: func.sourceDescription,
                    verificationSource: func.staleness.verificationSource || func.verificationSource,
                    staleness: func.staleness
                });
            }
        }

        totalQueryMutationIssues += dropinQueryMutationIssues;
        totalImplementationIssues += dropinImplementationIssues;

        console.log(`\n📦 ${result.dropin}:`);
        console.log(`   Total functions: ${result.summary.total}`);
        console.log(`   Using enrichment: ${result.summary.withEnrichment}`);
        console.log(`   From source: ${result.summary.fromSource}`);
        if (result.summary.boilerplateVerified > 0) {
            console.log(`   ✅ Verified against boilerplate: ${result.summary.boilerplateVerified}`);
        }
        if (dropinQueryMutationIssues > 0) {
            console.log(`   ⚠️  Query/mutation mentions: ${dropinQueryMutationIssues}`);
        }
        if (dropinImplementationIssues > 0) {
            console.log(`   ⚠️  Implementation details: ${dropinImplementationIssues}`);
        }
        if (result.summary.stalenessFound > 0) {
            console.log(`   ⚠️  Stale enrichments: ${result.summary.stalenessFound}`);
        }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📈 OVERALL STATISTICS');
    console.log('='.repeat(60));
    console.log(`Total functions: ${totalFunctions}`);
    console.log(`Using enrichment: ${totalWithEnrichment} (${totalFunctions > 0 ? Math.round(totalWithEnrichment / totalFunctions * 100) : 0}%)`);
    console.log(`From source: ${totalFromSource} (${totalFunctions > 0 ? Math.round(totalFromSource / totalFunctions * 100) : 0}%)`);
    console.log(`✅ Verified against boilerplate: ${totalBoilerplateVerified} (${totalFunctions > 0 ? Math.round(totalBoilerplateVerified / totalFunctions * 100) : 0}%)`);
    console.log(`Functions with query/mutation mentions: ${totalQueryMutationIssues}`);
    console.log(`Functions with implementation details: ${totalImplementationIssues}`);
    if (totalStaleness > 0) {
        console.log(`⚠️  Potentially stale enrichments: ${totalStaleness}`);
    }

    if (staleEnrichments.length > 0) {
        console.log('\n\n' + '='.repeat(60));
        console.log('🔄 POTENTIALLY STALE ENRICHMENTS');
        console.log('='.repeat(60));
        console.log('These enrichments differ significantly from boilerplate usage or source descriptions.');
        console.log('Review and update if boilerplate/source has been improved.\n');

        for (const item of staleEnrichments) {
            const severityIcon = item.staleness.severity === 'high' ? '🔴' : '🟡';
            const verificationSource = item.verificationSource === 'boilerplate' ? '📦 Boilerplate' : '📄 Drop-in Repo';
            console.log(`\n${severityIcon} ${item.dropin} → ${item.function}`);
            console.log(`   Verification source: ${verificationSource}`);
            console.log(`   Severity: ${item.staleness.severity.toUpperCase()} (${item.staleness.similarity}% similarity)`);
            console.log(`   Reason: ${item.staleness.reason}`);
            console.log(`   Current enrichment: ${item.enrichmentDescription.substring(0, 100)}${item.enrichmentDescription.length > 100 ? '...' : ''}`);
            if (item.boilerplateDescription) {
                console.log(`   Boilerplate usage: ${item.boilerplateDescription.substring(0, 100)}${item.boilerplateDescription.length > 100 ? '...' : ''}`);
            }
            if (item.sourceDescription && item.sourceDescription !== '(not found)') {
                console.log(`   Source description: ${item.sourceDescription.substring(0, 100)}${item.sourceDescription.length > 100 ? '...' : ''}`);
            }
        }
    }

    if (functionsWithImplementationIssues.length > 0) {
        console.log('\n\n' + '='.repeat(60));
        console.log('🔧 FUNCTIONS WITH IMPLEMENTATION DETAILS');
        console.log('='.repeat(60));
        console.log('These descriptions mention implementation details (how it works) rather than focusing on what it does.');
        console.log('Consider removing these details to focus on function behavior.\n');

        // Group by severity
        const highSeverity = functionsWithImplementationIssues.filter(f =>
            f.issues.some(i => i.severity === 'high')
        );
        const mediumSeverity = functionsWithImplementationIssues.filter(f =>
            f.issues.some(i => i.severity === 'medium') &&
            !f.issues.some(i => i.severity === 'high')
        );
        const lowSeverity = functionsWithImplementationIssues.filter(f =>
            f.issues.every(i => i.severity === 'low')
        );

        if (highSeverity.length > 0) {
            console.log('\n🔴 HIGH PRIORITY (should be removed):');
            for (const item of highSeverity) {
                const highIssues = item.issues.filter(i => i.severity === 'high');
                console.log(`\n  ${item.dropin} → ${item.function}`);
                console.log(`    Source: ${item.usingEnrichment ? 'Enrichment' : 'Source MDX'}`);
                console.log(`    Description: ${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}`);
                console.log(`    Issues:`);
                for (const issue of highIssues) {
                    console.log(`      - ${issue.type}: ${issue.matches.join(', ')}`);
                }
            }
        }

        if (mediumSeverity.length > 0) {
            console.log('\n🟡 MEDIUM PRIORITY (consider removing):');
            for (const item of mediumSeverity) {
                const mediumIssues = item.issues.filter(i => i.severity === 'medium');
                console.log(`\n  ${item.dropin} → ${item.function}`);
                console.log(`    Description: ${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}`);
                console.log(`    Issues:`);
                for (const issue of mediumIssues) {
                    console.log(`      - ${issue.type}: ${issue.matches.join(', ')}`);
                }
            }
        }

        if (lowSeverity.length > 0 && lowSeverity.length <= 10) {
            // Only show low severity if there aren't too many
            console.log('\n🟢 LOW PRIORITY (minor details, may be acceptable):');
            for (const item of lowSeverity.slice(0, 10)) {
                console.log(`  ${item.dropin} → ${item.function}: ${item.issues.map(i => i.type).join(', ')}`);
            }
            if (lowSeverity.length > 10) {
                console.log(`  ... and ${lowSeverity.length - 10} more`);
            }
        }
    }

    if (functionsWithQueryMutationIssues.length > 0) {
        console.log('\n\n' + '='.repeat(60));
        console.log('⚠️  FUNCTIONS WITH QUERY/MUTATION MENTIONS');
        console.log('='.repeat(60));

        for (const item of functionsWithQueryMutationIssues) {
            console.log(`\n📦 ${item.dropin} → ${item.function}`);
            console.log(`   Source: ${item.usingEnrichment ? 'Enrichment' : 'Source MDX'}`);
            console.log(`   Description: ${item.description}`);
            console.log(`   Issues:`);
            for (const issue of item.issues) {
                console.log(`     - ${issue.type}: ${issue.matches.join(', ')}`);
            }
        }
    }

    console.log('\n✅ Verification complete!\n');
}

main().catch(console.error);

