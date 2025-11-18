#!/usr/bin/env node

/**
 * Function Documentation Generator
 * 
 * This script generates function documentation for drop-in components by:
 * 1. Scanning src/api directories for function MDX files
 * 2. Extracting TypeScript function signatures
 * 3. Combining function documentation into a single MDX file
 * 
 * USAGE:
 * - Generate all drop-ins: npm run generate-function-docs
 * - Generate single drop-in: npm run generate-function-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services
 * 
 * TEMPLATE RELATIONSHIP:
 * - Reads structure from: _dropin-templates/dropin-functions.mdx
 * - Uses: Frontmatter, imports, section structure
 * - Generates: Individual function documentation from source MDX files
 * 
 * IMPORTANT: Always verify against source repositories rather than making assumptions.
 * This ensures accuracy in function signatures, parameters, and usage examples.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

// Import shared utilities
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { loadFunctionEnrichments } from './lib/enrichment.js';
import { updateSidebarForFunctions } from './lib/sidebar.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';
import { getAllExamples } from './lib/example-extractor.js';
import { validateAndMerge, validateFunctionSignature, createValidationReport } from './lib/source-validator.js';
import { getParameterDescription } from './lib/parameter-patterns.js';

// Import new core shared libraries
import { GenericTypeHandler } from './lib/core/generic-type-handler.js';
import { EnrichmentLoader } from './lib/core/enrichment-loader.js';
import { TypeExtractor } from './lib/core/type-extractor.js';
import { validateAllFunctionDocs } from './lib/function-type-validator.js';
import { generateNoFunctionsPage } from './lib/markdown/empty-state-generator.js';
import { generatePropertyTable } from './lib/markdown/table-generator.js';

const projectRoot = getProjectRoot();

// ============================================================================
// TYPE EXTRACTION FROM SOURCE
// ============================================================================

/**
 * Extract actual type from source code based on returns_source hint
 * 
 * @param {string} returnsSource - Source hint (e.g., "state.cartId", "graphql.mutation")
 * @param {string} repoPath - Path to cloned repository
 * @param {string} functionName - Name of the function
 * @returns {Object|null} Object with {type, definition, source} or null
 */
function extractTypeFromSource(returnsSource, repoPath, functionName) {
    if (!returnsSource) return null;

    try {
        // Handle state.X pattern
        if (returnsSource.startsWith('state.')) {
            const fieldName = returnsSource.replace('state.', '');
            const statePath = join(repoPath, 'src/lib/state.ts');

            if (!existsSync(statePath)) {
                return null;
            }

            const stateContent = readFileSync(statePath, 'utf-8');

            // Look for the field definition: fieldName: Type
            const fieldPattern = new RegExp(`${fieldName}\\s*:\\s*([^;,}\\n]+)`);
            const match = stateContent.match(fieldPattern);

            if (match) {
                return {
                    type: match[1].trim(),
                    definition: `${fieldName}: ${match[1].trim()}`,
                    source: 'state'
                };
            }
        }

        // Handle model.X pattern
        if (returnsSource.startsWith('model.')) {
            const modelName = returnsSource.replace('model.', '');
            const modelDirs = [
                join(repoPath, 'src/data/models'),
                join(repoPath, 'src/models')
            ];

            for (const modelDir of modelDirs) {
                if (!existsSync(modelDir)) continue;

                // Try finding the model file (kebab-case or exact match)
                const kebabName = modelName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
                const possibleFiles = [
                    join(modelDir, `${kebabName}.ts`),
                    join(modelDir, `${modelName}.ts`),
                    join(modelDir, 'index.ts')
                ];

                for (const filePath of possibleFiles) {
                    if (!existsSync(filePath)) continue;

                    const modelContent = readFileSync(filePath, 'utf-8');

                    // Look for interface or type definition
                    const interfacePattern = new RegExp(`export interface ${modelName}\\s*\\{[\\s\\S]*?\\n\\}`, 'm');
                    const typePattern = new RegExp(`export type ${modelName}\\s*=\\s*[\\s\\S]*?;`, 'm');

                    const interfaceMatch = modelContent.match(interfacePattern);
                    const typeMatch = modelContent.match(typePattern);

                    if (interfaceMatch || typeMatch) {
                        const fullDefinition = (interfaceMatch || typeMatch)[0];
                        return {
                            type: modelName,
                            definition: `${modelName} (see structure below)`,
                            fullDefinition: fullDefinition, // Store the complete type definition
                            source: 'model'
                        };
                    }
                }
            }
        }

        // Handle graphql.X pattern
        if (returnsSource.startsWith('graphql.')) {
            const mutationName = returnsSource.replace('graphql.', '');
            const graphqlDir = join(repoPath, 'src/api', functionName, 'graphql');

            if (!existsSync(graphqlDir)) {
                return null;
            }

            // Find the GraphQL file
            const files = readdirSync(graphqlDir);
            const graphqlFile = files.find(f => f.includes(mutationName) || f.endsWith('.ts'));

            if (!graphqlFile) {
                return null;
            }

            const graphqlContent = readFileSync(join(graphqlDir, graphqlFile), 'utf-8');

            // Extract GraphQL query/mutation fields
            // This is a simplified extraction - could be enhanced
            return {
                type: 'object',
                definition: 'GraphQL response structure',
                source: 'graphql'
            };
        }

    } catch (error) {
        console.warn(`  ⚠️  Failed to extract type from ${returnsSource}:`, error.message);
    }

    return null;
}

/**
 * Extract model definition from source TypeScript files using a source hint path
 * 
 * @param {string} modelName - Name of the interface/type to extract
 * @param {string} sourceHint - Path hint to the source file (relative to repo or node_modules)
 * @param {string} repoName - Repository name (for node_modules lookup)
 * @returns {string|null} The interface/type definition or null if not found
 */
function extractModelFromSourceHint(modelName, sourceHint, repoName) {
    if (!modelName || !sourceHint) return null;

    try {
        const projectRoot = getProjectRoot();
        let sourceFilePath = null;

        // Try multiple possible locations
        const possiblePaths = [
            // node_modules (published package)
            join(projectRoot, 'node_modules', '.pnpm', `@dropins+storefront-${repoName}@*`, 'node_modules', '@dropins', `storefront-${repoName}`, sourceHint),
            // .temp-repos (cloned source)
            join(projectRoot, '.temp-repos', repoName, sourceHint),
            join(projectRoot, '.temp-repos', repoName, 'src', sourceHint)
        ];

        // Find the first existing file
        for (const path of possiblePaths) {
            // Handle glob pattern in path (for version wildcards)
            if (path.includes('*')) {
                // Get the base directory (everything before the glob pattern)
                const parts = path.split('/');
                const globIndex = parts.findIndex(p => p.includes('*'));
                const baseDir = parts.slice(0, globIndex).join('/');

                if (existsSync(baseDir)) {
                    const dirs = readdirSync(baseDir);
                    // Find the dropin version directory
                    const versionDir = dirs.find(d => d.startsWith(`@dropins+storefront-${repoName}@`));
                    if (versionDir) {
                        // Reconstruct the full path
                        const remainingPath = parts.slice(globIndex + 1).join('/');
                        const fullPath = join(baseDir, versionDir, remainingPath);
                        if (existsSync(fullPath)) {
                            sourceFilePath = fullPath;
                            break;
                        }
                    }
                }
            } else if (existsSync(path)) {
                sourceFilePath = path;
                break;
            }
        }

        if (!sourceFilePath) {
            console.warn(`  ⚠️  Could not find source file for ${modelName} using hint: ${sourceHint}`);
            return null;
        }

        const sourceContent = readFileSync(sourceFilePath, 'utf-8');

        // Try to extract interface definition
        const interfacePattern = new RegExp(`export\\s+interface\\s+${modelName}\\s*\\{[\\s\\S]*?\\n\\}`, 'm');
        const interfaceMatch = sourceContent.match(interfacePattern);

        if (interfaceMatch) {
            // Remove 'export ' prefix for cleaner output
            return interfaceMatch[0].replace(/^export\s+/, '');
        }

        // Try to extract enum definition
        const enumPattern = new RegExp(`export\\s+declare\\s+enum\\s+${modelName}\\s*\\{[\\s\\S]*?\\n\\}`, 'm');
        const enumMatch = sourceContent.match(enumPattern);

        if (enumMatch) {
            // Remove 'export declare ' prefix for cleaner output
            return enumMatch[0].replace(/^export\s+declare\s+/, '');
        }

        // Try to extract type definition
        const typePattern = new RegExp(`export\\s+type\\s+${modelName}\\s*=\\s*[\\s\\S]*?;`, 'm');
        const typeMatch = sourceContent.match(typePattern);

        if (typeMatch) {
            return typeMatch[0].replace(/^export\s+/, '');
        }

        // If not exported, try without export keyword
        const nonExportedInterface = new RegExp(`interface\\s+${modelName}\\s*\\{[\\s\\S]*?\\n\\}`, 'm');
        const nonExportedMatch = sourceContent.match(nonExportedInterface);

        if (nonExportedMatch) {
            return nonExportedMatch[0];
        }

        console.warn(`  ⚠️  Found file ${sourceFilePath} but could not extract ${modelName} definition`);
        return null;

    } catch (error) {
        console.warn(`  ⚠️  Failed to extract ${modelName} from source:`, error.message);
        return null;
    }
}

