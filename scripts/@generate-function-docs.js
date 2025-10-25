#!/usr/bin/env node

/**
 * Function Documentation Generator
 * 
 * This script generates function documentation for drop-in components by:
 * 1. Reading boilerplate package.json to determine versions
 * 2. Cloning/updating source repositories at specific versions
 * 3. Scanning source code for function directories in src/api/
 * 4. Extracting TypeScript function signatures and documentation
 * 5. Generating comprehensive MDX documentation
 * 
 * USAGE:
 * - Generate all drop-ins: npm run generate-function-docs
 * - Generate single drop-in: npm run generate-function-docs cart
 * - Available drop-ins: cart, checkout, order, product-details, product-discovery,
 *                       recommendations, user-account, user-auth, wishlist,
 *                       payment-services, company-management
 * 
 * TEMPLATE RELATIONSHIP:
 * - Reads structure from: _dropin-templates/dropin-functions.mdx
 * - Uses: Frontmatter, imports, intro text, FUNCTIONS_CONTENT placeholder
 * - Generates independently: Function sections with signatures and examples
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import shared utilities
import { loadFunctionEnrichments } from './lib/enrichment.js';
import { updateSidebarForFunctions } from './lib/sidebar.js';
import { runGenerator, getProjectRoot } from './lib/generator-core.js';
import { readTemplate, replacePlaceholders } from './lib/markdown.js';
import { cleanVersion } from './lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = getProjectRoot();

function scanForFunctions(repoPath) {
    const apiPath = join(repoPath, 'src', 'api');

    if (!existsSync(apiPath)) {
        return [];
    }

    const functions = [];
    const entries = readdirSync(apiPath, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'graphql' && entry.name !== 'fetch-graphql') {
            const funcPath = join(apiPath, entry.name);
            const mdxPath = join(funcPath, `${entry.name}.mdx`);
            const tsPath = join(funcPath, `${entry.name}.ts`);

            if (existsSync(mdxPath)) {
                functions.push({
                    name: entry.name,
                    mdxPath,
                    tsPath: existsSync(tsPath) ? tsPath : null
                });
            }
        }
    }

    return functions;
}

function extractFunctionInfo(functionData, enrichmentData = null) {
    const mdxContent = readFileSync(functionData.mdxPath, 'utf8');

    // Extract function name from path
    const functionName = functionData.name;

    // Check if we have enrichment data for this function
    const enrichment = enrichmentData && enrichmentData[functionName] ? enrichmentData[functionName] : null;

    // Use enriched description if available, otherwise extract from MDX
    let description;
    if (enrichment && enrichment.description) {
        description = enrichment.description;
    } else {
        // Extract description (first paragraph after h1)
        const descMatch = mdxContent.match(/^# \w+\n\n(.+?)$/m);
        description = descMatch ? descMatch[1] : 'API function for the drop-in.';

        // Filter out placeholder/test descriptions BEFORE cleaning
        const placeholders = [
            /howdy world/i,
            /hello world/i,
            /test function/i,
            /todo/i,
            /placeholder/i,
            /^A function that/i,
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
                .replace(/"\.$/, '');
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
    }

    // Use enriched usage if available, otherwise extract from MDX
    let examples = '';
    if (enrichment && enrichment.usage) {
        // Format the enriched usage as a code block if it's not already
        if (!enrichment.usage.includes('```')) {
            examples = `\`\`\`ts\n${enrichment.usage}\n\`\`\``;
        } else {
            examples = enrichment.usage;
        }
    } else {
        // Extract usage section (try both "## Usage Examples" and "## Examples")
        let usageMatch = mdxContent.match(/## Usage Examples\n\n([\s\S]+?)(?=\n## |\n---|\n$)/);
        if (!usageMatch) {
            usageMatch = mdxContent.match(/## Examples\n\n([\s\S]+?)(?=\n## |\n---|\n$)/);
        }
        if (!usageMatch) {
            const usageBlockMatch = mdxContent.match(/## Usage\n\n(```ts\n[\s\S]*?```)/);
            if (usageBlockMatch) {
                usageMatch = [null, usageBlockMatch[1]];
            }
        }
        examples = usageMatch ? usageMatch[1].trim() : '';
    }

    // Extract TypeScript signature if available
    let signature = '';

    // First try to extract from MDX "## Function Signature" section
    const mdxSigMatch = mdxContent.match(/## Function Signature\n\n```ts\n([\s\S]*?)\n```/);
    if (mdxSigMatch) {
        signature = mdxSigMatch[1].trim();
    }

    // Fallback: Try to extract from TypeScript file for async functions
    if (!signature && functionData.tsPath) {
        const tsContent = readFileSync(functionData.tsPath, 'utf8');
        const sigMatch = tsContent.match(/export const \w+ = async \(([\s\S]*?)\): Promise<([\s\S]*?)> =>/);
        if (sigMatch) {
            const params = sigMatch[1].trim();
            const returnType = sigMatch[2].trim();
            signature = `export const ${functionName} = async (\n  ${params}\n): Promise<${returnType}>`;
        }
    }

    // Extract enriched fields if available
    const parameters = enrichment && enrichment.parameters ? enrichment.parameters : null;
    const returns = enrichment && enrichment.returns ? enrichment.returns : null;
    const events = enrichment && enrichment.events ? enrichment.events : null;

    // Handle both old 'usage' field and new 'examples' array
    let examplesList = null;
    if (enrichment) {
        if (enrichment.examples && Array.isArray(enrichment.examples)) {
            examplesList = enrichment.examples;
        } else if (enrichment.usage && !examples) {
            // Backward compatibility: convert single usage to examples array
            examplesList = [{ code: enrichment.usage }];
        }
    }

    return {
        name: functionName,
        description,
        signature,
        examples: examplesList || examples, // Use enriched examples or extracted
        parameters,
        returns,
        events,
        mdxContent
    };
}

function generateDescriptionFromName(functionName) {
    if (functionName.startsWith('publish')) {
        return 'Publishes analytics or tracking events for monitoring and reporting.';
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
    if (functionName.startsWith('initialize')) {
        return 'Initializes the drop-in or component with configuration.';
    }
    if (functionName.startsWith('set')) {
        const subject = functionName.replace(/^set/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Sets or updates ${readableSubject} in the current state.`;
    }
    if (functionName.startsWith('is')) {
        const subject = functionName.replace(/^is/, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return `Checks whether ${readableSubject}.`;
    }
    if (functionName.includes('fetch')) {
        const subject = functionName.replace(/^fetch/, '').replace(/fetch/i, '');
        const readableSubject = subject.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        return readableSubject ? `Fetches ${readableSubject} from the Adobe Commerce backend.` : 'Fetches data from the Adobe Commerce backend.';
    }

    return 'API function for the drop-in.';
}

function generateEmptyFunctionsMDX(dropinName, repoConfig, version) {
    const dropinDisplayName = repoConfig.displayName;
    const basePath = repoConfig.type === 'B2B' ? 'dropins-b2b' : 'dropins';

    // Check what documentation sections exist for this drop-in
    const docsPath = join(projectRoot, 'src', 'content', 'docs', basePath, dropinName);
    const hasEvents = existsSync(join(docsPath, 'events.mdx'));
    const hasContainers = existsSync(join(docsPath, 'containers'));

    // Build the alternatives list based on what exists
    let alternatives = [];

    if (hasContainers) {
        alternatives.push('- **Containers** - Pre-built UI components that you can integrate into your storefront. Check the Containers section for available components.');
    }
    if (hasEvents) {
        alternatives.push(`- **Events** - Event-driven communication for state management and integration. See the [Events documentation](/${basePath}/${dropinName}/events/) for details.`);
    }
    alternatives.push('- **Configuration** - Setup and configuration through Adobe Commerce admin panel.');

    const alternativesText = alternatives.length > 0
        ? `\n\nThe ${dropinDisplayName} drop-in provides functionality through:\n\n${alternatives.join('\n')}`
        : '';

    // Generate simplified content for drop-ins that have no functions
    const simplifiedContent = `---
title: ${dropinDisplayName} Functions
description: API functions provided by the ${dropinDisplayName} drop-in for programmatic control and customization.
sidebar:
  label: Functions
  order: 6
---

import { Aside } from '@astrojs/starlight/components';

This drop-in does not currently expose public API functions.

<div style="background-color: var(--sl-color-blue-low); border-left: 4px solid var(--sl-color-blue); padding: 0.75rem 1rem; border-radius: 0.25rem; margin: 1rem 0;">
<strong>Version: ${cleanVersion(version)}</strong>
</div>${alternativesText}

<Aside type="tip">
If you need programmatic control, consider reaching out to Adobe Commerce support or checking the latest drop-in releases for new API functions.
</Aside>
`;
    return simplifiedContent;
}

function generateFunctionsMDX(dropinName, repoConfig, functions, version, enrichmentData = null) {
    // Read template using shared utility
    const template = readTemplate('dropin-functions.mdx');

    // Build functions content
    let functionsContent = '';

    for (const func of functions) {
        const info = extractFunctionInfo(func, enrichmentData);

        functionsContent += `## ${info.name}\n\n`;
        functionsContent += `${info.description}\n\n`;

        if (info.signature) {
            functionsContent += `### Signature\n\n\`\`\`ts\n${info.signature}\n\`\`\`\n\n`;
        }

        // Add Parameters section with OptionsTable if available
        if (info.parameters && Array.isArray(info.parameters) && info.parameters.length > 0) {
            functionsContent += `### Parameters\n\n`;
            functionsContent += `<OptionsTable\n  compact\n  options={[\n`;
            info.parameters.forEach(param => {
                functionsContent += `    ${JSON.stringify(param)},\n`;
            });
            functionsContent += `  ]}\n/>\n\n`;
        }

        // Add Returns section if available
        if (info.returns) {
            functionsContent += `### Returns\n\n${info.returns}\n\n`;
        }

        // Add Events section if available
        if (info.events) {
            functionsContent += `### Events\n\n${info.events}\n\n`;
        }

        // Add Usage/Examples section
        if (info.examples) {
            // Check if it's an array of examples or a simple string
            if (Array.isArray(info.examples)) {
                functionsContent += `### Usage\n\n`;
                info.examples.forEach(example => {
                    if (example.title) {
                        functionsContent += `${example.title}:\n\n`;
                    }
                    if (example.code) {
                        // Check if code already has code block markers
                        if (example.code.includes('```')) {
                            functionsContent += `${example.code}\n\n`;
                        } else {
                            functionsContent += `\`\`\`ts\n${example.code}\n\`\`\`\n\n`;
                        }
                    }
                });
            } else if (typeof info.examples === 'string') {
                functionsContent += `### Usage\n\n${info.examples}\n\n`;
            }
        }

        functionsContent += `---\n\n`;
    }

    // Replace placeholders using shared utility
    return replacePlaceholders(template, {
        'DROPIN_NAME': repoConfig.displayName,
        'DROPIN_PACKAGE': dropinName,
        'DROPIN_VERSION': cleanVersion(version),
        'FUNCTIONS_CONTENT': functionsContent,
        'REPO_URL': repoConfig.gitUrl.replace('.git', '')
    });
}

// Main execution using shared generator framework
runGenerator({
    name: 'Functions',
    itemType: 'functions',
    loadEnrichments: loadFunctionEnrichments,
    scanRepo: scanForFunctions,
    generateContent: (repoName, repoConfig, functions, version, enrichmentData) => {
        // Handle empty functions case
        if (functions.length === 0) {
            return generateEmptyFunctionsMDX(repoName, repoConfig, version);
        }
        return generateFunctionsMDX(repoName, repoConfig, functions, version, enrichmentData);
    },
    updateSidebar: updateSidebarForFunctions,
    outputFileName: 'functions.mdx'
});
