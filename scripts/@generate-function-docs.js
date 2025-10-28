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

const projectRoot = getProjectRoot();

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
    // Match: export const functionName = async (...) => { or with explicit return type
    // or: export function functionName(...) { or with explicit return type
    const patterns = [
        // With return type annotation - capture until => { (arrow function body)
        new RegExp(`export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\(([^)]*)\\)\\s*:\\s*([\\s\\S]*?)\\s*=>\\s*\\{`, 's'),
        new RegExp(`export\\s+const\\s+${functionName}\\s*=\\s*\\(([^)]*)\\)\\s*:\\s*([\\s\\S]*?)\\s*=>\\s*\\{`, 's'),
        new RegExp(`export\\s+async\\s+function\\s+${functionName}\\s*\\(([^)]*)\\)\\s*:\\s*([\\s\\S]*?)\\s*\\{`, 's'),
        new RegExp(`export\\s+function\\s+${functionName}\\s*\\(([^)]*)\\)\\s*:\\s*([\\s\\S]*?)\\s*\\{`, 's'),
        // Without return type annotation (implicit)
        new RegExp(`export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\(([^)]*)\\)\\s*=>`, 's'),
        new RegExp(`export\\s+const\\s+${functionName}\\s*=\\s*\\(([^)]*)\\)\\s*=>`, 's'),
        new RegExp(`export\\s+async\\s+function\\s+${functionName}\\s*\\(([^)]*)\\)\\s*\\{`, 's'),
        new RegExp(`export\\s+function\\s+${functionName}\\s*\\(([^)]*)\\)\\s*\\{`, 's'),
    ];

    for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const match = tsContent.match(pattern);
        if (match) {
            const params = match[1].trim();

            // First 4 patterns have explicit return type
            if (i < 4) {
                const returnType = match[2].trim();
                return { params, returnType };
            } else {
                // Last 4 patterns don't have explicit return type - infer it
                const isAsync = i === 4 || i === 6; // async arrow function or async function
                const returnType = isAsync ? 'Promise<any>' : 'any';
                return { params, returnType };
            }
        }
    }

    return null;
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
 * Generate functions MDX content
 * 
 * @param {string} repoName - Repository name (e.g., 'cart')
 * @param {Object} repoConfig - Repository configuration
 * @param {Object} scannedData - Scanned function data
 * @param {string} version - Package version
 * @param {Object} enrichmentData - Optional enrichment data
 * @returns {string} Generated MDX content
 */