// ============================================================================
// LINK CONVERSION
// ============================================================================

/**
 * Convert external markdown links to Link component for proper external link handling
 * 
 * @param {string} text - Text containing markdown links
 * @returns {string} Text with external links converted to Link components
 */
function convertExternalLinks(text) {
    if (!text) return text;

    // Match markdown links: [text](url)
    // Only convert external links (starting with http:// or https://)
    return text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (match, linkText, url) => {
        // Strip backticks from link text for cleaner display
        const cleanText = linkText.replace(/`/g, '');
        return `<Link href="${url}" text="${cleanText}" />`;
    });
}

// ============================================================================
// EVENT EXTRACTION FROM SOURCE
// ============================================================================

/**
 * Extract events emitted by a function from its source code
 * 
 * @param {string} repoPath - Path to cloned repository
 * @param {string} functionName - Name of the function
 * @returns {string[]} Array of event names (e.g., ['cart/updated', 'cart/data'])
 */
function extractEventsFromSource(repoPath, functionName) {
    const events = new Set();

    // Convert camelCase to kebab-case for file lookup
    const fileName = functionName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    const possiblePaths = [
        join(repoPath, 'src', 'api', functionName, `${functionName}.ts`),
        join(repoPath, 'src', 'api', fileName, `${fileName}.ts`),
        join(repoPath, 'src', 'api', `${functionName}.ts`),
        join(repoPath, 'src', 'api', `${fileName}.ts`),
    ];

    let fileContent = null;
    for (const path of possiblePaths) {
        if (existsSync(path)) {
            fileContent = readFileSync(path, 'utf-8');
            break;
        }
    }

    if (!fileContent) {
        return [];
    }

    // Look for event emission patterns:
    // - events.emit('event/name')
    // - eventBus.emit('event/name')
    // - publish('event/name')
    // - emit('event/name')
    const emitPatterns = [
        /events\.emit\(['"]([^'"]+)['"]/g,
        /eventBus\.emit\(['"]([^'"]+)['"]/g,
        /publish\(['"]([^'"]+)['"]/g,
        /\.emit\(['"]([^'"]+)['"]/g,
    ];

    for (const pattern of emitPatterns) {
        let match;
        while ((match = pattern.exec(fileContent)) !== null) {
            const eventName = match[1];
            // Only add if it looks like an event name (has a slash)
            if (eventName.includes('/')) {
                events.add(eventName);
            }
        }
    }

    return Array.from(events).sort();
}

// ============================================================================
// REPOSITORY SCANNING
// ============================================================================

/**
 * Scan repository for API functions
 * 
 * @param {string} repoPath - Path to cloned repository
 * @returns {Object} Object with functions array
 */
function scanForFunctions(repoPath) {
    const apiPath = join(repoPath, 'src', 'api');
    const functions = [];

    if (!existsSync(apiPath)) {
        console.log(`  ⚠️  No src/api directory found`);
        return { functions };
    }

    try {
        const entries = readdirSync(apiPath);

        for (const entry of entries) {
            const entryPath = join(apiPath, entry);
            const stat = statSync(entryPath);

            // Skip files, only process directories
            if (!stat.isDirectory()) continue;

            // Skip special directories
            if (entry.startsWith('.') || entry === 'graphql' || entry === 'fetch-graphql') continue;

            // Look for function MDX file
            const mdxPath = join(entryPath, `${entry}.mdx`);
            const tsPath = join(entryPath, `${entry}.ts`);

            if (existsSync(mdxPath)) {
                const mdxContent = readFileSync(mdxPath, 'utf8');

                // Extract TypeScript signature if .ts file exists
                let signature = null;
                if (existsSync(tsPath)) {
                    const tsContent = readFileSync(tsPath, 'utf8');
                    signature = extractFunctionSignature(tsContent, entry);

                    // Skip non-exported functions (respect public API boundary)
                    if (!signature) {
                        console.log(`  ⚠️  Skipping ${entry} - function is not exported (not part of public API)`);
                        continue;
                    }
                } else {
                    // No .ts file found - skip this function
                    console.log(`  ⚠️  Skipping ${entry} - no .ts file found (cannot verify it's exported)`);
                    continue;
                }

                functions.push({
                    name: entry,
                    mdxContent,
                    signature,
                    mdxPath: mdxPath.replace(repoPath, '')
                });
            }
        }

        console.log(`  ✓ Found ${functions.length} API functions`);
    } catch (error) {
        console.error(`  ⚠️  Error scanning API directory: ${error.message}`);
    }

    return { functions };
}

/**
 * Extract function signature from TypeScript source
 * 
 * @param {string} tsContent - TypeScript file content
 * @param {string} functionName - Name of the function to extract
 * @returns {string|null} Function signature or null if not found
 */
function extractFunctionSignature(tsContent, functionName) {
    // Debug logging
    if (functionName === 'getFetchedProductData' || functionName === 'setProductConfigurationValid') {
        console.log(`\n🔍 DEBUG: extractFunctionSignature called for ${functionName}`);
    }

    // Use regex to find the function start, then manually extract with balanced parenthesis matching
    const patterns = [
        { regex: new RegExp(`export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\(`, 's'), isAsync: true, isArrow: true },
        { regex: new RegExp(`export\\s+const\\s+${functionName}\\s*=\\s*\\(`, 's'), isAsync: false, isArrow: true },
        { regex: new RegExp(`export\\s+async\\s+function\\s+${functionName}\\s*\\(`, 's'), isAsync: true, isArrow: false },
        { regex: new RegExp(`export\\s+function\\s+${functionName}\\s*\\(`, 's'), isAsync: false, isArrow: false },
    ];

    for (const { regex, isAsync, isArrow } of patterns) {
        const match = tsContent.match(regex);
        if (match) {
            const startIndex = match.index + match[0].length - 1; // Position of opening paren

            // Extract parameters with balanced parenthesis matching
            let parenCount = 0;
            let i = startIndex;
            let paramsStr = '';
            let inString = false;
            let stringChar = '';

            for (; i < tsContent.length; i++) {
                const char = tsContent[i];
                const prevChar = i > 0 ? tsContent[i - 1] : '';

                // Handle string literals
                if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
                    if (!inString) {
                        inString = true;
                        stringChar = char;
                    } else if (char === stringChar) {
                        inString = false;
                    }
                }

                if (inString) {
                    if (parenCount > 0) paramsStr += char;
                    continue;
                }

                // Count parentheses
                if (char === '(') {
                    parenCount++;
                    if (parenCount > 1) paramsStr += char;
                } else if (char === ')') {
                    parenCount--;
                    if (parenCount === 0) {
                        // Found the matching closing paren
                        i++; // Move past the closing paren
                        break;
                    }
                    paramsStr += char;
                } else if (parenCount > 0) {
                    paramsStr += char;
                }
            }

            // Now extract the return type if present
            let returnType = null;

            // Skip whitespace after closing paren
            while (i < tsContent.length && /\s/.test(tsContent[i])) {
                i++;
            }

            // Check for explicit return type annotation ": Type"
            if (tsContent[i] === ':') {
                i++; // Skip the colon
                // Skip whitespace
                while (i < tsContent.length && /\s/.test(tsContent[i])) {
                    i++;
                }

                // Extract return type until we find => or {
                let returnTypeStr = '';
                let angleCount = 0;
                let braceCount = 0;

                while (i < tsContent.length) {
                    const char = tsContent[i];
                    const nextChar = i + 1 < tsContent.length ? tsContent[i + 1] : '';

                    if (char === '<') angleCount++;
                    else if (char === '>') angleCount--;
                    else if (char === '{') braceCount++;
                    else if (char === '}') braceCount--;

                    // Stop at => or { (function body) when not inside brackets
                    if (angleCount === 0 && braceCount === 0) {
                        if ((char === '=' && nextChar === '>') || char === '{') {
                            returnType = returnTypeStr.trim();
                            break;
                        }
                    }

                    returnTypeStr += char;
                    i++;
                }
            }

            // If no explicit return type, infer based on async
            if (!returnType) {
                returnType = isAsync ? 'Promise<any>' : 'any';
            }

            // Clean up params string (remove extra whitespace, normalize line breaks)
            const params = paramsStr.trim().replace(/\s+/g, ' ');

            // Debug logging
            if (functionName === 'getFetchedProductData' || functionName === 'setProductConfigurationValid') {
                console.log(`\n🔍 DEBUG: Extracted ${functionName}:`);
                console.log('  Raw params:', JSON.stringify(paramsStr));
                console.log('  Cleaned params:', JSON.stringify(params));
                console.log('  Return type:', returnType);
            }

            return { params, returnType };
        }
    }

    return null;
}

