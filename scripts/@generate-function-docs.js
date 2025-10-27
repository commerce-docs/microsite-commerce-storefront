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
import { cleanVersion } from './lib/utils.js';

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
    // Match: export const functionName = async (...) => {
    // or: export function functionName(...) {
    const patterns = [
        new RegExp(`export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\(([^)]*)\\)\\s*:\\s*([^{]+)`, 's'),
        new RegExp(`export\\s+const\\s+${functionName}\\s*=\\s*\\(([^)]*)\\)\\s*:\\s*([^{]+)`, 's'),
        new RegExp(`export\\s+async\\s+function\\s+${functionName}\\s*\\(([^)]*)\\)\\s*:\\s*([^{]+)`, 's'),
        new RegExp(`export\\s+function\\s+${functionName}\\s*\\(([^)]*)\\)\\s*:\\s*([^{]+)`, 's'),
    ];

    for (const pattern of patterns) {
        const match = tsContent.match(pattern);
        if (match) {
            const params = match[1].trim();
            const returnType = match[2].trim().replace(/\s*=>\s*\{[\s\S]*$/, '').trim();
            return { params, returnType };
        }
    }

    return null;
}

// ============================================================================
// CONTENT GENERATION
// ============================================================================

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

    // Sort functions alphabetically
    functions.sort((a, b) => a.name.localeCompare(b.name));

    const cleanedVersion = cleanVersion(version);

    // Start with frontmatter and imports
    let content = `---
title: ${repoConfig.displayName} functions
description: Learn about the API functions provided by the ${repoConfig.displayName} drop-in component.
sidebar:
  label: Functions
  order: 6
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 2
---

import OptionsTable from '@components/OptionsTable.astro';
import Aside from '@components/Aside.astro';
import CodeInclude from '@components/CodeInclude.astro';

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${cleanedVersion}</strong>
</div>

The **${repoConfig.displayName}** drop-in provides API functions that allow developers to interact with ${repoConfig.displayName.toLowerCase()} functionality programmatically.

`;

    // Add each function's documentation
    functions.forEach(func => {
        // Clean up the MDX content from the source
        let funcContent = func.mdxContent;
        
        // Remove Storybook imports and Meta tags
        funcContent = funcContent.replace(/import\s+{\s*Meta\s*}\s+from\s+['"]@storybook\/blocks['"];?\s*/g, '');
        funcContent = funcContent.replace(/<Meta\s+title=["'][^"']*["']\s*\/>/g, '');
        
        // Remove leading/trailing whitespace
        funcContent = funcContent.trim();
        
        // Remove the first H1 if it matches the function name (we'll add it back with proper formatting)
        funcContent = funcContent.replace(new RegExp(`^#\\s+${func.name}\\s*\\n`, 'i'), '');
        
        // Add the function section with proper heading
        content += `## ${func.name}\n\n`;
        
        // Add the cleaned function content
        content += funcContent + '\n\n';
    });

    return content;
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
    const cleanedVersion = cleanVersion(version);

    return `---
title: ${repoConfig.displayName} functions
description: Learn about the API functions provided by the ${repoConfig.displayName} drop-in component.
sidebar:
  label: Functions
  order: 6
---

import { Aside } from '@astrojs/starlight/components';

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${cleanedVersion}</strong>
</div>

## API Functions

<Aside type="note">
No public API functions are currently documented for this drop-in. This drop-in may operate through containers and events only, or API documentation may be added in a future release.
</Aside>

For information about using this drop-in through its UI containers, see the [Containers](/dropins/${repoName}/) documentation.
`;
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