function generateFunctionsMDX(repoName, repoConfig, scannedData, version, enrichmentData = null) {
    const { functions } = scannedData;

    if (functions.length === 0) {
        return generateEmptyFunctionsDocs(repoName, repoConfig, version);
    }

    // Create validation report for source-first validation
    const validationReport = createValidationReport();

    // Sort functions alphabetically
    functions.sort((a, b) => a.name.localeCompare(b.name));

    // First pass: Detect duplicate return models across functions
    const modelDefinitions = new Map(); // modelName -> { definition: string, count: number, functions: string[] }

    if (enrichmentData) {
        functions.forEach(func => {
            const enrichment = enrichmentData[func.name];
            if (enrichment && enrichment.returns) {
                // Check if returns contains a code block (likely a model definition)
                const codeBlockMatch = enrichment.returns.match(/```(?:ts|typescript)\n([\s\S]+?)\n```/);
                if (codeBlockMatch) {
                    const modelCode = codeBlockMatch[1];
                    // Try to extract model name from the code (e.g., "type CartModel = " or "interface CartModel")
                    const modelNameMatch = modelCode.match(/(?:type|interface|export (?:type|interface))\s+(\w+Model)/);
                    if (modelNameMatch) {
                        const modelName = modelNameMatch[1];
                        if (!modelDefinitions.has(modelName)) {
                            modelDefinitions.set(modelName, { definition: modelCode, count: 0, functions: [] });
                        }
                        const modelData = modelDefinitions.get(modelName);
                        modelData.count++;
                        modelData.functions.push(func.name);
                    }
                }
            }
        });
    }

    // Identify models that should be extracted (used 2+ times)
    const sharedModels = Array.from(modelDefinitions.entries())
        .filter(([_, data]) => data.count >= 2)
        .map(([name, _]) => name);

    // Generate function index table (wrapped in TableWrapper with first column nowrap)
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

        // Add the function section with H3 heading (under the "Function details" H2)
        functionsContent += `### ${func.name}\n\n`;

        // Use enriched description if available, otherwise extract and clean from MDX
        let description = enrichment && enrichment.description ? enrichment.description : null;
        if (!description) {
            description = cleanFunctionDescription(func.mdxContent, func.name);
        }
        if (description) {
            functionsContent += `${description}\n\n`;
        }

        // Add TypeScript signature if available (no heading, just the code block)
        // Prefer enrichment signature if available (for manual overrides)
        let signature = func.signature;
        if (enrichment && enrichment.signature) {
            signature = enrichment.signature;
        }

        if (signature) {
            // Keep the full signature as-is from the source code
            // The source already has it formatted nicely with proper indentation
            // Remove trailing => from arrow function syntax for cleaner display
            let returnType = signature.returnType.replace(/\s*=>\s*$/, '');
            let params = signature.params;

            // Format all signatures with parameters on separate lines for consistency and readability
            // Split on commas that are at depth 0 (not inside braces/brackets)
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

            // Add the last parameter (without trailing comma)
            if (currentParam.trim()) {
                formattedParams += '\n  ' + currentParam.trim();
            }

            // Format signature: functionName(\n  params\n): ReturnType
            // Use formatted version for multi-param, or single-line for single param
            if (hasMultipleParams || params.trim().length > 50) {
                // Multi-param or long single param: use formatted style
                functionsContent += `\`\`\`ts\n`;
                functionsContent += `${func.name}(${formattedParams}\n): ${returnType}\n`;
                functionsContent += `\`\`\`\n\n`;
            } else if (params.trim().length > 0) {
                // Short single param: still use formatted style for consistency
                functionsContent += `\`\`\`ts\n`;
                functionsContent += `${func.name}(\n  ${params.trim()}\n): ${returnType}\n`;
                functionsContent += `\`\`\`\n\n`;
            } else {
                // No params: keep simple
                functionsContent += `\`\`\`ts\n`;
                functionsContent += `${func.name}(): ${returnType}\n`;
                functionsContent += `\`\`\`\n\n`;
            }
        }

        // Add Parameters table from enrichment data (no heading, follows signature)
        if (enrichment && enrichment.parameters && Array.isArray(enrichment.parameters) && enrichment.parameters.length > 0) {
            functionsContent += `<TableWrapper nowrap={[0]}>\n\n`;

            // Convert array format to markdown table
            enrichment.parameters.forEach((row, index) => {
                if (index === 0) {
                    // Header row
                    functionsContent += `| ${row.join(' | ')} |\n`;
                    // Separator row
                    functionsContent += `|${row.map(() => '---').join('|')}|\n`;
                } else {
                    // Data rows - escape curly braces in MDX by wrapping in backticks
                    const escapedRow = row.map((cell) => {
                        // In MDX, { and } are special characters - wrap any cell containing them in backticks
                        if ((cell.includes('{') || cell.includes('}')) && !cell.startsWith('`')) {
                            return `\`${cell}\``;
                        }
                        return cell;
                    });
                    functionsContent += `| ${escapedRow.join(' | ')} |\n`;
                }
            });

            functionsContent += `\n</TableWrapper>\n\n`;
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
            functionsContent += `#### Usage\n\n`;

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

        // Add Events section from enrichment data (comes before Returns)
        if (enrichment && enrichment.events) {
            let eventsContent = enrichment.events;

            // Auto-link event names to events documentation
            // Match event names in backticks like `cart/data`, `cart/updated`, etc.
            eventsContent = eventsContent.replace(/`([a-z-]+\/[a-z-]+)`/g, (match, eventName) => {
                // Create base anchor: cart/data -> cartdata
                const baseAnchor = eventName.replace(/\//g, '').toLowerCase();

                // Known event types based on common patterns
                // Most cart events are bidirectional (emits-and-listens)
                const emitsAndListensEvents = ['cart/data', 'cart/updated', 'cart/merged', 'cart/reset', 'shipping/estimate'];
                const emitsOnlyEvents = ['cart/initialized', 'cart/product/added', 'cart/product/removed', 'cart/product/updated'];

                let anchorSuffix = '-emits-and-listens'; // Default

                if (emitsOnlyEvents.includes(eventName)) {
                    anchorSuffix = '-emits';
                } else if (emitsAndListensEvents.includes(eventName)) {
                    anchorSuffix = '-emits-and-listens';
                }
                // Otherwise use default (emits-and-listens)

                // Link to the events page with full anchor (use relative path without trailing slash)
                return `[\`${eventName}\`](../events#${baseAnchor}${anchorSuffix})`;
            });

            // Auto-link model names to their definitions (first occurrence only)
            for (const modelName of sharedModels) {
                const modelAnchor = modelName.toLowerCase();
                // Match `ModelName` but only if not already linked
                const modelPattern = new RegExp(`\`${modelName}\`(?!\\])`, '');
                if (modelPattern.test(eventsContent)) {
                    // Replace first occurrence only
                    eventsContent = eventsContent.replace(modelPattern, `[\`${modelName}\`](#${modelAnchor})`);
                }
            }

            functionsContent += `#### Events\n\n${eventsContent}\n\n`;
        }

        // Add Returns section from enrichment data (comes after Events)
        if (enrichment && enrichment.returns) {
            let returnsContent = enrichment.returns;

            // Check if this function's returns contains a shared model definition
            // If so, replace the full definition with a reference
            for (const modelName of sharedModels) {
                const codeBlockPattern = new RegExp(`\`\`\`(?:ts|typescript)\\n[\\s\\S]*?(?:type|interface|export (?:type|interface))\\s+${modelName}[\\s\\S]*?\`\`\``, 'g');
                if (codeBlockPattern.test(returnsContent)) {
                    // Replace the full code block with a reference
                    // Starlight generates anchors as all lowercase, no special chars
                    const modelAnchor = modelName.toLowerCase();
                    returnsContent = returnsContent.replace(
                        codeBlockPattern,
                        `See [\`${modelName}\`](#${modelAnchor}) structure below.`
                    );

                    // Remove redundant sentences now that we have a reference link
                    // Remove "The X object has the following shape:"
                    returnsContent = returnsContent.replace(
                        /\.\s+The\s+`?\w+`?\s+object\s+has\s+the\s+following\s+shape:\s*/gi,
                        '. '
                    );

                    // Remove "Returns a promise that resolves to a X object or null." when followed by "See"
                    // This makes it just "See [`ModelName`](#modelname) structure below."
                    returnsContent = returnsContent.replace(
                        new RegExp(`Returns a promise that resolves to (?:a |an )?\`?${modelName}\`? object(?: or null)?\\. See`, 'i'),
                        'See'
                    );
                }
            }

            functionsContent += `#### Returns\n\n${returnsContent}\n\n`;
        }

        // Note: We don't append funcContent here anymore
        // The description from original MDX is already extracted via cleanFunctionDescription()
        // or overridden by enrichment.description
        // funcContent at this point would just be duplicate descriptive text
    });

    // Add Data Models section if there are shared models
    let dataModelsSection = '';
    if (sharedModels.length > 0) {
        dataModelsSection = '## Data Models\n\n';
        dataModelsSection += 'The following data models are returned by multiple functions in this drop-in.\n\n';

        for (const modelName of sharedModels) {
            const modelData = modelDefinitions.get(modelName);
            const modelAnchor = modelName.toLowerCase().replace(/model$/, '-model');

            dataModelsSection += `### ${modelName}\n\n`;
            dataModelsSection += `The \`${modelName}\` object is returned by the following functions: `;
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

    return replacePlaceholders(template, {
        DROPIN_NAME: repoConfig.displayName,
        DROPIN_DISPLAY_NAME: repoConfig.displayName,
        DROPIN_VERSION: cleanVersion(version),
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
function generateEmptyFunctionsDocs(repoName, repoConfig, version) {
    const functionsContent = `<Aside type="note">
No public API functions are currently documented for this drop-in. This drop-in may operate through containers and events only, or API documentation may be added in a future release.
</Aside>

For information about using this drop-in through its UI containers, see the [Containers](/dropins/${repoName}/) documentation.`;

    // Use template with placeholder content
    const template = readTemplate('dropin-functions.mdx');

    return replacePlaceholders(template, {
        DROPIN_NAME: repoConfig.displayName,
        DROPIN_DISPLAY_NAME: repoConfig.displayName,
        DROPIN_VERSION: cleanVersion(version),
        FUNCTIONS_CONTENT: functionsContent
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