// Note: extractModelDefinitionFromSource and searchFileForType have been replaced
// by the shared TypeExtractor class from lib/core/type-extractor.js

/**
 * Parse TypeScript parameters string into structured parameter objects
 * 
 * @param {string} paramsString - The parameters part of a function signature
 * @returns {Array<{name: string, type: string, optional: boolean}>} Parsed parameters
 */
function parseTypeScriptParameters(paramsString) {
    if (!paramsString || paramsString.trim().length === 0) {
        return [];
    }

    const parameters = [];
    let current = '';
    let depth = 0;
    let inGeneric = false;

    // Track bracket types for complex nested structures
    for (let i = 0; i < paramsString.length; i++) {
        const char = paramsString[i];

        if (char === '<') {
            inGeneric = true;
            depth++;
        } else if (char === '>') {
            depth--;
            if (depth === 0) inGeneric = false;
        } else if (char === '{' || char === '[' || char === '(') {
            depth++;
        } else if (char === '}' || char === ']' || char === ')') {
            depth--;
        }

        // Split on comma only at depth 0 (top level parameters)
        if (char === ',' && depth === 0 && !inGeneric) {
            if (current.trim()) {
                parameters.push(parseParameter(current.trim()));
            }
            current = '';
        } else {
            current += char;
        }
    }

    // Don't forget the last parameter
    if (current.trim()) {
        parameters.push(parseParameter(current.trim()));
    }

    return parameters.filter(p => p !== null);
}

/**
 * Parse a single parameter into name, type, and optional status
 * 
 * @param {string} paramStr - Single parameter string like "sku: string" or "quantity?: number"
 * @returns {{name: string, type: string, optional: boolean}|null}
 */
function parseParameter(paramStr) {
    // Handle destructured parameters: { sku, quantity }: { sku: string, quantity: number }
    // For now, we'll skip these as they're complex
    if (paramStr.startsWith('{') && paramStr.includes('}:')) {
        // This is object destructuring - extract type after the colon
        const colonIndex = paramStr.lastIndexOf(':');
        if (colonIndex > -1) {
            const type = paramStr.substring(colonIndex + 1).trim();
            return {
                name: 'options',
                type: type,
                optional: false
            };
        }
    }

    // Standard parameter: name: type or name?: type
    const colonIndex = paramStr.indexOf(':');
    if (colonIndex === -1) {
        // No type annotation found - might be param with default value only
        // Example: authType = 'Authorization'
        const equalsIndex = paramStr.indexOf('=');
        if (equalsIndex > -1) {
            // Has default value but no type annotation
            const name = paramStr.substring(0, equalsIndex).trim();
            const defaultValue = paramStr.substring(equalsIndex + 1).trim();

            // Infer type from default value
            let inferredType = 'any';
            if (defaultValue.startsWith("'") || defaultValue.startsWith('"') || defaultValue.startsWith('`')) {
                inferredType = 'string';
            } else if (defaultValue === 'true' || defaultValue === 'false') {
                inferredType = 'boolean';
            } else if (!isNaN(defaultValue)) {
                inferredType = 'number';
            }

            return {
                name: name,
                type: inferredType,
                optional: true, // Has default value, so it's optional
                inferredType: true // Flag to indicate type was inferred
            };
        }

        // No type annotation and no default value - skip this parameter
        return null;
    }

    let name = paramStr.substring(0, colonIndex).trim();
    let type = paramStr.substring(colonIndex + 1).trim();
    let optional = false;

    // Check for optional parameter (ends with ?)
    if (name.endsWith('?')) {
        optional = true;
        name = name.slice(0, -1).trim();
    }

    // Check for default value (contains =)
    const equalsIndex = type.indexOf('=');
    if (equalsIndex > -1) {
        optional = true;
        type = type.substring(0, equalsIndex).trim();
    }

    // Clean up type (remove wrapping parentheses if present)
    type = type.replace(/^\((.+)\)$/, '$1');

    return { name, type, optional };
}

/**
 * Extract nested properties from an inline object type
 * 
 * @param {string} objectType - Object type string like "{ sku: string; quantity: number }[]" or "[{ ... }]"
 * @returns {Array<{name: string, type: string, optional: boolean, comment?: string}>} Nested properties
 */
function extractNestedProperties(objectType) {
    const properties = [];

    // Remove array brackets if present (handle both formats: {...}[] and [{...}])
    let cleanType = objectType.trim();

    // Handle array notation at the end: { ... }[]
    if (cleanType.endsWith('[]')) {
        cleanType = cleanType.slice(0, -2).trim();
    }

    // Handle tuple/array notation at the beginning: [{ ... }]
    if (cleanType.startsWith('[') && cleanType.endsWith(']')) {
        cleanType = cleanType.slice(1, -1).trim();
    }

    // Extract content between braces
    const match = cleanType.match(/^\{([\s\S]*)\}$/);
    if (!match) return properties;

    const content = match[1];
    let current = '';
    let depth = 0;

    // Split on semicolons at depth 0
    for (let i = 0; i < content.length; i++) {
        const char = content[i];

        if (char === '{' || char === '[' || char === '<') {
            depth++;
        } else if (char === '}' || char === ']' || char === '>') {
            depth--;
        }

        if (char === ';' && depth === 0) {
            if (current.trim()) {
                // Look ahead to check if there's a comment on the same line after the semicolon
                let comment = null;
                let j = i + 1;
                let lookAhead = '';
                while (j < content.length && content[j] !== '\n') {
                    lookAhead += content[j];
                    j++;
                }
                // Check if the look-ahead contains a comment
                const commentMatch = lookAhead.match(/^\s*\/\/(.*)$/);
                if (commentMatch) {
                    comment = commentMatch[1].trim();
                    // Skip the characters we've looked ahead (including the comment)
                    i = j - 1; // -1 because the loop will increment i
                }

                // Parse the current property
                const cleanCurrent = current.trim();
                const param = parseParameter(cleanCurrent);
                if (param) {
                    if (comment) {
                        param.comment = comment;
                    }
                    properties.push(param);
                }
            }
            current = '';
        } else {
            current += char;
        }
    }

    // Don't forget the last property
    if (current.trim()) {
        // Extract inline comment before removing it
        const commentMatch = current.match(/\/\/(.*)$/m);
        const comment = commentMatch ? commentMatch[1].trim() : null;

        // Remove inline comments before parsing
        const cleanCurrent = current.replace(/\/\/.*$/m, '').trim();
        const param = parseParameter(cleanCurrent);
        if (param) {
            if (comment) {
                param.comment = comment;
            }
            properties.push(param);
        }
    }

    return properties;
}

// ============================================================================
// CONTENT GENERATION
// ============================================================================

/**
 * Generate description from function name for placeholder replacements
 * 
 * @param {string} functionName - Name of the function
 * @returns {string} Generated description
 */
function generateDescriptionFromName(functionName) {
    if (functionName.startsWith('publish')) {
        return 'Publishes analytics or tracking events for monitoring and reporting.';
    }
    if (functionName.startsWith('confirm')) {
        const subject = functionName.replace(/^confirm/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Confirms ${readableSubject} with provided credentials or parameters.`;
    }
    if (functionName.startsWith('get')) {
        const subject = functionName.replace(/^get/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Returns ${readableSubject} from the current state or cache.`;
    }
    if (functionName.startsWith('update')) {
        return 'Updates data in the Adobe Commerce backend.';
    }
    if (functionName.startsWith('add')) {
        return 'Adds items or data to the system.';
    }
    if (functionName.startsWith('remove')) {
        return 'Removes items or data from the system.';
    }
    if (functionName.startsWith('create')) {
        return 'Creates new entities or resources.';
    }
    if (functionName.startsWith('delete')) {
        return 'Deletes entities or resources.';
    }
    if (functionName.startsWith('cancel')) {
        const subject = functionName.replace(/^cancel/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Cancels ${readableSubject || 'the current operation'}.`;
    }
    if (functionName.startsWith('place')) {
        const subject = functionName.replace(/^place/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Places ${readableSubject || 'an order or request'}.`;
    }
    if (functionName.startsWith('reorder')) {
        return 'Reorders items from a previous order.';
    }
    if (functionName.startsWith('initialize')) {
        return 'Initializes the drop-in or component with configuration.';
    }
    if (functionName.startsWith('set')) {
        const subject = functionName.replace(/^set/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Sets ${readableSubject} in the state or configuration.`;
    }
    if (functionName.startsWith('apply')) {
        return 'Applies changes or modifications to the system.';
    }

    // Default fallback
    return 'API function for the drop-in.';
}

/**
 * Clean function description from MDX content
 * 
 * @param {string} mdxContent - MDX file content
 * @param {string} functionName - Name of the function
 * @returns {string|null} Cleaned description or null if not found
 */
function cleanFunctionDescription(mdxContent, functionName) {
    // Extract description (first paragraph after h1)
    const descMatch = mdxContent.match(/^# \w+\n\n(.+?)$/m);
    if (!descMatch) return null;

    let description = descMatch[1];

    // If the "description" is actually a code block marker, there's no real description
    if (/^```/.test(description)) {
        return generateDescriptionFromName(functionName);
    }

    // Filter out placeholder/test descriptions BEFORE cleaning
    const placeholders = [
        /howdy world/i,
        /hello world/i,
        /test function/i,
        /todo/i,
        /placeholder/i,
        /^returns ".*?"\.?$/i
    ];

    let isPlaceholder = false;
    for (const placeholder of placeholders) {
        if (placeholder.test(description)) {
            // Generate a basic description from the function name
            description = generateDescriptionFromName(functionName);
            isPlaceholder = true;
            break;
        }
    }

    // Clean up description (only if not already replaced)
    if (!isPlaceholder) {
        description = description
            .replace(/^A function that /, '')
            .replace(/"\.$/, '')      // Remove trailing "."
            .replace(/"\.?$/, '.');   // Remove trailing " or ".

        // Capitalize first letter after removing prefix
        if (description.length > 0) {
            description = description.charAt(0).toUpperCase() + description.slice(1);
        }
    }

    // Remove redundant first sentence if it just restates the function name
    const sentences = description.split(/\.\s+/);
    if (sentences.length > 1) {
        const firstSentence = sentences[0].toLowerCase();

        if (firstSentence.includes(`\`${functionName.toLowerCase()}\` function`)) {
            const nameWords = functionName.replace(/([A-Z])/g, ' $1').toLowerCase().trim().split(/\s+/);
            const actionWord = nameWords[0];

            if (firstSentence.includes(actionWord)) {
                description = sentences.slice(1).join('. ').trim();
                if (!description.endsWith('.')) description += '.';
            }
        }
    }

    return description;
}

/**
 * Normalize description to start with a verb for parallel structure in function tables
 * 
 * @param {string} description - Function description
 * @param {string} functionName - Name of the function
 * @returns {string} Description starting with a verb
 */
function normalizeDescriptionToVerb(description, functionName) {
    if (!description) return description;

    let normalized = description;

    // Remove "The [functionName] query/mutation/function " prefix (handles GraphQL terminology)
    const functionPrefixPattern = new RegExp(`^The \`?${functionName}\`? (query|mutation|function) `, 'i');
    normalized = normalized.replace(functionPrefixPattern, '');

    // Remove generic "The [functionName] " prefix (even without function/query/mutation)
    const simpleFunctionPattern = new RegExp(`^The \`?${functionName}\`? `, 'i');
    normalized = normalized.replace(simpleFunctionPattern, '');

    // Remove generic "The function/query/mutation " prefix
    normalized = normalized.replace(/^The (function|query|mutation) /i, '');

    // Remove "A function that " prefix
    normalized = normalized.replace(/^A function that /i, '');

    // Remove "An API function that " prefix
    normalized = normalized.replace(/^An API function that /i, '');

    // Handle passive voice constructions (before capitalization)
    // "is used to X" → "X"
    normalized = normalized.replace(/^is used to /i, '');

    // "can be used to X" → "X"
    normalized = normalized.replace(/^can be used to /i, '');

    // "allows you to X" → "X"
    normalized = normalized.replace(/^allows you to /i, '');

    // Handle "is simmilar/similar to" pattern - keep it but fix capitalization
    normalized = normalized.replace(/^is (similar|simmilar) to/i, 'Is $1 to');

    // Capitalize first letter (but preserve intentional uppercase patterns like "Is similar")
    if (normalized.length > 0 && !normalized.match(/^[A-Z]/)) {
        normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }

    // Ensure it ends with a period
    if (normalized && !normalized.endsWith('.')) {
        normalized += '.';
    }

    return normalized;
}

/**
 * Generate functions MDX content
 * 
 * @param {string} repoName - Repository name (e.g., 'cart')
 * @param {Object} repoConfig - Repository configuration
 * @param {Object|string} versionInfo - Version info object or version string
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string} Generated MDX content
 */
function generateFunctionsMDX(repoName, repoConfig, scannedData, versionInfo, enrichmentData = null) {
    // Handle versionInfo object or string
    const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
    const { functions } = scannedData;

    if (functions.length === 0) {
        return generateEmptyFunctionsDocs(repoName, repoConfig, version);
    }

    // Create validation report for source-first validation
    const validationReport = createValidationReport();

    // Sort functions alphabetically
    functions.sort((a, b) => a.name.localeCompare(b.name));

    // First pass: Extract model definitions from TypeScript return types
    const modelDefinitions = new Map(); // modelName -> { definition: string, count: number, functions: string[] }
    const inputModelDefinitions = new Map(); // inputModelName -> { definition: string, description: string, functions: string[] }
    const outputModelDefinitions = new Map(); // outputModelName -> { definition: string, description: string, functions: string[] }

    // Calculate repository path
    const repoPath = join(getProjectRoot(), '.temp-repos', repoName);

    // Create TypeExtractor instance for this repository
    const typeExtractor = new TypeExtractor(repoPath);

    // Extract models from function return types
    functions.forEach(func => {
        if (func.signature && func.signature.returnType) {
            let returnType = func.signature.returnType;

            // Extract the actual type from Promise<Type>
            const promiseMatch = returnType.match(/^Promise<(.+)>$/);
            const actualType = promiseMatch ? promiseMatch[1] : returnType;

            // Look for custom type names (PascalCase identifiers)
            // Match: CartModel, ShippingMethod, Customer, ProductSearchResult, etc.
            // But exclude built-in types
            const builtInTypes = ['Promise', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Object', 'Function', 'RegExp', 'Error', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Symbol', 'Partial', 'Required', 'Readonly', 'Record', 'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'Parameters', 'ReturnType'];

            // Match PascalCase identifiers (at least 3 chars, starts with capital)
            const typePattern = /\b([A-Z][a-z]+[A-Z]\w*|[A-Z][a-z]{2,}\w*)\b/g;
            const typeMatches = actualType.match(typePattern);

            if (typeMatches) {
                // Deduplicate and filter out built-in types
                const uniqueTypes = [...new Set(typeMatches)].filter(type => !builtInTypes.includes(type));

                uniqueTypes.forEach(typeName => {
                    // Try to find the type definition in TypeScript source using shared TypeExtractor
                    const typeDefinition = typeExtractor.extractModelDefinition(typeName);

                    if (typeDefinition) {
                        if (!modelDefinitions.has(typeName)) {
                            modelDefinitions.set(typeName, { definition: typeDefinition, count: 0, functions: [] });
                        }
                        const modelData = modelDefinitions.get(typeName);
                        modelData.count++;
                        modelData.functions.push(func.name);
                    }
                });
            }
        }
    });

    // Generate function index table (wrapped in TableWrapper with first column nowrap)
    // Description column should wrap, only Function name column should not wrap
    let functionsTable = '<TableWrapper nowrap={[0]}>\n\n';
    functionsTable += '| Function | Description |\n';
    functionsTable += '| --- | --- |\n';
    functions.forEach(func => {
        const enrichment = enrichmentData && enrichmentData[func.name] ? enrichmentData[func.name] : null;

        // Get description (from enrichment or extract from MDX)
        let description = enrichment && enrichment.description ? enrichment.description : null;
        if (!description) {
            description = cleanFunctionDescription(func.mdxContent, func.name);
        }

        // Normalize description to start with a verb for parallel structure
        description = normalizeDescriptionToVerb(description, func.name);

        // Use first sentence only for table
        let shortDesc = description || 'API function for the drop-in.';
        const firstSentence = shortDesc.split(/\.\s+/)[0] + '.';

        // Remove markdown formatting for table cell
        const cleanDesc = firstSentence
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
            .replace(/`([^`]+)`/g, '$1') // Remove code formatting
            .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
            .replace(/\n/g, ' '); // Remove newlines

        functionsTable += `| [\`${func.name}\`](#${func.name.toLowerCase()}) | ${cleanDesc} |\n`;
    });
    functionsTable += '\n</TableWrapper>';

    // Generate functions content
    let functionsContent = '';
    functions.forEach(func => {
        // Check for enrichment data for this function
        const enrichment = enrichmentData && enrichmentData[func.name] ? enrichmentData[func.name] : null;

        // Collect input models from enrichment data
        if (enrichment && enrichment.input_models) {
            Object.entries(enrichment.input_models).forEach(([modelName, modelData]) => {
                if (!inputModelDefinitions.has(modelName)) {
                    // Extract definition from source if source_hint is provided
                    let definition = modelData.definition; // Fallback to hardcoded if present
                    if (modelData.source_hint) {
                        const extracted = extractModelFromSourceHint(modelName, modelData.source_hint, repoName);
                        if (extracted) {
                            definition = extracted;
                        } else if (!definition) {
                            console.warn(`  ⚠️  No definition found for ${modelName}, skipping`);
                            return;
                        }
                    }

                    inputModelDefinitions.set(modelName, {
                        definition: definition,
                        description: modelData.description,
                        functions: [func.name]
                    });
                } else {
                    const existing = inputModelDefinitions.get(modelName);
                    existing.functions.push(func.name);
                }
            });
        }

        // Collect output models from enrichment data (for return types)
        if (enrichment && enrichment.output_models) {
            Object.entries(enrichment.output_models).forEach(([modelName, modelData]) => {
                if (!outputModelDefinitions.has(modelName)) {
                    // Extract definition from source if source_hint is provided
                    let definition = modelData.definition; // Fallback to hardcoded if present
                    if (modelData.source_hint) {
                        const extracted = extractModelFromSourceHint(modelName, modelData.source_hint, repoName);
                        if (extracted) {
                            definition = extracted;
                        } else if (!definition) {
                            console.warn(`  ⚠️  No definition found for ${modelName}, skipping`);
                            return;
                        }
                    }

                    outputModelDefinitions.set(modelName, {
                        definition: definition,
                        description: modelData.description,
                        functions: [func.name]
                    });
                } else {
                    const existing = outputModelDefinitions.get(modelName);
                    existing.functions.push(func.name);
                }
            });
        }

        // SOURCE-FIRST VALIDATION: Validate and merge source data with enrichment
        const validationResult = validateAndMerge({
            itemName: func.name,
            itemType: 'function',
            sourceData: {
                signature: func.signature,
                params: func.params,
                returnType: func.returnType
            },
            manualData: enrichment || {},
            warnOnMismatch: true
        });

        // Add to validation report
        validationReport.addItem(func.name, validationResult);

        // Use merged data (source takes precedence for technical specs)
        const mergedData = validationResult.data;

        // Check if original MDX has usage examples
        const originalMDX = func.mdxContent;
        const hasOriginalUsage = /^#{2,4}\s+Usage/m.test(originalMDX);
        const hasOriginalExamples = /^#{2,4}\s+Examples/m.test(originalMDX);

        // Simplified strategy: Extract ONLY text descriptions from original MDX
        // Discard ALL code blocks, signatures, tables, and structured sections
        // We're generating those fresh from source code

        let funcContent = originalMDX;

        // Remove Storybook imports and Meta tags
        funcContent = funcContent.replace(/import\s+{\s*Meta\s*}\s+from\s+['"]@storybook\/blocks['"];?\s*/g, '');
        funcContent = funcContent.replace(/<Meta\s+title=["'][^"']*["']\s*\/>/g, '');

        // Remove ALL code blocks (imports, usage, signatures, examples, etc.)
        funcContent = funcContent.replace(/```[\s\S]*?```/gm, '');

        // Remove the H1 function name heading (may not be at start after code block removal)
        funcContent = funcContent.replace(new RegExp(`#\\s+${func.name}\\s*\\n`, 'gm'), '');

        // Remove ALL section headings and their structured content
        // (Usage, Examples, Return type, Parameters, etc.)
        funcContent = funcContent.replace(/^##\s+.+$/gm, '');

        // Remove ALL tables (parameter tables, etc.)
        funcContent = funcContent.replace(/^\|.+\|$/gm, '');

        // What's left should be just the descriptive text paragraphs
        // Clean up multiple consecutive newlines
        funcContent = funcContent.replace(/\n{3,}/g, '\n\n');
        funcContent = funcContent.trim();

        // Add the function section with H2 heading
        functionsContent += `## ${func.name}\n\n`;

        // Use enriched description if available, otherwise extract and clean from MDX
        let description = enrichment && enrichment.description ? enrichment.description : null;
        if (!description) {
            description = cleanFunctionDescription(func.mdxContent, func.name);
        }
        if (description) {
            // Convert external markdown links to Link components
            description = convertExternalLinks(description);
            functionsContent += `${description}\n\n`;
        }

        // Add Signature section - ALWAYS from source code (never enrichment)
        // Enrichment cannot override TypeScript source
        let signature = func.signature;

        if (signature) {
            let returnType = signature.returnType.replace(/\s*=>\s*$/, '');
            let params = signature.params;

            // Format all signatures with parameters on separate lines for consistency and readability
            let formattedParams = '';
            let currentParam = '';
            let depth = 0;
            let hasMultipleParams = false;

            for (let i = 0; i < params.length; i++) {
                const char = params[i];
                if (char === '{' || char === '[') depth++;
                if (char === '}' || char === ']') depth--;

                if (char === ',' && depth === 0) {
                    hasMultipleParams = true;
                    formattedParams += '\n  ' + currentParam.trim() + ',';
                    currentParam = '';
                } else {
                    currentParam += char;
                }
            }

            if (currentParam.trim()) {
                formattedParams += '\n  ' + currentParam.trim();
            }

            // Format signature (without export const for cleaner documentation)
            // Note: returnType already includes Promise<> from extraction, don't wrap again
            if (hasMultipleParams || params.trim().length > 50) {
                functionsContent += `\`\`\`ts\nconst ${func.name} = async (${formattedParams}\n): ${returnType}\n\`\`\`\n\n`;
            } else if (params.trim().length > 0) {
                functionsContent += `\`\`\`ts\nconst ${func.name} = async (\n  ${params.trim()}\n): ${returnType}\n\`\`\`\n\n`;
            } else {
                functionsContent += `\`\`\`ts\nconst ${func.name} = async (): ${returnType}\n\`\`\`\n\n`;
            }
        }

        // Add Parameters table (extracted from TypeScript signature)
        // No heading - parameters go directly under signature
        if (signature && signature.params && signature.params.trim().length > 0) {
            const parameters = parseTypeScriptParameters(signature.params);

            if (parameters.length > 0) {
                // Transform parameters into format expected by generatePropertyTable
                const tableItems = [];

                parameters.forEach(param => {
                    let type = param.type;

                    // Check if this is an inline object type with nested properties
                    const hasNestedProps = type.includes('{') && type.includes('}') && type.includes(':');

                    if (hasNestedProps) {
                        // Extract nested properties from the inline object
                        const nestedProps = extractNestedProperties(type);

                        if (nestedProps.length > 0) {
                            // Show each nested property as a separate row
                            nestedProps.forEach(nestedProp => {
                                const description = getParameterDescription(
                                    nestedProp.name,
                                    enrichment,
                                    nestedProp.comment,
                                    repoName,
                                    func.name
                                );

                                tableItems.push({
                                    name: nestedProp.name,
                                    type: nestedProp.type,
                                    required: !nestedProp.optional,
                                    description: description
                                });
                            });
                            return; // Skip the default handling for this parameter
                        }
                    }

                    // Default handling for non-object parameters
                    // Simplify complex types for table display
                    if (type.includes('\n') || type.length > 80) {
                        // For object types, just show "object" or "object[]"
                        if (type.includes('{') && type.includes('}')) {
                            type = type.endsWith('[]') ? 'object[]' : 'object';
                        }
                        // For other long types, truncate
                        else if (type.length > 80) {
                            type = type.substring(0, 77) + '...';
                        }
                    }

                    // Get description using parameter patterns with fallback hierarchy
                    const description = getParameterDescription(
                        param.name,
                        enrichment,
                        null, // No inline comment for top-level params
                        repoName,
                        func.name
                    );

                    tableItems.push({
                        name: param.name,
                        type: type,
                        required: !param.optional,
                        description: description
                    });
                });

                // Use shared library to generate table
                functionsContent += generatePropertyTable(tableItems, {
                    nowrapColumns: [0, 1]
                });
                functionsContent += '\n\n';
            }
        }

        // Determine if we should generate Usage section or keep the original
        // PRIORITY: Source code examples > Original MDX usage > Enrichment examples
        const sourceExamples = getAllExamples(repoName, func.name, 3);
        const enrichmentExamples = enrichment && enrichment.examples && Array.isArray(enrichment.examples) ? enrichment.examples : [];

        // Filter out invalid examples and deduplicate (aggressive normalization for comparison)
        const seenExamples = new Set();
        const filterExamples = (examples) => examples.filter(ex => {
            // Skip examples with no code or empty code
            if (!ex.code || ex.code.trim().length === 0) {
                return false;
            }

            // Remove ALL whitespace, quotes, trailing commas, case differences
            // Also strip out dummy values like IDs, tokens, auth keys (same as example-extractor.js)
            const normalized = ex.code
                .replace(/\s+/g, '')  // Remove ALL whitespace
                .replace(/['"`]/g, '') // Remove quotes
                .replace(/,$/gm, '')   // Remove trailing commas
                .replace(/;$/gm, '')   // Remove trailing semicolons
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

            // Skip if normalized code is empty or too short to be meaningful
            if (normalized.length < 5) {
                return false;
            }

            // Check for duplicates
            if (seenExamples.has(normalized)) {
                return false;
            }
            seenExamples.add(normalized);
            return true;
        });

        const validSourceExamples = filterExamples(sourceExamples);
        const validEnrichmentExamples = filterExamples(enrichmentExamples);

        // Decide what to do about Usage section:
        // 1. If we have extracted source examples, use them (override original MDX)
        // 2. Else if original MDX has Usage, keep it (don't remove)
        // 3. Else if we have enrichment examples, use them
        // 4. Else no Usage section

        let shouldGenerateUsage = false;
        let examplesForOutput = [];

        if (validSourceExamples.length > 0) {
            // We have extracted examples from source code - use them and remove original Usage
            shouldGenerateUsage = true;
            examplesForOutput = validSourceExamples;
            // Remove Usage section from funcContent since we're replacing it
            // Must happen before heading level conversion
            // Try multiple patterns to ensure we catch it
            funcContent = funcContent.replace(/^#{2,6}\s+Usage[\s\S]*?(?=^#{2,6}\s|\Z)/gm, '');
            funcContent = funcContent.replace(/##\s+Usage[\s\S]*$/m, ''); // Also try H2 until end
            console.log(`  ${func.name}: Using ${examplesForOutput.length} extracted source examples`);
        } else if (hasOriginalUsage || hasOriginalExamples) {
            // Original MDX has usage/examples - keep them (don't remove, don't generate new)
            // But always remove the Usage section if there's an Examples section (Examples is better)
            if (hasOriginalExamples) {
                funcContent = funcContent.replace(/^#{2,6}\s+Usage[\s\S]*?(?=^#{2,6}\s|\Z)/gm, '');
            }
            shouldGenerateUsage = false;
            console.log(`  ${func.name}: Keeping original MDX ${hasOriginalExamples ? 'examples' : 'usage'}`);
        } else if (validEnrichmentExamples.length > 0) {
            // No extracted examples, no original usage, but we have enrichment examples
            shouldGenerateUsage = true;
            examplesForOutput = validEnrichmentExamples;
            console.log(`  ${func.name}: Using ${examplesForOutput.length} enrichment examples`);
        } else {
            // No examples from any source
            console.log(`  ${func.name}: No usage examples found`);
        }

        if (shouldGenerateUsage && examplesForOutput.length > 0) {
            functionsContent += `### Examples\n\n`;

            // Generate import statement to include in each code block
            const importStatement = `import { ${func.name} } from '@dropins/storefront-${repoName}/api';`;

            // Add all examples with import statement in each code block
            examplesForOutput.forEach((example, index) => {
                if (example.title) {
                    functionsContent += `${example.title}:\n\n`;
                }
                if (example.code) {
                    // Remove any import statements from the example code
                    let cleanCode = example.code;
                    cleanCode = cleanCode.replace(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\s*/g, '');

                    // Final normalization: ensure code starts at column 0
                    const lines = cleanCode.split('\n');
                    let minIndent = Infinity;
                    lines.forEach(line => {
                        if (line.trim().length > 0) {
                            const leadingSpaces = line.match(/^(\s*)/)[1].length;
                            minIndent = Math.min(minIndent, leadingSpaces);
                        }
                    });

                    if (minIndent > 0 && minIndent < Infinity) {
                        cleanCode = lines.map(line => {
                            if (line.trim().length === 0) return '';
                            return line.substring(minIndent);
                        }).join('\n');
                    }

                    cleanCode = cleanCode.trim();

                    // Check if code already has code block markers
                    if (cleanCode.includes('```')) {
                        functionsContent += `${cleanCode}\n\n`;
                    } else {
                        // Include import statement at the top of each code block
                        functionsContent += `\`\`\`js\n${importStatement}\n\n${cleanCode}\n\`\`\`\n\n`;
                    }
                }
            });
        }

        // Add Events section from source code (CODE-FIRST strategy)
        // ALWAYS add Events section for every function
        let eventsContent = '';

        // PRIMARY: Extract events from source code
        const emittedEvents = extractEventsFromSource(repoPath, func.name);

        if (emittedEvents.length > 0) {
            // Check if enrichment provides a complete event description
            // (starts with "Emits" and contains event names)
            const hasCompleteEnrichment = enrichment && enrichment.events &&
                enrichment.events.startsWith('Emits') &&
                emittedEvents.some(e => enrichment.events.includes(`\`${e}\``));

            if (hasCompleteEnrichment) {
                // Use ONLY enrichment (it's more explicit and complete)
                eventsContent = enrichment.events;
            } else {
                // Build events content from extracted events
                if (emittedEvents.length === 1) {
                    eventsContent = `Emits the \`${emittedEvents[0]}\` event.`;
                } else {
                    const eventList = emittedEvents.map(e => `\`${e}\``).join(', ');
                    eventsContent = `Emits the following events: ${eventList}.`;
                }

                // OPTIONAL: Add enrichment context if available (editorial layer on top of code)
                if (enrichment && enrichment.events) {
                    eventsContent += '\n\n' + enrichment.events;
                }
            }

            // Auto-link event names to events documentation
            // Match event names in backticks like `cart/data`, `cart/updated`, etc.
            eventsContent = eventsContent.replace(/`([a-z-]+\/[a-z-]+)`/g, (match, eventName) => {
                // Skip auto-linking for dropins without events pages
                const dropinsWithoutEvents = ['personalization'];
                if (dropinsWithoutEvents.includes(repoName)) {
                    return match; // Return original backticked text without linking
                }

                // Create base anchor: cart/data -> cartdata
                const baseAnchor = eventName.replace(/\//g, '').toLowerCase();

                // Per-dropin mapping of bidirectional events (emits-and-listens)
                // Events can be bidirectional in one dropin but only emit in another
                const emitsAndListensByDropin = {
                    // B2C drop-ins
                    'cart': ['cart/data', 'cart/merged', 'cart/reset', 'cart/updated', 'shipping/estimate'],
                    'checkout': ['cart/data', 'checkout/error', 'checkout/initialized', 'checkout/updated', 'shipping/estimate'],
                    'order': ['order/data'],
                    'product-details': ['pdp/data', 'pdp/values'],
                    'recommendations': ['recommendations/data'],
                    'product-discovery': ['search/error', 'search/loading', 'search/result'],
                    'wishlist': ['wishlist/alert', 'wishlist/data', 'wishlist/reset'],
                    // B2B drop-ins
                    'quote-management': ['quote-management/permissions', 'quote-management/quote-data', 'quote-management/quote-renamed', 'quote-management/quote-sent-for-review', 'quote-management/shipping-address-set'],
                    'purchase-order': ['purchase-order/data', 'purchase-order/refresh'],
                    'requisition-list': ['requisitionList/alert', 'requisitionList/data', 'requisitionLists/data'],
                    'company-switcher': ['companyContext/changed'],
                    'company-management': ['auth/permissions']
                };

                // Default to -emits since most events only have an "Emits" section
                let anchorSuffix = '-emits';
                const dropinBidirectionalEvents = emitsAndListensByDropin[repoName] || [];
                if (dropinBidirectionalEvents.includes(eventName)) {
                    anchorSuffix = '-emits-and-listens';
                }

                // Link to the events page with full anchor (use absolute path for proper link validation)
                //  Use /dropins-b2b/ for B2B drop-ins, /dropins/ for B2C
                const basePath = repoConfig.type === 'B2B' ? '/dropins-b2b' : '/dropins';
                return `[\`${eventName}\`](${basePath}/${repoName}/events/#${baseAnchor}${anchorSuffix})`;
            });

            // Auto-link model names to their definitions (first occurrence only)
            for (const modelName of Array.from(modelDefinitions.keys())) {
                const modelAnchor = modelName.toLowerCase();
                // Match `ModelName` but only if not already linked
                const modelPattern = new RegExp(`\`${modelName}\`(?!\\])`, '');
                if (modelPattern.test(eventsContent)) {
                    // Replace first occurrence only
                    eventsContent = eventsContent.replace(modelPattern, `[\`${modelName}\`](#${modelAnchor})`);
                }
            }
        } else {
            // No drop-in events extracted from source
            // ALWAYS state drop-in event status first
            eventsContent = 'Does not emit any drop-in events.';

            // Then add ACDL or other context if provided in enrichment
            if (enrichment && enrichment.events) {
                eventsContent += '\n\n' + enrichment.events;

                // Still auto-link any event names in the enrichment (if any)
                eventsContent = eventsContent.replace(/`([a-z-]+\/[a-z-]+)`/g, (match, eventName) => {
                    // Skip auto-linking for dropins without events pages
                    const dropinsWithoutEvents = ['personalization'];
                    if (dropinsWithoutEvents.includes(repoName)) {
                        return match; // Return original backticked text without linking
                    }

                    const baseAnchor = eventName.replace(/\//g, '').toLowerCase();

                    // Per-dropin mapping of bidirectional events (emits-and-listens)
                    // Events can be bidirectional in one dropin but only emit in another
                    const emitsAndListensByDropin = {
                        // B2C drop-ins
                        'cart': ['cart/data', 'cart/merged', 'cart/reset', 'cart/updated', 'shipping/estimate'],
                        'checkout': ['cart/data', 'checkout/error', 'checkout/initialized', 'checkout/updated', 'shipping/estimate'],
                        'order': ['order/data'],
                        'product-details': ['pdp/data', 'pdp/values'],
                        'recommendations': ['recommendations/data'],
                        'product-discovery': ['search/error', 'search/loading', 'search/result'],
                        'wishlist': ['wishlist/alert', 'wishlist/data', 'wishlist/reset'],
                        // B2B drop-ins
                        'quote-management': ['quote-management/permissions', 'quote-management/quote-data', 'quote-management/quote-renamed', 'quote-management/quote-sent-for-review', 'quote-management/shipping-address-set'],
                        'purchase-order': ['purchase-order/data', 'purchase-order/refresh'],
                        'requisition-list': ['requisitionList/alert', 'requisitionList/data', 'requisitionLists/data'],
                        'company-switcher': ['companyContext/changed'],
                        'company-management': ['auth/permissions']
                    };

                    // Default to -emits since most events only have an "Emits" section
                    let anchorSuffix = '-emits';
                    const dropinBidirectionalEvents = emitsAndListensByDropin[repoName] || [];
                    if (dropinBidirectionalEvents.includes(eventName)) {
                        anchorSuffix = '-emits-and-listens';
                    }
                    // Use /dropins-b2b/ for B2B drop-ins, /dropins/ for B2C
                    const basePath = repoConfig.type === 'B2B' ? '/dropins-b2b' : '/dropins';
                    return `[\`${eventName}\`](${basePath}/${repoName}/events/#${baseAnchor}${anchorSuffix})`;
                });
            }
        }

        functionsContent += `### Events\n\n${eventsContent}\n\n`;

        // Add Returns section from TypeScript return type
        // ALWAYS add a Returns section for every function
        let returnsContent = '';

        if (signature && signature.returnType) {
            let returnType = signature.returnType;

            // Extract the actual type from Promise<Type>
            const promiseMatch = returnType.match(/^Promise<(.+)>$/);
            const actualType = promiseMatch ? promiseMatch[1] : returnType;

            // Check if this is a shared model that should be referenced
            let isSharedModel = false;

            for (const modelName of Array.from(modelDefinitions.keys())) {
                // Check if actualType contains this model name
                // Handle cases like "CartModel", "CartModel | null", "CartModel[]"
                const modelPattern = new RegExp(`\\b${modelName}\\b`);
                if (modelPattern.test(actualType)) {
                    isSharedModel = true;
                    const modelAnchor = modelName.toLowerCase();

                    // Create a friendly reference
                    if (actualType === modelName) {
                        returnsContent = `Returns [\`${modelName}\`](#${modelAnchor}).`;
                    } else if (actualType === `${modelName} | null`) {
                        returnsContent = `Returns [\`${modelName}\`](#${modelAnchor}) or \`null\`.`;
                    } else if (actualType === `${modelName}[]`) {
                        returnsContent = `Returns an array of [\`${modelName}\`](#${modelAnchor}) objects.`;
                    } else if (actualType === `${modelName}[] | null` || actualType === `${modelName}[] | undefined`) {
                        returnsContent = `Returns an array of [\`${modelName}\`](#${modelAnchor}) objects or \`null\`.`;
                    } else {
                        // For other complex types with the model
                        // Check if we should use a code block
                        const isComplexObject = actualType.includes('{') && actualType.split(';').length > 2;
                        const isMultiLine = actualType.includes('\n');
                        const isLong = actualType.length > 100;

                        if (isComplexObject || isMultiLine || isLong) {
                            returnsContent = '```ts\n' + actualType + '\n```\n\nSee [`' + modelName + '`](#' + modelAnchor + ').';
                        } else {
                            returnsContent = `Returns \`${actualType}\`. See [\`${modelName}\`](#${modelAnchor}).`;
                        }
                    }
                    break;
                }
            }

            // If not a shared model, just show the return type
            if (!isSharedModel) {
                if (actualType === 'void' || actualType === 'undefined') {
                    returnsContent = 'Returns `void`.';
                } else if (GenericTypeHandler.isGenericType(actualType)) {
                    // For unhelpful generic types (any, unknown, object, etc.), try to extract from source
                    // Check if enrichment provides a returns_source hint
                    let extractedType = null;
                    if (enrichment && enrichment.returns_source) {
                        extractedType = extractTypeFromSource(enrichment.returns_source, repoPath, func.name);
                    }

                    if (extractedType) {
                        // Successfully extracted type from source - use it
                        const description = enrichment.returns || '';
                        if (extractedType.source === 'model') {
                            // For models, reference the Data Models section
                            // Enrichment should be a complete sentence starting with lowercase (e.g., "a Cart model...")
                            // Find the model name in the description and link it
                            const modelNamePattern = new RegExp(`\\b${extractedType.type}\\b`, 'g');
                            if (description.includes(extractedType.type)) {
                                // Replace first occurrence of model name with a link
                                const linkedDescription = description.replace(modelNamePattern, `[\`${extractedType.type}\`](#${extractedType.type.toLowerCase()})`);
                                returnsContent = `Returns ${linkedDescription}.`;
                            } else {
                                // Fallback: append the model link at the end
                                returnsContent = `Returns ${description} [\`${extractedType.type}\`](#${extractedType.type.toLowerCase()}).`;
                            }

                            // Also extract and track the full model definition
                            if (extractedType.fullDefinition) {
                                if (!modelDefinitions.has(extractedType.type)) {
                                    modelDefinitions.set(extractedType.type, { definition: extractedType.fullDefinition, count: 0, functions: [] });
                                }
                                const modelData = modelDefinitions.get(extractedType.type);
                                modelData.count++;
                                modelData.functions.push(func.name);
                            }
                        } else {
                            // For state/graphql, show the definition inline
                            returnsContent = `Returns ${description}: \`${extractedType.definition}\``;
                        }
                    } else if (enrichment && enrichment.returns) {
                        // Fallback to enrichment returns field (legacy format)
                        returnsContent = enrichment.returns;
                    } else {
                        // No enrichment - default to void message
                        returnsContent = 'Returns `void`.';
                    }
                } else if (actualType === 'string') {
                    returnsContent = 'Returns `string`.';
                } else if (actualType === 'number') {
                    returnsContent = 'Returns `number`.';
                } else if (actualType === 'boolean') {
                    returnsContent = 'Returns `boolean`.';
                } else if (actualType.includes('any') && enrichment && enrichment.returns) {
                    // Type contains 'any' but wasn't caught by GenericTypeHandler (e.g., 'any | null')
                    // Use enrichment text if available
                    returnsContent = `Returns ${enrichment.returns}.`;
                } else {
                    // Determine if we should use a code block:
                    // - Complex object types (contains { with multiple properties)
                    // - Multi-line types
                    // - Very long types (> 100 chars)
                    const isComplexObject = actualType.includes('{') && actualType.split(';').length > 2;
                    const isMultiLine = actualType.includes('\n');
                    const isLong = actualType.length > 100;

                    if (isComplexObject || isMultiLine || isLong) {
                        // Show complex types in code block for better readability
                        returnsContent = '```ts\n' + actualType + '\n```';

                        // Add model reference if type references a known model
                        const modelMatch = actualType.match(/(\w+Model)(?:\[\])?/);
                        if (modelMatch && allModels.has(modelMatch[1])) {
                            const modelName = modelMatch[1];
                            const anchor = modelName.toLowerCase();
                            returnsContent += `\n\nSee [\`${modelName}\`](#${anchor}).`;
                        }
                    } else {
                        // Simple types stay inline
                        returnsContent = `Returns \`${actualType}\`.`;
                    }
                }
            }
        } else {
            // No signature found - default message
            returnsContent = 'Returns `void`.';
        }

        // ALWAYS add Returns section
        functionsContent += `### Returns\n\n${returnsContent}\n\n`;

        // Add separator between functions
        functionsContent += `---\n\n`;

        // Note: We don't append funcContent here anymore
        // The description from original MDX is already extracted via cleanFunctionDescription()
        // or overridden by enrichment.description
        // funcContent at this point would just be duplicate descriptive text
    });

    // Show ALL models (not just those used 2+ times)
    // IMPORTANT: This must be AFTER the functions loop since enrichment models are added during processing
    const sharedModels = Array.from(modelDefinitions.keys()).sort();
    const inputModels = Array.from(inputModelDefinitions.keys()).sort();
    const outputModels = Array.from(outputModelDefinitions.keys()).sort();

    // Add Data Models section if there are shared models, input models, or output models
    let dataModelsSection = '';
    if (sharedModels.length > 0 || inputModels.length > 0 || outputModels.length > 0) {
        dataModelsSection = '## Data Models\n\n';
        dataModelsSection += 'The following data models are used by functions in this drop-in.\n\n';

        // Output return type models first (standard models extracted from source)
        for (const modelName of sharedModels) {
            const modelData = modelDefinitions.get(modelName);
            const modelAnchor = modelName.toLowerCase().replace(/model$/, '-model');

            dataModelsSection += `### ${modelName}\n\n`;
            dataModelsSection += `The \`${modelName}\` object is returned by the following functions: `;
            dataModelsSection += modelData.functions.map(fn => `[\`${fn}\`](#${fn.toLowerCase()})`).join(', ');
            dataModelsSection += '.\n\n';
            dataModelsSection += '```ts\n';
            // Clean the definition: remove "export" but keep "interface" or "type" for syntax highlighting
            const cleanedDefinition = modelData.definition
                .replace(/^export\s+(interface\s+)/m, '$1')
                .replace(/^export\s+(type\s+)/m, '$1');
            dataModelsSection += cleanedDefinition;
            dataModelsSection += '\n```\n\n';
        }

        // Output custom return type models (from enrichment output_models)
        for (const modelName of outputModels) {
            const modelData = outputModelDefinitions.get(modelName);

            dataModelsSection += `### ${modelName}\n\n`;
            if (modelData.description) {
                dataModelsSection += `${modelData.description}\n\n`;
            }
            dataModelsSection += `Returned by: `;
            dataModelsSection += modelData.functions.map(fn => `[\`${fn}\`](#${fn.toLowerCase()})`).join(', ');
            dataModelsSection += '.\n\n';
            dataModelsSection += '```ts\n';
            dataModelsSection += modelData.definition;
            dataModelsSection += '\n```\n\n';
        }

        // Output input parameter type models (from enrichment input_models)
        for (const modelName of inputModels) {
            const modelData = inputModelDefinitions.get(modelName);

            dataModelsSection += `### ${modelName}\n\n`;
            if (modelData.description) {
                dataModelsSection += `${modelData.description}\n\n`;
            }
            dataModelsSection += `Used by: `;
            dataModelsSection += modelData.functions.map(fn => `[\`${fn}\`](#${fn.toLowerCase()})`).join(', ');
            dataModelsSection += '.\n\n';
            dataModelsSection += '```ts\n';
            dataModelsSection += modelData.definition;
            dataModelsSection += '\n```\n\n';
        }
    }

    // Print validation report summary
    validationReport.printSummary();

    // Read template and replace placeholders
    const template = readTemplate('dropin-functions.mdx');

    const introText = `The ${repoConfig.displayName} drop-in provides API functions that enable you to programmatically control behavior, fetch data, and integrate with Adobe Commerce backend services.`;

    return replacePlaceholders(template, {
        DROPIN_NAME: repoConfig.displayName,
        DROPIN_DISPLAY_NAME: repoConfig.displayName,
        DROPIN_VERSION: cleanVersion(version),
        INTRO_TEXT: introText,
        FUNCTIONS_TABLE: functionsTable,
        FUNCTIONS_CONTENT: functionsContent + dataModelsSection
    });
}

/**
 * Generate empty functions documentation
 * 
 * @param {string} repoName - Repository name
 * @param {Object} repoConfig - Repository configuration
 * @param {string} version - Package version
 * @returns {string} Generated MDX content
 */
function generateEmptyFunctionsDocs(repoName, repoConfig, versionInfo) {
    // Handle versionInfo object or string
    const version = typeof versionInfo === 'object' ? versionInfo.actual : versionInfo;
    // Use shared empty state generator for clean, consistent output
    return generateNoFunctionsPage({
        dropinDisplayName: repoConfig.displayName,
        version,
        repoUrl: repoConfig.gitUrl.replace('.git', '')
    });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

await runGenerator({
    name: 'Functions',
    itemType: 'functions',
    loadEnrichments: loadFunctionEnrichments,
    scanRepo: scanForFunctions,
    generateContent: generateFunctionsMDX,
    updateSidebar: updateSidebarForFunctions,
    outputFileName: 'functions.mdx'
});

// ============================================================================
// POST-GENERATION VALIDATION
// ============================================================================

console.log('\n🔍 Running post-generation type validation...\n');
validateAllFunctionDocs(projectRoot);

